'use client';

import { Zap, Globe, AlertTriangle, RefreshCw } from 'lucide-react';
import { TTSMode, TTSCreditsInfo } from '@/lib/tts/types';

interface TTSModeIndicatorProps {
  mode: TTSMode;
  activeProvider: 'elevenlabs' | 'browser' | null;
  fallbackActive: boolean;
  fallbackReason: string | null;
  credits: TTSCreditsInfo | null;
  elevenLabsConfigured: boolean;
  onModeChange: (mode: TTSMode) => void;
  onResetFallback?: () => void;
  compact?: boolean;
}

export function TTSModeIndicator({
  mode,
  activeProvider,
  fallbackActive,
  fallbackReason,
  credits,
  elevenLabsConfigured,
  onModeChange,
  onResetFallback,
  compact = false,
}: TTSModeIndicatorProps) {
  // Determine display state
  const isUsingElevenLabs = activeProvider === 'elevenlabs';
  const showLowCreditsWarning = credits?.lowCredits && !fallbackActive;

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {/* Mode indicator badge */}
        <div
          className={`
            flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium
            ${isUsingElevenLabs
              ? 'bg-violet-500/20 text-violet-500'
              : fallbackActive
              ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
              : 'bg-blue-500/20 text-blue-500'
            }
          `}
          title={
            fallbackActive
              ? `Fallback: ${fallbackReason}`
              : isUsingElevenLabs
              ? 'ElevenLabs TTS'
              : 'Browser TTS'
          }
        >
          {isUsingElevenLabs ? (
            <Zap size={10} />
          ) : fallbackActive ? (
            <AlertTriangle size={10} />
          ) : (
            <Globe size={10} />
          )}
          {isUsingElevenLabs ? 'AI' : 'Free'}
        </div>

        {/* Low credits warning */}
        {showLowCreditsWarning && (
          <div
            className="text-yellow-500"
            title={`Credits low: ${credits?.remaining} remaining`}
          >
            <AlertTriangle size={12} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Mode selector */}
      <div className="px-3 py-2">
        <p className="text-xs text-muted-foreground mb-2">Voice Engine</p>
        <div className="flex gap-1">
          {[
            { id: 'auto' as TTSMode, label: 'Auto', icon: Zap },
            { id: 'elevenlabs' as TTSMode, label: 'AI', icon: Zap },
            { id: 'browser' as TTSMode, label: 'Free', icon: Globe },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => onModeChange(option.id)}
              disabled={option.id === 'elevenlabs' && !elevenLabsConfigured}
              className={`
                flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded transition-colors
                ${mode === option.id
                  ? 'bg-primary text-primary-foreground'
                  : option.id === 'elevenlabs' && !elevenLabsConfigured
                  ? 'bg-muted/50 text-muted-foreground/50 cursor-not-allowed'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }
              `}
              title={
                option.id === 'auto'
                  ? 'Use AI voice when available, fallback to free'
                  : option.id === 'elevenlabs'
                  ? elevenLabsConfigured
                    ? 'Always use ElevenLabs AI voice'
                    : 'ElevenLabs not configured'
                  : 'Always use free browser voice'
              }
            >
              <option.icon size={12} />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status display */}
      <div className="px-3 py-2 bg-muted/30 rounded mx-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isUsingElevenLabs ? (
              <>
                <Zap size={14} className="text-violet-500" />
                <span className="text-xs text-violet-500 font-medium">AI Voice Active</span>
              </>
            ) : fallbackActive ? (
              <>
                <AlertTriangle size={14} className="text-yellow-500" />
                <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                  Fallback Mode
                </span>
              </>
            ) : (
              <>
                <Globe size={14} className="text-blue-500" />
                <span className="text-xs text-blue-500 font-medium">Browser Voice</span>
              </>
            )}
          </div>

          {/* Retry button when in fallback */}
          {fallbackActive && onResetFallback && (
            <button
              onClick={onResetFallback}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Retry ElevenLabs"
            >
              <RefreshCw size={12} />
            </button>
          )}
        </div>

        {/* Fallback reason */}
        {fallbackActive && fallbackReason && (
          <p className="text-[10px] text-muted-foreground mt-1 truncate">
            {fallbackReason}
          </p>
        )}

        {/* Credits info */}
        {credits && elevenLabsConfigured && !fallbackActive && (
          <div className="mt-2">
            {credits.remaining >= 0 ? (
              <>
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>Credits</span>
                  <span>{credits.remaining.toLocaleString()} / {credits.limit.toLocaleString()}</span>
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      credits.lowCredits
                        ? 'bg-yellow-500'
                        : 'bg-violet-500'
                    }`}
                    style={{ width: `${100 - credits.percentUsed}%` }}
                  />
                </div>
                {credits.lowCredits && (
                  <p className="text-[10px] text-yellow-600 dark:text-yellow-400 mt-1">
                    Low credits - will switch to free voice soon
                  </p>
                )}
              </>
            ) : (
              <p className="text-[10px] text-muted-foreground">
                AI voice active (credits info unavailable)
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TTSModeIndicator;
