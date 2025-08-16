import { join } from "node:path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import electron from "vite-plugin-electron/simple";

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
          plugins: [tsconfigPaths()],
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
