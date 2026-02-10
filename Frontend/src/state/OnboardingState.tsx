import { useState, useEffect } from "react";

const STORAGE_KEY = "vanity_onboarding_step";

export function useOnboardingState(steps: any[]) {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? Number(saved) : 0;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(currentStepIndex));
  }, [currentStepIndex]);

  function nextStep() {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  }

  function resetOnboarding() {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentStepIndex(0);
  }

  return {
    currentStepIndex,
    currentStep: steps[currentStepIndex],
    nextStep,
    resetOnboarding
  };
}
