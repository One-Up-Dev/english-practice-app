/**
 * API Route for Scenarios
 * GET /api/scenarios - List all scenarios with progress status
 */

import { scenarios, scenarioCategories } from "@/lib/scenarios";
import { getAllScenarioProgress } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    // Get progress for all scenarios if sessionId provided
    let progressMap: Map<string, { currentStep: number; completed: boolean }> = new Map();

    if (sessionId) {
      try {
        const progress = await getAllScenarioProgress(sessionId);
        progress.forEach((p) => {
          progressMap.set(p.scenario_id, {
            currentStep: p.current_step,
            completed: p.completed,
          });
        });
      } catch (e) {
        console.error("Error fetching scenario progress:", e);
        // Continue without progress data
      }
    }

    // Build response with progress data
    const scenariosWithProgress = scenarios.map((scenario) => {
      const progress = progressMap.get(scenario.id);
      return {
        ...scenario,
        progress: progress
          ? {
              currentStep: progress.currentStep,
              completed: progress.completed,
              totalSteps: scenario.steps.length,
            }
          : null,
      };
    });

    return Response.json({
      success: true,
      scenarios: scenariosWithProgress,
      categories: scenarioCategories,
    });
  } catch (error) {
    console.error("Scenarios API error:", error);
    return Response.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}
