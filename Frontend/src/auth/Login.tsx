import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  function handleLogin() {
    const completed = localStorage.getItem("vanity_onboarding_completed");

    if (completed) {
      navigate("/dashboard");
    } else {
      navigate("/profile");
    }
  }

  function resetOnboarding() {
    localStorage.removeItem("vanity_onboarding_completed");
    localStorage.removeItem("vanity_onboarding_step");
    localStorage.removeItem("vanity_onboarding_flow");
    alert("Onboarding reset. Now test again 🚀");
  }

  return (
    <div>
      <h2>Login</h2>

      <button onClick={handleLogin}>
        Login (Mock)
      </button>

      <br /><br />

      <button onClick={resetOnboarding}>
        🔁 Reset Onboarding (Dev Only)
      </button>
    </div>
  );
}
