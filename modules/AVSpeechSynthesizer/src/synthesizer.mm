#import <AVFoundation/AVFoundation.h>
#import <Foundation/Foundation.h>

#include "bridge.h"
#include <iostream>

@interface SpeechSynthesizerDelegate : NSObject <AVSpeechSynthesizerDelegate>
@property(nonatomic, assign) bool isFinished;
@property(nonatomic, assign) bool hasError;
@property(nonatomic, strong) AVSpeechSynthesizer *synthesizer;
@end

@implementation SpeechSynthesizerDelegate
- (instancetype)init {
  self = [super init];
  if (self) {
    _isFinished = NO;
    _hasError = NO;
    _synthesizer = nil;
  }

  return self;
}

- (void)speechSynthesizer:(AVSpeechSynthesizer *)synthesizer
    didStartSpeechUtterance:(AVSpeechUtterance *)utterance {
  NSLog(@"Speech started");
  self.isFinished = NO;
  self.hasError = NO;
}

- (void)speechSynthesizer:(AVSpeechSynthesizer *)synthesizer
    didFinishSpeechUtterance:(AVSpeechUtterance *)utterance {
  NSLog(@"Speech finished");
  self.isFinished = YES;

  // Clean up synthesizer after speech is finished
  if (self.synthesizer) {
    self.synthesizer.delegate = nil;
    self.synthesizer = nil;
  }
}

- (void)speechSynthesizer:(AVSpeechSynthesizer *)synthesizer
    didPauseSpeechUtterance:(AVSpeechUtterance *)utterance {
  NSLog(@"Speech paused");
}

- (void)speechSynthesizer:(AVSpeechSynthesizer *)synthesizer
    didContinueSpeechUtterance:(AVSpeechUtterance *)utterance {
  NSLog(@"Speech continued");
}

- (void)speechSynthesizer:(AVSpeechSynthesizer *)synthesizer
    didCancelSpeechUtterance:(AVSpeechUtterance *)utterance {
  NSLog(@"Speech cancelled");
  self.isFinished = YES;

  // Clean up synthesizer after speech is cancelled
  if (self.synthesizer) {
    self.synthesizer.delegate = nil;
    self.synthesizer = nil;
  }
}
@end

namespace {
SpeechSynthesizerDelegate *globalDelegate = nil;

SpeechSynthesizerDelegate *getDelegate() {
  if (!globalDelegate) {
    globalDelegate = [[SpeechSynthesizerDelegate alloc] init];
  }

  return globalDelegate;
}

AVSpeechSynthesizer *createNewSynthesizer() {
  SpeechSynthesizerDelegate *delegate = getDelegate();

  // Clean up previous synthesizer if it exists
  if (delegate.synthesizer) {
    NSLog(@"Cleaning up existing synthesizer");
    [delegate.synthesizer stopSpeakingAtBoundary:AVSpeechBoundaryImmediate];
    delegate.synthesizer.delegate = nil;
  }

  // Create a new synthesizer
  NSLog(@"Creating new synthesizer");
  AVSpeechSynthesizer *newSynthesizer = [[AVSpeechSynthesizer alloc] init];
  newSynthesizer.delegate = delegate;
  delegate.synthesizer = newSynthesizer;
  delegate.isFinished = NO;
  delegate.hasError = NO;

  return newSynthesizer;
}

AVSpeechSynthesizer *getCurrentSynthesizer() {
  SpeechSynthesizerDelegate *delegate = getDelegate();

  return delegate.synthesizer;
}
} // namespace

void SpeechBridge::speak(const std::string &text, const std::string &voice,
                         float rate, float pitch, float volume) {
  @try {
    NSLog(@"Starting speech synthesis for text: %s", text.c_str());

    // Create new synthesizer
    AVSpeechSynthesizer *synth = createNewSynthesizer();

    // Create new utterance
    NSString *nsText = [NSString stringWithUTF8String:text.c_str()];
    AVSpeechUtterance *utterance =
        [AVSpeechUtterance speechUtteranceWithString:nsText];

    if (!voice.empty()) {
      NSString *voiceId = [NSString stringWithUTF8String:voice.c_str()];
      AVSpeechSynthesisVoice *speechVoice =
          [AVSpeechSynthesisVoice voiceWithIdentifier:voiceId];
      if (speechVoice) {
        utterance.voice = speechVoice;
        NSLog(@"Using voice: %s", voice.c_str());
      } else {
        NSLog(@"Voice not found: %s, using default", voice.c_str());
      }
    }

    utterance.rate = fmaxf(0.0f, fminf(1.0f, rate));
    utterance.pitchMultiplier = fmaxf(0.5f, fminf(2.0f, pitch));
    utterance.volume = fmaxf(0.0f, fminf(1.0f, volume));

    NSLog(@"Speech parameters - rate: %.2f, pitch: %.2f, volume: %.2f",
          utterance.rate, utterance.pitchMultiplier, utterance.volume);

    // Queue the utterance for speaking
    [synth speakUtterance:utterance];

    NSLog(@"Speech synthesis queued successfully");
  } @catch (NSException *exception) {
    NSLog(@"Exception in speak: %@", exception);

    SpeechSynthesizerDelegate *delegate = getDelegate();
    if (delegate) {
      delegate.hasError = YES;
    }

    std::cerr << "Speech synthesis failed: " <<
        [[exception description] UTF8String] << std::endl;
  }
}

