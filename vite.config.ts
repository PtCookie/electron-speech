import { join } from "node:path";
import { copyFileSync, readdirSync, statSync } from "node:fs";
import { defineConfig, type PluginOption } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import electron from "vite-plugin-electron/simple";

const copyAddons = (): PluginOption => {
  return {
    name: "copy-addons",
    generateBundle() {
      const modulesDir = "./modules";
      const targetDir = "./dist-electron";

      const moduleNames = readdirSync(modulesDir).filter((name) => {
        const modulePath = join(modulesDir, name);

        return statSync(modulePath).isDirectory();
      });

      if (moduleNames.length === 0) return;

      for (const moduleName of moduleNames) {
        const sourceDir = join(modulesDir, moduleName);
        const items = readdirSync(sourceDir);

        for (const item of items) {
          if (item.endsWith(".node")) {
            copyFileSync(`${sourceDir}/${item}`, `${targetDir}/${item}`);
          }
        }
      }
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    react(),
    electron({
      main: {
        // Shortcut of `build.lib.entry`.
        entry: "src/index.ts",
        vite: {
          plugins: [tsconfigPaths(), copyAddons()],
          build: {
            target: "node22",
            rollupOptions: {
              external: ["./modules/AVSpeechSynthesizer"],
            },
          },
        },
      },
      preload: {
        // Shortcut of `build.rollupOptions.input`.
        // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
        input: join(import.meta.dirname, "src/ipc/preload.ts"),
      },
      // https://github.com/electron-vite/vite-plugin-electron-renderer/issues/78#issuecomment-2053600808
      renderer: process.env.NODE_ENV === "test" ? undefined : {},
    }),
  ],
});
