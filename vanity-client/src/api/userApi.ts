import api from "./axios";

export const userApi = {
    getMe: async () => {
        const res = await api.get("/user/me");
        return res.data;
    },

    updateProfile: async (role: string, goal: string) => {
        const res = await api.post("/user/profile", { role, goal });
        return res.data;
    },
};
