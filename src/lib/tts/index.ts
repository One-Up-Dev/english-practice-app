/**
 * TTS Module - ElevenLabs with Browser fallback
 *
 * Usage:
 * import { useTTS } from '@/hooks/useTTS';
 *
 * Or for direct access:
 * import { speak, stopSpeech } from '@/lib/tts';
 */

// Types
export type {
  TTSMode,
  TTSProvider,
  TTSConfig,
  TTSState,
  TTSOptions,
  TTSCreditsInfo,
  ElevenLabsCredits,
  ElevenLabsVoiceSettings,
} from './types';

export {
  ELEVENLABS_VOICES,
  DEFAULT_VOICE_ID,
  LOW_CREDITS_THRESHOLD,
  MIN_CREDITS_FOR_ELEVENLABS,
} from './types';

// Provider (main interface)
export {
  speak,
  stopSpeech,
  isSpeaking,
  isTTSAvailable,
  getCreditsInfo,
  resolveProvider,
  isElevenLabsConfigured,
  activateSessionFallback,
  resetSessionFallback,
  getFallbackState,
} from './provider';

// Browser TTS
export {
  speakWithBrowser,
  stopBrowserSpeech,
  isBrowserTTSAvailable,
  isBrowserSpeaking,
  getBrowserVoices,
  findBestEnglishVoice,
} from './browser';

// ElevenLabs
export {
  speakWithElevenLabsAudio,
  stopElevenLabsSpeech,
  isElevenLabsSpeaking,
  fetchElevenLabsCredits,
  hasElevenLabsCredits,
  clearCreditsCache,
} from './elevenlabs';
