/**
 * TTS Provider - Unified interface with automatic fallback
 *
 * Flow:
 * 1. Mode "auto": Try ElevenLabs first, fallback to browser if credits exhausted
 * 2. Mode "elevenlabs": Only use ElevenLabs (fail if unavailable)
 * 3. Mode "browser": Only use browser TTS
 */

import { TTSMode, TTSProvider, TTSOptions, TTSCreditsInfo } from './types';
import {
  speakWithBrowser,
  stopBrowserSpeech,
  isBrowserSpeaking,
  isBrowserTTSAvailable,
} from './browser';
import {
  speakWithElevenLabsAudio,
  stopElevenLabsSpeech,
  isElevenLabsSpeaking,
  hasElevenLabsCredits,
  fetchElevenLabsCredits,
} from './elevenlabs';

export interface TTSProviderState {
  activeProvider: TTSProvider;
  fallbackActive: boolean;
  fallbackReason: string | null;
}

// Session-level fallback flag (persists until page refresh)
let sessionFallbackActive = false;
let sessionFallbackReason: string | null = null;

/**
 * Check if ElevenLabs is configured (has API key)
 */
export async function isElevenLabsConfigured(): Promise<boolean> {
  try {
    const response = await fetch('/api/tts/credits');
    const data = await response.json();
    return data.configured === true;
  } catch {
    return false;
  }
}

/**
 * Determine which provider to use based on mode and availability
 */
export async function resolveProvider(mode: TTSMode): Promise<TTSProviderState> {
  // If fallback is already active for this session, use browser
  if (sessionFallbackActive && mode === 'auto') {
    return {
      activeProvider: 'browser',
      fallbackActive: true,
      fallbackReason: sessionFallbackReason,
    };
  }

  if (mode === 'browser') {
    return {
      activeProvider: 'browser',
      fallbackActive: false,
      fallbackReason: null,
    };
  }

  if (mode === 'elevenlabs') {
    return {
      activeProvider: 'elevenlabs',
      fallbackActive: false,
      fallbackReason: null,
    };
  }

  // Auto mode: check if ElevenLabs has credits
  const hasCredits = await hasElevenLabsCredits();

  if (hasCredits) {
    return {
      activeProvider: 'elevenlabs',
      fallbackActive: false,
      fallbackReason: null,
    };
  }

  // No credits, use browser fallback
  return {
    activeProvider: 'browser',
    fallbackActive: true,
    fallbackReason: 'ElevenLabs credits exhausted',
  };
}

/**
 * Activate session fallback (called when ElevenLabs fails)
 */
export function activateSessionFallback(reason: string): void {
  sessionFallbackActive = true;
  sessionFallbackReason = reason;
}

/**
 * Reset session fallback (can be called to retry ElevenLabs)
 */
export function resetSessionFallback(): void {
  sessionFallbackActive = false;
  sessionFallbackReason = null;
}

/**
 * Get current fallback state
 */
export function getFallbackState(): { active: boolean; reason: string | null } {
  return {
    active: sessionFallbackActive,
    reason: sessionFallbackReason,
  };
}

/**
 * Speak text using the appropriate provider
 */
export async function speak(
  text: string,
  mode: TTSMode,
  speechRate: number = 0.8,
  options: TTSOptions = {}
): Promise<TTSProvider> {
  const providerState = await resolveProvider(mode);

  // Wrap options to handle fallback
  const wrappedOptions: TTSOptions = {
    ...options,
    onFallback: (reason) => {
      // Activate session fallback for future calls
      activateSessionFallback(reason);
      options.onFallback?.(reason);
    },
  };

  if (providerState.activeProvider === 'elevenlabs') {
    try {
      await speakWithElevenLabsAudio(text, undefined, wrappedOptions);
      return 'elevenlabs';
    } catch (error) {
      // If in auto mode, try browser fallback
      if (mode === 'auto') {
        const reason = error instanceof Error ? error.message : 'ElevenLabs failed';
        activateSessionFallback(reason);
        options.onFallback?.(reason);

        // Try browser TTS as fallback
        await speakWithBrowser(text, { rate: speechRate }, options);
        return 'browser';
      }

      // If mode is explicitly elevenlabs, let the error propagate
      throw error;
    }
  }

  // Use browser TTS
  await speakWithBrowser(text, { rate: speechRate }, options);
  return 'browser';
}

/**
 * Stop any ongoing speech
 */
export function stopSpeech(): void {
  stopBrowserSpeech();
  stopElevenLabsSpeech();
}

/**
 * Check if any provider is currently speaking
 */
export function isSpeaking(): boolean {
  return isBrowserSpeaking() || isElevenLabsSpeaking();
}

/**
 * Get credits info (for display)
 */
export async function getCreditsInfo(): Promise<TTSCreditsInfo | null> {
  return fetchElevenLabsCredits();
}

/**
 * Check if TTS is available at all
 */
export function isTTSAvailable(): boolean {
  return isBrowserTTSAvailable();
}

// Re-export types and utilities
export { TTSMode, TTSProvider, TTSOptions, TTSCreditsInfo } from './types';
