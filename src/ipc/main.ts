import { ipcMain } from "electron";
import { platform, arch } from "node:os";

import { logger } from "@/lib/logger.ts";

export default () => {
  ipcMain.handle("system:info", async (): Promise<ISystemInfo> => {
    return {
      platform: platform(),
      arch: arch(),
    };
  });

  ipcMain.handle("system:speech-synthesis", async (_, cmd: SpeechCommand, text?: string): Promise<boolean> => {
    const currentPlatform = platform();

    logger.debug(`Speech synthesis command: ${cmd}, text: ${text}`);

    try {
      if (currentPlatform === "win32") {
        return true;
      } else {
        logger.info("Speech synthesis is not supported on this platform.");

        return true;
      }
    } catch (error) {
      logger.error("Failed to execute speech synthesis:", error);

      return false;
    }
  });

  ipcMain.handle("system:synthesizer-state", async (): Promise<SpeechState> => {
    return "Ready";
  });
};
