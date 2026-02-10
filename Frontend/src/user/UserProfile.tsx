import { useNavigate } from "react-router-dom";

export default function UserProfile() {
  const navigate = useNavigate();

  return (
    <div>
      <h2>User Profiling</h2>

      <select>
        <option>Developer</option>
        <option>Founder</option>
      </select>

      <select>
        <option>Explore</option>
        <option>Build</option>
      </select>

      <button onClick={() => navigate("/onboarding")}>
        Continue
      </button>
    </div>
  );
}
