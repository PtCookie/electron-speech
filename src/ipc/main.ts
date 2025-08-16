import { ipcMain } from "electron";
import { platform, arch } from "node:os";

import { logger } from "@/lib/logger.ts";
import { SystemSpeech } from "@modules/SystemSpeech";
import { AVSpeechSynthesizer } from "@modules/AVSpeechSynthesizer";

export default () => {
  ipcMain.handle("system:info", async (): Promise<ISystemInfo> => {
    return {
      platform: platform(),
      arch: arch(),
    };
  });

  ipcMain.handle("system:speech-synthesis", async (_, cmd: SpeechCommand, text?: string): Promise<boolean> => {
    const currentPlatform = platform();

    try {
      if (currentPlatform === "win32") {
        switch (cmd) {
          case "speak": {
            if (!text) break;

            const speaking = SystemSpeech.state() === "Speaking";

            if (speaking) {
              SystemSpeech.stop();
            }

            SystemSpeech.speak(text);
            break;
          }
          case "stop": {
            SystemSpeech.stop();
            break;
          }
          case "pause": {
            SystemSpeech.pause();
            break;
          }
          case "resume": {
            SystemSpeech.resume();
            break;
          }
        }

        return true;
      } else if (currentPlatform === "darwin") {
        switch (cmd) {
          case "speak": {
            if (!text) break;

            const speaking = AVSpeechSynthesizer.isSpeaking();

            if (speaking) {
              AVSpeechSynthesizer.stop();
            }

            AVSpeechSynthesizer.speak(text);
            break;
          }
          case "stop": {
            AVSpeechSynthesizer.stop();
            break;
          }
          case "pause": {
            AVSpeechSynthesizer.pause();
            break;
          }
          case "resume": {
            AVSpeechSynthesizer.resume();
            break;
          }
        }

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
    const currentPlatform = platform();

    try {
      if (currentPlatform === "win32") {
        return SystemSpeech.state();
      } else if (currentPlatform === "darwin") {
        if (AVSpeechSynthesizer.isSpeaking()) {
          return "Speaking";
        } else if (AVSpeechSynthesizer.isPaused()) {
          return "Paused";
        }

        return "Ready";
      } else {
        logger.info("Speech synthesis is not supported on this platform.");

        return "Ready";
      }
    } catch (error) {
      logger.error("Failed to get speech synthesizer state:", error);

      return "Ready";
    }
  });
};
