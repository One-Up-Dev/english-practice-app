'use client';

/**
 * useTTS - React hook for TTS with automatic fallback
 *
 * Usage:
 * const { speak, stop, isSpeaking, mode, activeProvider, credits, setMode } = useTTS();
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  TTSMode,
  TTSProvider,
  TTSCreditsInfo,
  TTSState,
} from '@/lib/tts/types';
import {
  speak as ttsSpeak,
  stopSpeech,
  isSpeaking as checkIsSpeaking,
  getCreditsInfo,
  isElevenLabsConfigured,
  getFallbackState,
  resetSessionFallback,
} from '@/lib/tts/provider';

const STORAGE_KEY_MODE = 'english-practice-tts-mode';
const STORAGE_KEY_RATE = 'english-practice-speech-rate';

export interface UseTTSOptions {
  defaultMode?: TTSMode;
  defaultRate?: number;
  autoCheckCredits?: boolean;
}

export interface UseTTSReturn {
  // Actions
  speak: (text: string) => Promise<void>;
  stop: () => void;
  setMode: (mode: TTSMode) => void;
  setSpeechRate: (rate: number) => void;
  refreshCredits: () => Promise<void>;
  resetFallback: () => void;

  // State
  isSpeaking: boolean;
  isLoading: boolean;
  mode: TTSMode;
  activeProvider: TTSProvider | null;
  speechRate: number;
  error: string | null;
  credits: TTSCreditsInfo | null;
  fallbackActive: boolean;
  fallbackReason: string | null;
  elevenLabsConfigured: boolean;
}

export function useTTS(options: UseTTSOptions = {}): UseTTSReturn {
  const {
    defaultMode = 'auto',
    defaultRate = 0.8,
    autoCheckCredits = true,
  } = options;

  // State
  const [mode, setModeState] = useState<TTSMode>(defaultMode);
  const [speechRate, setSpeechRateState] = useState<number>(defaultRate);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState<TTSProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState<TTSCreditsInfo | null>(null);
  const [fallbackActive, setFallbackActive] = useState(false);
  const [fallbackReason, setFallbackReason] = useState<string | null>(null);
  const [elevenLabsConfigured, setElevenLabsConfigured] = useState(false);

  // Track last spoken message to prevent duplicates
  const lastSpokenRef = useRef<string | null>(null);

  // Load settings from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedMode = localStorage.getItem(STORAGE_KEY_MODE) as TTSMode | null;
    if (savedMode && ['auto', 'elevenlabs', 'browser'].includes(savedMode)) {
      setModeState(savedMode);
    }

    const savedRate = localStorage.getItem(STORAGE_KEY_RATE);
    if (savedRate) {
      setSpeechRateState(parseFloat(savedRate));
    }
  }, []);

  // Check if ElevenLabs is configured on mount
  useEffect(() => {
    isElevenLabsConfigured().then(setElevenLabsConfigured);
  }, []);

  // Auto-check credits on mount
  useEffect(() => {
    if (autoCheckCredits) {
      refreshCredits();
    }
  }, [autoCheckCredits]);

  // Update fallback state
  useEffect(() => {
    const state = getFallbackState();
    setFallbackActive(state.active);
    setFallbackReason(state.reason);
  }, [isSpeaking]);

  // Refresh credits
  const refreshCredits = useCallback(async () => {
    const creditsInfo = await getCreditsInfo();
    setCredits(creditsInfo);
  }, []);

  // Set mode with persistence
  const setMode = useCallback((newMode: TTSMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY_MODE, newMode);

    // If switching back to auto or elevenlabs, reset fallback to try again
    if (newMode !== 'browser') {
      resetSessionFallback();
      setFallbackActive(false);
      setFallbackReason(null);
    }
  }, []);

  // Set speech rate with persistence
  const setSpeechRate = useCallback((rate: number) => {
    setSpeechRateState(rate);
    localStorage.setItem(STORAGE_KEY_RATE, rate.toString());
  }, []);

  // Reset fallback (allow retrying ElevenLabs)
  const resetFallback = useCallback(() => {
    resetSessionFallback();
    setFallbackActive(false);
    setFallbackReason(null);
    refreshCredits();
  }, [refreshCredits]);

  // Speak function
  const speak = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Prevent speaking the same text twice in quick succession
    if (lastSpokenRef.current === text && isSpeaking) {
      return;
    }

    setIsLoading(true);
    setError(null);
    lastSpokenRef.current = text;

    try {
      const usedProvider = await ttsSpeak(
        text,
        mode,
        speechRate,
        {
          onStart: () => {
            setIsSpeaking(true);
            setIsLoading(false);
          },
          onEnd: () => {
            setIsSpeaking(false);
          },
          onError: (err) => {
            setError(err);
            setIsSpeaking(false);
            setIsLoading(false);
          },
          onFallback: (reason) => {
            setFallbackActive(true);
            setFallbackReason(reason);
            // Refresh credits after fallback
            refreshCredits();
          },
        }
      );

      setActiveProvider(usedProvider);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'TTS error';
      setError(errorMessage);
      setIsSpeaking(false);
      setIsLoading(false);
    }
  }, [mode, speechRate, isSpeaking, refreshCredits]);

  // Stop function
  const stop = useCallback(() => {
    stopSpeech();
    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  return {
    // Actions
    speak,
    stop,
    setMode,
    setSpeechRate,
    refreshCredits,
    resetFallback,

    // State
    isSpeaking,
    isLoading,
    mode,
    activeProvider,
    speechRate,
    error,
    credits,
    fallbackActive,
    fallbackReason,
    elevenLabsConfigured,
  };
}

export default useTTS;
