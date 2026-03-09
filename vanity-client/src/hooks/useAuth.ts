import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { authApi } from "../api/authApi";

export function useAuth() {
    const { user, login, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (email: string, password: string) => {
        const res = await authApi.login(email, password);
        // API returns { success, data: { token, user } }
        const { token, user: userData } = res.data;
        login(token, userData);

        if (userData.onboardingCompleted) {
            navigate("/dashboard");
        } else {
            navigate("/onboarding");
        }
    };

    const handleRegister = async (email: string, password: string, role: string) => {
        await authApi.register(email, password, role);
        navigate("/login");
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return { user, handleLogin, handleRegister, handleLogout };
}
