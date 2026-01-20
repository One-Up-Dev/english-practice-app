/**
 * ElevenLabs TTS client
 * Premium text-to-speech with streaming support
 */

import {
  TTSOptions,
  TTSCreditsInfo,
  DEFAULT_VOICE_ID,
  LOW_CREDITS_THRESHOLD,
  MIN_CREDITS_FOR_ELEVENLABS,
} from './types';

// Cache for credits info (5 minutes)
let creditsCache: { data: TTSCreditsInfo; timestamp: number } | null = null;
const CREDITS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch ElevenLabs credits from our API
 */
export async function fetchElevenLabsCredits(): Promise<TTSCreditsInfo | null> {
  // Check cache first
  if (creditsCache && Date.now() - creditsCache.timestamp < CREDITS_CACHE_DURATION) {
    return creditsCache.data;
  }

  try {
    const response = await fetch('/api/tts/credits');

    if (!response.ok) {
      console.error('Failed to fetch ElevenLabs credits:', response.status);
      return null;
    }

    const data = await response.json();

    if (!data.success) {
      // Only log as error if configured but failing, not if simply not configured
      if (data.configured) {
        console.error('ElevenLabs credits error:', data.error);
      }
      return null;
    }

    // Not configured = not available, but not an error
    if (!data.configured) {
      return null;
    }

    const credits: TTSCreditsInfo = {
      available: data.available,
      remaining: data.remaining ?? -1,
      limit: data.limit ?? -1,
      percentUsed: data.percentUsed ?? -1,
      lowCredits: data.lowCredits ?? false,
      resetDate: data.resetDate ? new Date(data.resetDate) : null,
    };

    // Update cache
    creditsCache = { data: credits, timestamp: Date.now() };

    return credits;
  } catch (error) {
    console.error('Error fetching ElevenLabs credits:', error);
    return null;
  }
}

/**
 * Clear the credits cache (force refresh)
 */
export function clearCreditsCache(): void {
  creditsCache = null;
}

/**
 * Check if ElevenLabs has enough credits
 */
export async function hasElevenLabsCredits(): Promise<boolean> {
  const credits = await fetchElevenLabsCredits();
  if (!credits) return false;
  // If remaining is -1, we can't read credits but assume available
  if (credits.remaining < 0) return credits.available;
  return credits.available && credits.remaining >= MIN_CREDITS_FOR_ELEVENLABS;
}

/**
 * Speak text using ElevenLabs API (streaming)
 */
export async function speakWithElevenLabs(
  text: string,
  voiceId: string = DEFAULT_VOICE_ID,
  options: TTSOptions = {}
): Promise<void> {
  let audioContext: AudioContext | null = null;

  try {
    options.onStart?.();

    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, voiceId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Check for quota errors
      if (response.status === 401 || response.status === 402 || response.status === 429) {
        const errorMsg = errorData.error || 'ElevenLabs quota exceeded';
        options.onFallback?.(errorMsg);
        throw new Error(errorMsg);
      }

      throw new Error(errorData.error || `ElevenLabs API error: ${response.status}`);
    }

    // Stream the audio response
    const arrayBuffer = await response.arrayBuffer();

    // Create audio context and play
    audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);

    return new Promise((resolve, reject) => {
      source.onended = () => {
        options.onEnd?.();
        audioContext?.close();
        resolve();
      };

      source.start(0);
    });
  } catch (error) {
    options.onEnd?.();
    audioContext?.close();

    const errorMessage = error instanceof Error ? error.message : 'ElevenLabs error';
    options.onError?.(errorMessage);
    throw error;
  }
}

// Audio element for streaming playback (reused)
let currentAudio: HTMLAudioElement | null = null;

/**
 * Speak text using ElevenLabs with HTML Audio element (simpler approach)
 */
export async function speakWithElevenLabsAudio(
  text: string,
  voiceId: string = DEFAULT_VOICE_ID,
  options: TTSOptions = {}
): Promise<void> {
  // Stop any current playback
  stopElevenLabsSpeech();

  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, voiceId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Check for quota/auth errors - trigger fallback
        if (response.status === 401 || response.status === 402 || response.status === 429) {
          const errorMsg = errorData.error || 'ElevenLabs quota exceeded';
          options.onFallback?.(errorMsg);
          throw new Error(errorMsg);
        }

        throw new Error(errorData.error || `ElevenLabs API error: ${response.status}`);
      }

      // Create blob URL from response
      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);

      // Create and play audio
      currentAudio = new Audio(audioUrl);

      currentAudio.onplay = () => {
        options.onStart?.();
      };

      currentAudio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        currentAudio = null;
        options.onEnd?.();
        resolve();
      };

      currentAudio.onerror = (e) => {
        URL.revokeObjectURL(audioUrl);
        currentAudio = null;
        const errorMsg = 'Audio playback error';
        options.onError?.(errorMsg);
        reject(new Error(errorMsg));
      };

      // Clear credits cache after successful use (credits may have changed)
      clearCreditsCache();

      await currentAudio.play();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'ElevenLabs error';
      options.onError?.(errorMessage);
      reject(error);
    }
  });
}

/**
 * Stop ElevenLabs audio playback
 */
export function stopElevenLabsSpeech(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

/**
 * Check if ElevenLabs is currently playing
 */
export function isElevenLabsSpeaking(): boolean {
  return currentAudio !== null && !currentAudio.paused;
}
