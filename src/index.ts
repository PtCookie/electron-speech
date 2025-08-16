import { app, BrowserWindow, type Extension, session } from "electron";
import { installExtension, REACT_DEVELOPER_TOOLS } from "electron-devtools-installer";
import { join } from "node:path";
import { env, platform } from "node:process";
import { formatISO } from "date-fns";

import ipcMain from "@/ipc/main.ts";
import { logger } from "@/lib/logger.ts";

const isDev = import.meta.env.DEV || !app.isPackaged;

env.APP_ROOT = join(import.meta.dirname, "..");

export const VITE_DEV_SERVER_URL = env.VITE_DEV_SERVER_URL;
export const MAIN_DIST = join(env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = join(env.APP_ROOT, "dist");

env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? join(env.APP_ROOT, "public") : RENDERER_DIST;

// Add Chromium flags as workaround for Wayland desktop with NVIDIA GPU.
if (platform === "linux" && env.XDG_SESSION_TYPE === "wayland") {
  logger.silly(`Wayland detected.`);

  app.commandLine.appendSwitch("ozone-platform-hint", "auto");
  app.commandLine.appendSwitch("disable-accelerated-video-decode");
  app.commandLine.appendSwitch("enable-wayland-ime");
}

async function createWindow(): Promise<void> {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(MAIN_DIST, "preload.mjs"),
      devTools: isDev,
    },
  });

  // and load the index.html of the app.
  if (VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(VITE_DEV_SERVER_URL);

    // Open the DevTools if not in production.
    mainWindow.webContents.openDevTools();
  } else {
    await mainWindow.loadFile(join(RENDERER_DIST, "index.html"));
  }
}

// Workaround to load extensions(https://github.com/electron/electron/issues/41613#issuecomment-2644018998).
async function launchExtensionBackgroundWorkers(ses = session.defaultSession): Promise<void[]> {
  return Promise.all(
    ses.extensions.getAllExtensions().map(async (extension: Extension) => {
      const manifest = extension.manifest;
      if (manifest.manifest_version === 3 && manifest?.background?.service_worker) {
        await ses.serviceWorkers.startWorkerForScope(extension.url);
      }
    }),
  );
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  logger.debug(`${app.getName()} v${app.getVersion()} is ready at ${formatISO(new Date())}.`);

  if (isDev) {
    logger.info("Load dev tools...");

    try {
      const extensions = await installExtension([REACT_DEVELOPER_TOOLS]);

      for (const ext of extensions) {
        logger.info(`Added Extension: ${ext.name} v${ext.version}`);
      }
    } catch (error) {
      logger.error("Failed to load extensions: ", (error as Error).message);
    }
  }

  await launchExtensionBackgroundWorkers();
  await createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", async () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", async () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    await launchExtensionBackgroundWorkers();
    await createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
ipcMain();
