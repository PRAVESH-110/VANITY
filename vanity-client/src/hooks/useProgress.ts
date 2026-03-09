import { useState, useEffect } from "react";
import { onboardingApi } from "../api/onboardingApi";

export interface ProgressData {
    currentStep: number;
    completedSteps: number[];
    flowId: string;
    totalSteps: number;
    percentage: number;
}

export function useProgress() {
    const [progress, setProgress] = useState<ProgressData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProgress = async () => {
        try {
            const res = await onboardingApi.getProgress();
            setProgress(res.data);
        } catch {
            setProgress(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProgress();
    }, []);

    return { progress, loading, refetch: fetchProgress };
}
