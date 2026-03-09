import api from "./axios";

export const authApi = {
    register: async (email: string, password: string, role: string) => {
        const res = await api.post("/auth/register", { email, password, role });
        return res.data;
    },

    login: async (email: string, password: string) => {
        const res = await api.post("/auth/login", { email, password });
        return res.data;
    },
};
