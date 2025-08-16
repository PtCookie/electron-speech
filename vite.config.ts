import { join, normalize } from "node:path";
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

const nodeApiDotnet = (): PluginOption => {
  return {
    name: "node-api-dotnet",
    transform(code, id) {
      if (id.endsWith("node_modules/node-api-dotnet/init.js")) {
        // Refactor commonjs to ESM
        const bundleRoot = join(import.meta.dirname, "modules/SystemSpeech", "node_modules/node-api-dotnet");

        code =
          `import { join } from "node:path";\n` +
          `import { createRequire } from "node:module";\n` +
          `const require = createRequire(import.meta.url);\n` +
          `const bundleRoot = ${JSON.stringify(bundleRoot)};\n` +
          code;
        code = code.replace("module.exports = initialize", "export default initialize");

        // Replace a relative path of assemblyName with an absolute path
        const assemblyName = "Microsoft.JavaScript.NodeApi";
        code = code.replace(
          /require\(`\.\/(.+?)\/\$\{assemblyName\}\.node`\)/g,
          "require(join(bundleRoot, `./$1/" + assemblyName + ".node`))",
        );

        // Resolve relative path of nativeHost and managedHostPath
        code = code.replace(
          "nativeHost = require(__dirname + `/${rid}/${assemblyName}.node`)",
          "nativeHost = require(join(bundleRoot, `./${rid}/${assemblyName}.node`))",
        );
        code = code.replace(
          "const managedHostPath = __dirname + `/${targetFramework}/${assemblyName}.DotNetHost.dll`",
          "const managedHostPath = join(bundleRoot, `./${targetFramework}/${assemblyName}.DotNetHost.dll`)",
        );

        return code;
      }

      const normalizeId = normalize(id);
      const assemblyRoot = normalize(join(import.meta.dirname, "modules/SystemSpeech/bin"));

      if (normalizeId.startsWith(assemblyRoot)) {
        // Replace import.meta.url with a constant value
        code = code.replace("import { fileURLToPath } from 'node:url';", "");
        code = code.replace(
          "const __filename = fileURLToPath(import.meta.url)",
          `const __filename = ${JSON.stringify(normalizeId)}`,
        );

        return code;
      }

      return code;
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
          plugins: [tsconfigPaths(), copyAddons(), nodeApiDotnet()],
          build: {
            target: "node22",
            rollupOptions: {
              external: ["./modules/*"],
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
