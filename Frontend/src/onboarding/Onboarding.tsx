import { useNavigate } from "react-router-dom";
import StepRenderer from "./StepRenderer";
import { useOnboardingState } from "../state/OnboardingState";
import { developerFlow } from "../services/FlowConfig";

export default function Onboarding() {
  const navigate = useNavigate();
  const flow = developerFlow;

  const {
    currentStep,
    currentStepIndex,
    nextStep,
    resetOnboarding
  } = useOnboardingState(flow.steps);

  function handleNext() {
    if (currentStepIndex === flow.steps.length - 1) {
      localStorage.setItem("vanity_onboarding_completed", "true");
      resetOnboarding();
      navigate("/dashboard");
    } else {
      nextStep();
    }
  }

  return (
    <div>
      <h2>Onboarding Flow</h2>
      <StepRenderer step={currentStep} onNext={handleNext} />
    </div>
  );
}
