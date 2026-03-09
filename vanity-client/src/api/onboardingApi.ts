import api from "./axios";

export const onboardingApi = {
    getFlow: async () => {
        const res = await api.get("/flow/my-flow");
        return res.data;
    },

    getProgress: async () => {
        const res = await api.get("/progress");
        return res.data;
    },

    completeStep: async (stepNumber: number, flowId: string) => {
        const res = await api.post("/progress/complete", { stepNumber, flowId });
        return res.data;
    },

    completeOnboarding: async () => {
        const res = await api.post("/progress/complete-onboarding", {});
        return res.data;
    },
};
