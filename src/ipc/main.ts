import { ipcMain } from "electron";
import { platform, arch } from "node:os";

export default () => {
  ipcMain.handle("system:info", () => {
    return {
      platform: platform(),
      arch: arch(),
    };
  });
};
