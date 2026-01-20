"use client";

import { X, ChevronRight, ChevronLeft, CheckCircle2, Plane, Briefcase, Coffee, BookOpen } from "lucide-react";
import { Scenario } from "@/lib/scenarios";

interface ScenarioBarProps {
  scenario: Scenario;
  currentStep: number;
  onNextStep: () => void;
  onPrevStep: () => void;
  onExit: () => void;
  isComplete: boolean;
}

// Map category to icon
const categoryIcons = {
  travel: Plane,
  roleplay: Briefcase,
  conversation: Coffee,
  quiz: BookOpen,
};

export function ScenarioBar({
  scenario,
  currentStep,
  onNextStep,
  onPrevStep,
  onExit,
  isComplete,
}: ScenarioBarProps) {
  const step = scenario.steps[currentStep];
  const totalSteps = scenario.steps.length;
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;
  const Icon = categoryIcons[scenario.category];

  // Colors based on category
  const categoryColors = {
    travel: { bg: "bg-green-500/10", text: "text-green-500", border: "border-green-500/30" },
    roleplay: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/30" },
    conversation: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/30" },
    quiz: { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/30" },
  };
  const colors = categoryColors[scenario.category];

  return (
    <div className={`border-b ${colors.border} ${colors.bg}`}>
      {/* Main bar */}
      <div className="flex items-center gap-3 p-3">
        {/* Category icon */}
        <div className={`p-1.5 rounded ${colors.bg}`}>
          <Icon size={18} className={colors.text} />
        </div>

        {/* Title and step info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm text-foreground truncate">
              {scenario.title}
            </h3>
            {isComplete && (
              <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Step {currentStep + 1} of {totalSteps}
          </p>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onPrevStep}
            disabled={currentStep === 0}
            className="p-2 rounded hover:bg-muted text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Previous step"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={onNextStep}
            disabled={currentStep >= totalSteps - 1}
            className={`p-2 rounded transition-colors ${
              currentStep < totalSteps - 1
                ? `${colors.bg} ${colors.text} hover:opacity-80`
                : "text-muted-foreground opacity-30 cursor-not-allowed"
            }`}
            title="Next step"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Exit button */}
        <button
          onClick={onExit}
          className="p-2 rounded hover:bg-muted text-muted-foreground transition-colors"
          title="Exit scenario"
        >
          <X size={18} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <div
          className={`h-full transition-all duration-300 ${
            isComplete ? "bg-green-500" : colors.text.replace("text-", "bg-")
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Current instruction */}
      <div className="px-3 py-2 bg-background/50">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
          Your task:
        </p>
        <p className="text-sm text-foreground">
          {step?.instruction || "Complete the scenario!"}
        </p>
        {scenario.vocabularyFocus && scenario.vocabularyFocus.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {scenario.vocabularyFocus.slice(0, 4).map((word) => (
              <span
                key={word}
                className={`text-[10px] px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}
              >
                {word}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Completion celebration component
export function ScenarioComplete({
  scenario,
  onClose,
  onRestart,
}: {
  scenario: Scenario;
  onClose: () => void;
  onRestart: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-card border border-green-500/30 rounded-lg shadow-xl p-6 max-w-sm text-center animate-in zoom-in-95 duration-300">
        {/* Success icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle2 size={40} className="text-green-500" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-foreground mb-2">
          Scenario Complete!
        </h2>

        {/* Scenario name */}
        <p className="text-muted-foreground mb-4">
          You finished &quot;{scenario.title}&quot;
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-4 mb-6 text-sm">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">{scenario.steps.length}</p>
            <p className="text-muted-foreground">Steps</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{scenario.estimatedMinutes}</p>
            <p className="text-muted-foreground">Minutes</p>
          </div>
        </div>

        {/* Vocabulary learned */}
        {scenario.vocabularyFocus && scenario.vocabularyFocus.length > 0 && (
          <div className="mb-6">
            <p className="text-xs text-muted-foreground mb-2">Vocabulary practiced:</p>
            <div className="flex flex-wrap justify-center gap-1">
              {scenario.vocabularyFocus.map((word) => (
                <span
                  key={word}
                  className="text-xs px-2 py-1 rounded bg-primary/10 text-primary"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onRestart}
            className="flex-1 px-4 py-2 rounded border border-border text-foreground hover:bg-muted transition-colors"
          >
            Restart
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
