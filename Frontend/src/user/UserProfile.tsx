import { useNavigate } from "react-router-dom";
import { fetchOnboardingFlow } from "../services/api";

export default function UserProfile() {
  const navigate = useNavigate();

  async function handleContinue() {
    const flow = await fetchOnboardingFlow("developer", "build");

    localStorage.setItem(
      "vanity_onboarding_flow",
      JSON.stringify(flow)
    );

    navigate("/onboarding");
  }

  return (
    <div>
      <h2>User Profiling</h2>

      <select>
        <option value="developer">Developer</option>
        <option value="founder">Founder</option>
      </select>

      <select>
        <option value="build">Build</option>
        <option value="explore">Explore</option>
      </select>

      <button onClick={handleContinue}>
        Continue
      </button>
    </div>
  );
}
