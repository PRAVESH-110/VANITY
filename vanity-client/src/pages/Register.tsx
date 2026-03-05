import { useState } from "react";
import axios from "../api/axios";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("developer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.post("/auth/register", {
        email,
        password,
        role,
      });

      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-96">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Create Account
        </h2>

        {error && (
          <div className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <input
            type="email"
            placeholder="Email"
            className="border p-2 w-full mb-3 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="border p-2 w-full mb-3 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <select
            className="border p-2 w-full mb-4 rounded"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="developer">Developer</option>
            <option value="founder">Founder</option>
            <option value="marketer">Marketer</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 transition"
          >
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
