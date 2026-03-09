import { useState, useEffect } from "react";
import { onboardingApi } from "../api/onboardingApi";

export function useOnboarding() {
    const [steps, setSteps] = useState<any[]>([]);
    const [flowId, setFlowId] = useState<string>("");
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const init = async () => {
            try {
                const flowRes = await onboardingApi.getFlow();
                const { flow, steps: fetchedSteps } = flowRes.data;
                setSteps(fetchedSteps);
                setFlowId(flow._id);

                const progressRes = await onboardingApi.getProgress();
                if (progressRes.data) {
                    setCurrentStep(progressRes.data.currentStep);
                }
            } catch (err: any) {
                setError(err.response?.data?.message || "Failed to load onboarding");
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    const completeStep = async () => {
        const nextStep = currentStep + 1;
        await onboardingApi.completeStep(nextStep, flowId);
        setCurrentStep(nextStep);
        return nextStep;
    };

    return { steps, flowId, currentStep, loading, error, completeStep };
}
