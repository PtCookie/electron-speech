import dotnet from "node-api-dotnet";

import "./bin/System.Speech.js";

const Synthesis = dotnet.System.Speech.Synthesis;
const SpeechSynthesizer = Synthesis.SpeechSynthesizer;

interface SpeechOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

class SystemSpeech {
  static #synthesizer: dotnet.System.Speech.Synthesis.SpeechSynthesizer;

  static #getSynthesizer(): dotnet.System.Speech.Synthesis.SpeechSynthesizer {
    if (!this.#synthesizer) {
      this.#synthesizer = new SpeechSynthesizer();
    }

    return this.#synthesizer;
  }

  static speak(text: string, options: SpeechOptions = {}): void {
    if (typeof text !== "string") {
      throw new TypeError("Text must be a string");
    }

    const synthesizer = SystemSpeech.#getSynthesizer();

    const defaultOptions = {
      voice: "",
      rate: 0.5,
      pitch: 1.0,
      volume: 1.0,
    };

    const finalOptions = { ...defaultOptions, ...options };

    // Check value is within valid ranges
    if (finalOptions.rate < 0.0 || finalOptions.rate > 1.0) {
      throw new RangeError("Rate must be between 0.0 and 1.0");
    }
    if (finalOptions.pitch < 0.5 || finalOptions.pitch > 2.0) {
      throw new RangeError("Pitch must be between 0.5 and 2.0");
    }
    if (finalOptions.volume < 0.0 || finalOptions.volume > 1.0) {
      throw new RangeError("Volume must be between 0.0 and 1.0");
    }

    try {
      // Set volume (0-100 for Windows Speech API)
      synthesizer.Volume = Math.round(finalOptions.volume * 100);

      // Set rate (-10 to 10 for Windows Speech API, convert from 0.0-1.0)
      synthesizer.Rate = Math.round((finalOptions.rate - 0.5) * 20);

      // Set voice if specified
      if (finalOptions.voice) {
        try {
          synthesizer.SelectVoice(finalOptions.voice);
        } catch (error) {
          console.warn(error);
          console.warn(`Voice '${finalOptions.voice}' not found, using default voice`);
        }
      }

      // Speak the text asynchronously
      synthesizer.SpeakAsync(text);
    } catch (error) {
      console.error("Failed to speak text:", error);

      throw error;
    }
  }

  /**
   * Pause the current speech playback
   *
   * @returns {boolean} Success status
   */
  static pause(): boolean {
    try {
      SystemSpeech.#getSynthesizer().Pause();

      return true;
    } catch (error) {
      console.error("Failed to pause speech:", error);

      return false;
    }
  }

  /**
   * Resume the paused speech playback
   *
   * @returns {boolean} Success status
   */
  static resume(): boolean {
    try {
      SystemSpeech.#getSynthesizer().Resume();

      return true;
    } catch (error) {
      console.error("Failed to resume speech:", error);

      return false;
    }
  }

  /**
   * Stop the current speech playback
   *
   * @returns {boolean} Success status
   */
  static stop(): boolean {
    try {
      SystemSpeech.#getSynthesizer().SpeakAsyncCancelAll();

      return true;
    } catch (error) {
      console.error("Failed to stop speech:", error);

      return false;
    }
  }

  /**
   * Check speech synthesizer state
   *
   * @returns {string} "Ready" | "Speaking" | "Paused"
   */
  static state(): SpeechState {
    try {
      const synthesizer = SystemSpeech.#getSynthesizer();

      return Synthesis.SynthesizerState[synthesizer.State] as SpeechState;
    } catch (error) {
      console.error("Failed to check speaking state:", error);

      return "Ready";
    }
  }

  /**
   * Dispose the synthesizer resources
   */
  static dispose(): void {
    if (SystemSpeech.#getSynthesizer()) {
      try {
        SystemSpeech.#getSynthesizer().dispose();
      } catch (error) {
        console.error("Failed to dispose synthesizer:", error);
      }
    }
  }
}

export { SystemSpeech };
