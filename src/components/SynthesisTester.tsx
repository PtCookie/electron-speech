import React, { useState } from "react";

import { Button } from "@/components/ui/button.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";

export function SynthesizerTester() {
  const [text, setText] = useState<string>(
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const handleSpeak = async () => {
    if (!text.trim()) return;

    try {
      setIsPlaying(true);
      setIsPaused(false);

      const result = await window.systemAPI.speechSynthesis("speak", text);

      if (!result) {
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("TTS Error:", error);

      setIsPlaying(false);
    }
  };

  const handlePause = async () => {
    if (!isPlaying || isPaused) return;

    try {
      const result = await window.systemAPI.speechSynthesis("pause");

      if (result) {
        setIsPaused(true);
      }
    } catch (error) {
      console.error("TTS Pause Error:", error);
    }
  };

  const handleResume = async () => {
    if (!isPaused) return;

    try {
      const result = await window.systemAPI.speechSynthesis("resume");

      if (result) {
        setIsPaused(false);
      }
    } catch (error) {
      console.error("TTS Resume Error:", error);
    }
  };

  const handleStop = async () => {
    if (!isPlaying && !isPaused) return;

    try {
      const result = await window.systemAPI.speechSynthesis("stop");

      if (result) {
        setIsPlaying(false);
        setIsPaused(false);
      }
    } catch (error) {
      console.error("TTS Stop Error:", error);
    }
  };

  return (
    <div className="my-6 rounded-lg border p-4">
      <div className="mb-4">
        <label htmlFor="tts-text" className="mb-2 block text-sm font-medium">
          Text to speak
        </label>
        <Textarea
          id="tts-text"
          placeholder="Enter text to speak"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSpeak} disabled={isPlaying || !text.trim()}>
          Play
        </Button>
        <Button onClick={handlePause} disabled={!isPlaying || isPaused} variant="secondary">
          Pause
        </Button>
        <Button onClick={handleResume} disabled={!isPaused} variant="secondary">
          Resume
        </Button>
        <Button onClick={handleStop} disabled={!isPlaying && !isPaused} variant="destructive">
          Stop
        </Button>
      </div>
    </div>
  );
}
