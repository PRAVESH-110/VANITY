import type { OnboardingFlow } from "../types/Onboarding";

/**
 * This simulates backend API.
 * Real backend will replace this later.
 */
export async function fetchOnboardingFlow(
  role: string,
  goal: string
): Promise<OnboardingFlow> {

  return {
    id: "dev-flow",
    segment: role,
    activationGoal: "first_project_created",
    steps: [
      {
        id: "step-1",
        type: "info",
        title: `Welcome ${role} 👋`
      },
      {
        id: "step-2",
        type: "action",
        title: "Create your first project"
      }
    ]
  };
}
