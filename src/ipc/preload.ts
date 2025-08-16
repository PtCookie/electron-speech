import { contextBridge, ipcRenderer } from "electron";

declare global {
  interface Window {
    systemAPI: {
      systemInfo: () => Promise<ISystemInfo>;
      speechSynthesis: (cmd: SpeechCommand, text?: string) => Promise<boolean>;
      synthesizerState: () => Promise<SpeechState>;
    };
  }

  type SpeechCommand = "speak" | "pause" | "resume" | "stop";
  type SpeechState = "Ready" | "Speaking" | "Paused";

  interface ISystemInfo {
    platform: NodeJS.Platform;
    arch: string;
  }
}

contextBridge.exposeInMainWorld("systemAPI", {
  systemInfo: (): Promise<ISystemInfo> => ipcRenderer.invoke("system:info"),
  speechSynthesis: (cmd: SpeechCommand, text?: string): Promise<boolean> =>
    ipcRenderer.invoke("system:speech-synthesis", cmd, text),
  synthesizerState: () => ipcRenderer.invoke("system:synthesizer-state"),
});
