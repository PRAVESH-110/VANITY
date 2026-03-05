import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import StepRenderer from "../components/StepRenderer";

export default function Onboarding() {
  const navigate = useNavigate();

  const [steps, setSteps] = useState<any[]>([]);
  const [flowId, setFlowId] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const initializeOnboarding = async () => {
      try {
        // 1️⃣ Get flow
        const flowRes = await axios.get("/flow/my-flow");
        setSteps(flowRes.data.steps);
        setFlowId(flowRes.data.flow._id);

        // 2️⃣ Get saved progress
        const progressRes = await axios.get("/progress");

        if (progressRes.data) {
          setCurrentStep(progressRes.data.currentStep);
        }
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load onboarding");
      }

      setLoading(false);
    };

    initializeOnboarding();
  }, []);

  const handleNext = async () => {
    try {
      const nextStep = currentStep + 1;

      // Save progress in backend
      await axios.post("/progress/complete", {
        stepNumber: nextStep,
        flowId,
      });

      // If finished all steps → redirect
      if (nextStep >= steps.length) {
        navigate("/dashboard");
      } else {
        setCurrentStep(nextStep);
      }
    } catch (err) {
      console.error("Failed to save progress");
    }
  };

  // 🟡 Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg font-medium">Loading onboarding...</div>
      </div>
    );
  }

  // 🔴 Error State
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  // 🟢 Completion State
  if (currentStep >= steps.length) {
    return (
      <div className="min-h-screen flex items-center justify-center text-green-600 text-xl">
        Onboarding Completed 🎉
      </div>
    );
  }

  const progressPercent = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <h2 className="text-3xl font-semibold mb-6">
          Welcome to VANITY 🚀
        </h2>

        {/* Progress Bar */}
        <div className="w-full bg-gray-300 rounded-full h-3 mb-6">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        <p className="mb-4 text-sm text-gray-600">
          Step {currentStep + 1} of {steps.length}
        </p>

        {/* Step Card */}
        <StepRenderer
          step={steps[currentStep]}
          next={handleNext}
        />

      </div>
    </div>
  );
}
