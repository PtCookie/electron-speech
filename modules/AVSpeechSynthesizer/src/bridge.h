#ifndef _BRIDGE_H
#define _BRIDGE_H

#include <string>
#include <vector>

class SpeechBridge {
public:
  static void speak(const std::string &text, const std::string &voice = "",
                    float rate = 0.5f, float pitch = 1.0f, float volume = 1.0f);
  static bool pauseSpeaking();
  static bool continueSpeaking();
  static bool stopSpeaking();
  static bool isSpeaking();
  static bool isPaused();
  static std::vector<std::string> getAvailableVoices();
  static void printDebugInfo();
};
#endif // _BRIDGE_H
