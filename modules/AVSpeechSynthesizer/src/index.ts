import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const addon = require("./AVSpeechSynthesizer.node");

type SpeechOptions = {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
};

type Voice = {
  identifier: string;
  name: string;
  language: string;
};

class AVSpeechSynthesizer {
  /**
   * Speak the given text with specified options
   *
   * @param {string} text Text to be spoken
   * @param {Object} options Options for speech synthesis
   * @param {string} options.voice Voice identifier (default: system default voice)
   * @param {number} options.rate Speech rate (0.0 ~ 1.0, default: 0.5)
   * @param {number} options.pitch Pitch of the speech (0.5 ~ 2.0, default: 1.0)
   * @param {number} options.volume Volume of the speech (0.0 ~ 1.0, default: 1.0)
   *
   * @throws {TypeError} If text is not a string
   * @throws {RangeError} If options values are out of range
   *
   * @returns {void}
   */
  static speak(text: string, options: SpeechOptions = {}): void {
    if (typeof text !== "string") {
      throw new TypeError("Text must be a string");
    }

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

    addon.speak(text, finalOptions);
  }

  /**
   * Pause the current speech playback
   *
   * @returns {boolean} Success status
   */
  static pause(): boolean {
    return addon.pause();
  }

  /**
   * Resume the paused speech playback
   *
   * @returns {boolean} Success status
   */
  static resume(): boolean {
    return addon.resume();
  }

  /**
   * Stop the current speech playback
   *
   * @returns {boolean} Success status
   */
  static stop(): boolean {
    return addon.stop();
  }

  /**
   * Check if the speech synthesizer is currently speaking
   *
   * @returns {boolean} True if speaking, false otherwise
   */
  static isSpeaking(): boolean {
    return addon.isSpeaking();
  }

  /**
   * Check if the speech synthesizer is currently paused
   *
   * @returns {boolean} True if paused, false otherwise
   */
  static isPaused(): boolean {
    return addon.isPaused();
  }

  /**
   * Get the list of available voices
   *
   * @returns {Array} List of available voices
   */
  static getVoices(): Array<Voice> {
    return addon.getVoices();
  }

  /**
   * Return the current status of the speech synthesizer
   *
   * @returns {Object} Current status
   */
  static getStatus(): { isSpeaking: boolean; isPaused: boolean } {
    return {
      isSpeaking: this.isSpeaking(),
      isPaused: this.isPaused(),
    };
  }

  /**
   * Print debug information about the speech synthesizer
   */
  static printDebugInfo(): void {
    if (addon.printDebugInfo) {
      addon.printDebugInfo();
    } else {
      console.log("Debug info not available");
    }
  }
}

const speak = (text: string, options: SpeechOptions = {}) => AVSpeechSynthesizer.speak(text, options);
const pause = () => AVSpeechSynthesizer.pause();
const resume = () => AVSpeechSynthesizer.resume();
const stop = () => AVSpeechSynthesizer.stop();
const isSpeaking = () => AVSpeechSynthesizer.isSpeaking();
const isPaused = () => AVSpeechSynthesizer.isPaused();
const getVoices = () => AVSpeechSynthesizer.getVoices();
const getStatus = () => AVSpeechSynthesizer.getStatus();
const printDebugInfo = () => AVSpeechSynthesizer.printDebugInfo();

export { AVSpeechSynthesizer, speak, pause, resume, stop, isSpeaking, isPaused, getVoices, getStatus, printDebugInfo };
