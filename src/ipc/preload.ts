import { contextBridge, ipcRenderer } from "electron";

declare global {
  interface Window {
    systemAPI: {
      systemInfo: () => Promise<ISystemInfo>;
    };
  }

  interface ISystemInfo {
    platform: NodeJS.Platform;
    arch: string;
  }
}

contextBridge.exposeInMainWorld("systemAPI", {
  systemInfo: (): Promise<ISystemInfo> => ipcRenderer.invoke("system:info"),
});
