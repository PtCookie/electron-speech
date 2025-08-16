#include "bridge.h"
#include <napi.h>

Napi::Value Speak(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  if (info.Length() < 1) {
    Napi::TypeError::New(env, "Expected at least 1 argument")
        .ThrowAsJavaScriptException();
    return env.Null();
  }

  std::string text = info[0].As<Napi::String>().Utf8Value();

  std::string voice = "";
  float rate = 0.5f;
  float pitch = 1.0f;
  float volume = 1.0f;

  if (info.Length() > 1 && info[1].IsObject()) {
    Napi::Object options = info[1].As<Napi::Object>();

    if (options.Has("voice")) {
      voice = options.Get("voice").As<Napi::String>().Utf8Value();
    }
    if (options.Has("rate")) {
      rate = options.Get("rate").As<Napi::Number>().FloatValue();
    }
    if (options.Has("pitch")) {
      pitch = options.Get("pitch").As<Napi::Number>().FloatValue();
    }
    if (options.Has("volume")) {
      volume = options.Get("volume").As<Napi::Number>().FloatValue();
    }
  }

  SpeechBridge::speak(text, voice, rate, pitch, volume);

  return env.Null();
}

Napi::Value Pause(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  bool success = SpeechBridge::pauseSpeaking();

  return Napi::Boolean::New(env, success);
}

Napi::Value Resume(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  bool success = SpeechBridge::continueSpeaking();

  return Napi::Boolean::New(env, success);
}

Napi::Value Stop(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  bool success = SpeechBridge::stopSpeaking();

  return Napi::Boolean::New(env, success);
}

Napi::Value IsSpeaking(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  bool speaking = SpeechBridge::isSpeaking();

  return Napi::Boolean::New(env, speaking);
}

Napi::Value IsPaused(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  bool paused = SpeechBridge::isPaused();

  return Napi::Boolean::New(env, paused);
}

Napi::Value GetVoices(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();

  std::vector<std::string> voices = SpeechBridge::getAvailableVoices();
  Napi::Array result = Napi::Array::New(env, voices.size());

  for (size_t i = 0; i < voices.size(); i++) {
    std::string voiceInfo = voices[i];
    size_t firstPipe = voiceInfo.find('|');
    size_t secondPipe = voiceInfo.find('|', firstPipe + 1);

    Napi::Object voiceObj = Napi::Object::New(env);
    voiceObj.Set("identifier", voiceInfo.substr(0, firstPipe));
    voiceObj.Set("name",
                 voiceInfo.substr(firstPipe + 1, secondPipe - firstPipe - 1));
    voiceObj.Set("language", voiceInfo.substr(secondPipe + 1));

    result[i] = voiceObj;
  }

  return result;
}

Napi::Value PrintDebugInfo(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  SpeechBridge::printDebugInfo();
  return env.Null();
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "speak"), Napi::Function::New(env, Speak));
  exports.Set(Napi::String::New(env, "pause"), Napi::Function::New(env, Pause));
  exports.Set(Napi::String::New(env, "resume"),
              Napi::Function::New(env, Resume));
  exports.Set(Napi::String::New(env, "stop"), Napi::Function::New(env, Stop));
  exports.Set(Napi::String::New(env, "isSpeaking"),
              Napi::Function::New(env, IsSpeaking));
  exports.Set(Napi::String::New(env, "isPaused"),
              Napi::Function::New(env, IsPaused));
  exports.Set(Napi::String::New(env, "getVoices"),
              Napi::Function::New(env, GetVoices));
  exports.Set(Napi::String::New(env, "printDebugInfo"),
              Napi::Function::New(env, PrintDebugInfo));

  return exports;
}

NODE_API_MODULE(speech_synthesizer, Init)