bool SpeechBridge::pauseSpeaking() {
  @try {
    AVSpeechSynthesizer *synth = getCurrentSynthesizer();
    if (!synth) {
      NSLog(@"No active synthesizer for pause");

      return false;
    }

    bool result = [synth pauseSpeakingAtBoundary:AVSpeechBoundaryImmediate];
    NSLog(@"Pause speaking result: %d", result);

    return result;
  } @catch (NSException *exception) {
    NSLog(@"Exception in pauseSpeaking: %@", exception);

    return false;
  }
}

bool SpeechBridge::continueSpeaking() {
  @try {
    AVSpeechSynthesizer *synth = getCurrentSynthesizer();
    if (!synth) {
      NSLog(@"No active synthesizer for continue");

      return false;
    }

    bool result = [synth continueSpeaking];
    NSLog(@"Continue speaking result: %d", result);

    return result;
  } @catch (NSException *exception) {
    NSLog(@"Exception in continueSpeaking: %@", exception);

    return false;
  }
}

bool SpeechBridge::stopSpeaking() {
  @try {
    AVSpeechSynthesizer *synth = getCurrentSynthesizer();
    if (!synth) {
      NSLog(@"No active synthesizer for stop");

      return false;
    }

    bool result = [synth stopSpeakingAtBoundary:AVSpeechBoundaryImmediate];
    NSLog(@"Stop speaking result: %d", result);

    return result;
  } @catch (NSException *exception) {
    NSLog(@"Exception in stopSpeaking: %@", exception);

    return false;
  }
}

bool SpeechBridge::isSpeaking() {
  @try {
    AVSpeechSynthesizer *synth = getCurrentSynthesizer();
    if (!synth) {
      return false;
    }

    bool result = [synth isSpeaking];

    return result;
  } @catch (NSException *exception) {
    NSLog(@"Exception in isSpeaking: %@", exception);

    return false;
  }
}

bool SpeechBridge::isPaused() {
  @try {
    AVSpeechSynthesizer *synth = getCurrentSynthesizer();
    if (!synth) {
      return false;
    }

    bool result = [synth isPaused];

    return result;
  } @catch (NSException *exception) {
    NSLog(@"Exception in isPaused: %@", exception);

    return false;
  }
}

std::vector<std::string> SpeechBridge::getAvailableVoices() {
  std::vector<std::string> voices;

  @try {
    NSArray *availableVoices = [AVSpeechSynthesisVoice speechVoices];
    NSLog(@"Found %lu available voices",
          (unsigned long)[availableVoices count]);

    for (AVSpeechSynthesisVoice *voice in availableVoices) {
      std::string voiceInfo = std::string([voice.identifier UTF8String]) + "|" +
                              std::string([voice.name UTF8String]) + "|" +
                              std::string([voice.language UTF8String]);
      voices.push_back(voiceInfo);
    }
  } @catch (NSException *exception) {
    NSLog(@"Exception in getAvailableVoices: %@", exception);
  }

  return voices;
}

void SpeechBridge::printDebugInfo() {
  @try {
    AVSpeechSynthesizer *synth = getCurrentSynthesizer();
    SpeechSynthesizerDelegate *delegate = getDelegate();

    NSLog(@"=== Speech Synthesizer Debug Info ===");
    NSLog(@"Is speaking: %d", [synth isSpeaking]);
    NSLog(@"Is paused: %d", [synth isPaused]);

    if (synth) {
      NSLog(@"Is speaking: %d", [synth isSpeaking]);
      NSLog(@"Is paused: %d", [synth isPaused]);
    }

    if (delegate) {
      NSLog(@"Delegate - Is finished: %d", delegate.isFinished);
      NSLog(@"Delegate - Has error: %d", delegate.hasError);
    }

    NSLog(@"=====================================");
  } @catch (NSException *exception) {
    NSLog(@"Exception in printDebugInfo: %@", exception);
  }
}
