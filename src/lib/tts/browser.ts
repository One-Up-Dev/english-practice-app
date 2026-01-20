/**
 * Browser TTS (Web Speech API) wrapper
 * Free, built-in browser text-to-speech
 */

import { TTSOptions } from './types';

export interface BrowserTTSConfig {
  rate: number;
  pitch?: number;
  lang?: string;
}

const DEFAULT_CONFIG: BrowserTTSConfig = {
  rate: 0.8,
  pitch: 1.1,
  lang: 'en-US',
};

/**
 * Check if Web Speech API is available
 */
export function isBrowserTTSAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Get available voices for browser TTS
 */
export function getBrowserVoices(): SpeechSynthesisVoice[] {
  if (!isBrowserTTSAvailable()) return [];
  return window.speechSynthesis.getVoices();
}

/**
 * Find the best English voice (prefer female voices)
 */
export function findBestEnglishVoice(): SpeechSynthesisVoice | null {
  const voices = getBrowserVoices();

  // Try to find a female English voice first
  const femaleEnglish = voices.find(
    (v) => v.lang.startsWith('en') && v.name.includes('Female')
  );

  if (femaleEnglish) return femaleEnglish;

  // Fallback to any English voice
  return voices.find((v) => v.lang.startsWith('en')) || null;
}

/**
 * Speak text using browser's Web Speech API
 */
export function speakWithBrowser(
  text: string,
  config: Partial<BrowserTTSConfig> = {},
  options: TTSOptions = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isBrowserTTSAvailable()) {
      const error = 'Web Speech API not available';
      options.onError?.(error);
      reject(new Error(error));
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const mergedConfig = { ...DEFAULT_CONFIG, ...config };
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = mergedConfig.lang || 'en-US';
    utterance.rate = mergedConfig.rate;
    utterance.pitch = mergedConfig.pitch || 1.1;

    // Try to set the best voice
    const voice = findBestEnglishVoice();
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      options.onStart?.();
    };

    utterance.onend = () => {
      options.onEnd?.();
      resolve();
    };

    utterance.onerror = (event) => {
      const errorMessage = `Browser TTS error: ${event.error}`;
      options.onError?.(errorMessage);
      reject(new Error(errorMessage));
    };

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Stop browser speech
 */
export function stopBrowserSpeech(): void {
  if (isBrowserTTSAvailable()) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Check if browser is currently speaking
 */
export function isBrowserSpeaking(): boolean {
  if (!isBrowserTTSAvailable()) return false;
  return window.speechSynthesis.speaking;
}
