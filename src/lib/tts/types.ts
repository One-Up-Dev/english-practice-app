/**
 * TTS (Text-to-Speech) type definitions
 */

export type TTSMode = 'elevenlabs' | 'browser' | 'auto';

export type TTSProvider = 'elevenlabs' | 'browser';

export interface TTSConfig {
  mode: TTSMode;
  speechRate: number;
  voiceEnabled: boolean;
}

export interface ElevenLabsCredits {
  character_count: number;
  character_limit: number;
  can_extend_character_limit: boolean;
  allowed_to_extend_character_limit: boolean;
  next_character_count_reset_unix: number;
  voice_limit: number;
  professional_voice_limit: number;
  can_extend_voice_limit: boolean;
  can_use_instant_voice_cloning: boolean;
  can_use_professional_voice_cloning: boolean;
  available_models: string[];
  status: string;
  tier: string;
}

export interface TTSCreditsInfo {
  available: boolean;
  remaining: number;
  limit: number;
  percentUsed: number;
  lowCredits: boolean;
  resetDate: Date | null;
}

export interface TTSState {
  mode: TTSMode;
  activeProvider: TTSProvider;
  isSpeaking: boolean;
  isLoading: boolean;
  error: string | null;
  credits: TTSCreditsInfo | null;
  fallbackActive: boolean;
}

export interface TTSOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  onFallback?: (reason: string) => void;
}

// ElevenLabs voice settings
export interface ElevenLabsVoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

// Default voice IDs for ElevenLabs
export const ELEVENLABS_VOICES = {
  RACHEL: '21m00Tcm4TlvDq8ikWAM', // Calm, natural
  BELLA: 'EXAVITQu4vr4xnSDxMaL',  // Soft, friendly
} as const;

export const DEFAULT_VOICE_ID = ELEVENLABS_VOICES.RACHEL;

// Credit threshold for "low credits" warning (10%)
export const LOW_CREDITS_THRESHOLD = 0.1;

// Minimum characters before switching to browser TTS
export const MIN_CREDITS_FOR_ELEVENLABS = 100;
