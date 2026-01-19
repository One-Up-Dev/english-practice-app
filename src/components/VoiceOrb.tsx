"use client";

import { Volume2, Square } from "lucide-react";

interface VoiceOrbProps {
  isSpeaking: boolean;
  onStop?: () => void;
  size?: "sm" | "md" | "lg";
}

/**
 * VoiceOrb - Animated orb that visualizes when TTS is active
 *
 * Features:
 * - Breathing animation when idle
 * - Pulsing rings + wave animation when speaking
 * - Gradient from blue to indigo
 * - Click to stop speaking
 */
export function VoiceOrb({ isSpeaking, onStop, size = "md" }: VoiceOrbProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <button
      onClick={onStop}
      disabled={!isSpeaking}
      className={`
        voice-orb
        ${sizeClasses[size]}
        ${isSpeaking ? "voice-orb--speaking cursor-pointer" : "voice-orb--idle cursor-default"}
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
        disabled:cursor-default
      `}
      aria-label={isSpeaking ? "Stop speaking" : "Voice indicator"}
      title={isSpeaking ? "Click to stop" : ""}
    >
      {/* Pulsing rings when speaking */}
      {isSpeaking && (
        <>
          <span className="voice-orb__ring" />
          <span className="voice-orb__ring voice-orb__ring--delay-1" />
          <span className="voice-orb__ring voice-orb__ring--delay-2" />
        </>
      )}

      {/* Content: Icon or Wave bars */}
      {isSpeaking ? (
        <div className="voice-orb__wave">
          <span className="voice-orb__bar" />
          <span className="voice-orb__bar" />
          <span className="voice-orb__bar" />
          <span className="voice-orb__bar" />
          <span className="voice-orb__bar" />
        </div>
      ) : (
        <Volume2
          size={iconSizes[size]}
          className="text-white/80"
        />
      )}
    </button>
  );
}

/**
 * Inline speaking indicator with orb and stop button
 */
interface SpeakingIndicatorProps {
  isSpeaking: boolean;
  onStop: () => void;
}

export function SpeakingIndicator({ isSpeaking, onStop }: SpeakingIndicatorProps) {
  if (!isSpeaking) return null;

  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center gap-3 bg-card/95 backdrop-blur-sm px-4 py-3 rounded-full shadow-lg border border-border">
        <VoiceOrb isSpeaking={true} onStop={onStop} size="sm" />
        <span className="text-sm font-medium text-foreground">Speaking...</span>
        <button
          onClick={onStop}
          className="flex items-center gap-1 text-xs bg-muted hover:bg-muted/80 text-muted-foreground px-3 py-1.5 rounded-full transition-colors"
        >
          <Square size={12} />
          Stop
        </button>
      </div>
    </div>
  );
}
