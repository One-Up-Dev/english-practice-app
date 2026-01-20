/**
 * API Route for Scenario Progress
 * GET /api/scenarios/progress - Get progress for a specific scenario
 * POST /api/scenarios/progress - Update progress for a scenario
 */

import { getScenarioProgress, updateScenarioProgress } from "@/lib/db";
import { getScenarioById } from "@/lib/scenarios";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    const scenarioId = searchParams.get("scenarioId");

    if (!sessionId || !scenarioId) {
      return Response.json(
        { success: false, error: "Missing sessionId or scenarioId" },
        { status: 400 }
      );
    }

    const progress = await getScenarioProgress(sessionId, scenarioId);
    const scenario = getScenarioById(scenarioId);

    if (!scenario) {
      return Response.json(
        { success: false, error: "Scenario not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      progress: progress
        ? {
            currentStep: progress.current_step,
            completed: progress.completed,
            startedAt: progress.started_at,
            completedAt: progress.completed_at,
          }
        : null,
      totalSteps: scenario.steps.length,
    });
  } catch (error) {
    console.error("Progress GET error:", error);
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { sessionId, scenarioId, currentStep, completed } = await req.json();

    if (!sessionId || !scenarioId) {
      return Response.json(
        { success: false, error: "Missing sessionId or scenarioId" },
        { status: 400 }
      );
    }

    const scenario = getScenarioById(scenarioId);
    if (!scenario) {
      return Response.json(
        { success: false, error: "Scenario not found" },
        { status: 404 }
      );
    }

    // Validate step number
    const step = Math.max(0, Math.min(currentStep ?? 0, scenario.steps.length - 1));
    const isCompleted = completed || step >= scenario.steps.length - 1;

    await updateScenarioProgress(sessionId, scenarioId, step, isCompleted);

    return Response.json({
      success: true,
      currentStep: step,
      completed: isCompleted,
      totalSteps: scenario.steps.length,
    });
  } catch (error) {
    console.error("Progress POST error:", error);
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
