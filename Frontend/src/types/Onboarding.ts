export type OnboardingStep = {
  id: string;
  type: "info" | "action";
  title: string;
};

export type OnboardingFlow = {
  id: string;
  segment: string;
  activationGoal: string;
  steps: OnboardingStep[];
};
