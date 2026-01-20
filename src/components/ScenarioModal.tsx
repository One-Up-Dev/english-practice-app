"use client";

import { X, Clock, CheckCircle2, Play, Plane, Briefcase, Coffee, BookOpen } from "lucide-react";
import { Scenario, scenarioCategories } from "@/lib/scenarios";

interface ScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenarios: Array<Scenario & { progress: { currentStep: number; completed: boolean; totalSteps: number } | null }>;
  onSelectScenario: (scenario: Scenario) => void;
}

// Map category to icon
const categoryIcons = {
  travel: Plane,
  roleplay: Briefcase,
  conversation: Coffee,
  quiz: BookOpen,
};

export function ScenarioModal({ isOpen, onClose, scenarios, onSelectScenario }: ScenarioModalProps) {
  if (!isOpen) return null;

  // Group scenarios by category
  const groupedScenarios = scenarioCategories.map((cat) => ({
    ...cat,
    scenarios: scenarios.filter((s) => s.category === cat.id),
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Guided Scenarios</h2>
            <p className="text-sm text-muted-foreground">Practice real-life English situations</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-muted text-muted-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {groupedScenarios.map((category) => {
            const Icon = categoryIcons[category.id];
            return (
              <div key={category.id}>
                {/* Category Header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-1.5 rounded ${category.bgColor}`}>
                    <Icon size={16} className={category.color} />
                  </div>
                  <h3 className="font-medium text-foreground">{category.label}</h3>
                  <span className="text-xs text-muted-foreground">- {category.description}</span>
                </div>

                {/* Scenarios Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {category.scenarios.map((scenario) => (
                    <ScenarioCard
                      key={scenario.id}
                      scenario={scenario}
                      onSelect={() => onSelectScenario(scenario)}
                      categoryColor={category.color}
                      categoryBgColor={category.bgColor}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface ScenarioCardProps {
  scenario: Scenario & { progress: { currentStep: number; completed: boolean; totalSteps: number } | null };
  onSelect: () => void;
  categoryColor: string;
  categoryBgColor: string;
}

function ScenarioCard({ scenario, onSelect, categoryColor, categoryBgColor }: ScenarioCardProps) {
  const isCompleted = scenario.progress?.completed;
  const isStarted = scenario.progress && !scenario.progress.completed;
  const progressPercent = scenario.progress
    ? Math.round((scenario.progress.currentStep / scenario.progress.totalSteps) * 100)
    : 0;

  return (
    <button
      onClick={onSelect}
      className={`
        relative text-left p-3 rounded-lg border transition-all
        hover:border-primary hover:shadow-md
        ${isCompleted
          ? "border-green-500/50 bg-green-500/5"
          : isStarted
          ? "border-yellow-500/50 bg-yellow-500/5"
          : "border-border bg-card"
        }
      `}
    >
      {/* Completed badge */}
      {isCompleted && (
        <div className="absolute top-2 right-2">
          <CheckCircle2 size={18} className="text-green-500" />
        </div>
      )}

      {/* Title */}
      <h4 className="font-medium text-foreground pr-6 mb-1">{scenario.title}</h4>

      {/* Description */}
      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
        {scenario.description}
      </p>

      {/* Meta info */}
      <div className="flex items-center gap-3 text-xs">
        {/* Difficulty */}
        <span className={`px-1.5 py-0.5 rounded ${categoryBgColor} ${categoryColor}`}>
          {scenario.difficulty}
        </span>

        {/* Duration */}
        <span className="flex items-center gap-1 text-muted-foreground">
          <Clock size={12} />
          {scenario.estimatedMinutes} min
        </span>

        {/* Steps */}
        <span className="text-muted-foreground">
          {scenario.steps.length} steps
        </span>
      </div>

      {/* Progress bar if started */}
      {isStarted && (
        <div className="mt-2">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-500 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            Step {scenario.progress!.currentStep + 1} of {scenario.progress!.totalSteps}
          </p>
        </div>
      )}

      {/* Start/Continue indicator */}
      {!isCompleted && (
        <div className="mt-2 flex items-center gap-1 text-xs text-primary">
          <Play size={12} />
          {isStarted ? "Continue" : "Start"}
        </div>
      )}
    </button>
  );
}
