import type { OnboardingFlow } from "../types/Onboarding";

export const developerFlow: OnboardingFlow = {
  id: "dev-flow",
  segment: "developer",
  activationGoal: "first_project_created",
  steps: [
    {
      id: "step-1",
      type: "info",
      title: "Welcome Developer 👋"
    },
    {
      id: "step-2",
      type: "action",
      title: "Create your first project"
    }
  ]
};
