import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../hooks/useOnboarding";
import { AuthContext } from "../context/AuthContext";
import { onboardingApi } from "../api/onboardingApi";

const STEP_ICONS: Record<string, string> = {
  info: "💡",
  action: "⚡",
  form: "📋",
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, login } = useContext(AuthContext);
  const { steps, currentStep, loading, error, completeStep } = useOnboarding();

  const handleNext = async () => {
    try {
      const nextStep = await completeStep();
      if (nextStep >= steps.length) {
        // Mark onboarding complete
        await onboardingApi.completeOnboarding();
        // Update user in local storage
        const updatedUser = { ...user, onboardingCompleted: true };
        const token = localStorage.getItem("token") || "";
        login(token, updatedUser);
        navigate("/dashboard");
      }
    } catch {
      console.error("Failed to save progress");
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "var(--text-secondary)" }}>Loading your onboarding flow...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
        <div className="auth-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>⚠️</div>
          <h2 style={{ color: "var(--text-primary)", marginBottom: 8 }}>Couldn't load onboarding</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>{error}</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>Try again</button>
        </div>
      </div>
    );
  }

  if (!steps.length) return null;

  const isCompleted = currentStep >= steps.length;
  const progressPercent = Math.round(((currentStep) / steps.length) * 100);
  const activeStep = steps[currentStep];

  if (isCompleted) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
        <div className="auth-card animate-slide-up" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "4rem", marginBottom: 16 }}>🎉</div>
          <h2 style={{ color: "var(--text-primary)", fontSize: "1.5rem", fontWeight: 700, marginBottom: 8 }}>Onboarding Complete!</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>You're all set. Welcome aboard!</p>
          <button className="btn-primary" onClick={() => navigate("/dashboard")}>Go to Dashboard →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-bg">
      {/* Sidebar */}
      <div className="onboarding-sidebar">
        <div style={{ marginBottom: 40 }}>
          <span className="logo-text">VANITY</span>
        </div>

        <div style={{ marginBottom: 32 }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
            Progress
          </p>
          <div className="progress-track" style={{ marginBottom: 8 }}>
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
            {progressPercent}% complete · {currentStep} of {steps.length} done
          </p>
        </div>

        {/* Step list */}
        <div style={{ flex: 1 }}>
          {steps.map((step: any, i: number) => {
            const isDone = i < currentStep;
            const isActive = i === currentStep;
            return (
              <div key={step._id} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
                <div className={`step-dot ${isDone ? "step-dot-done" : isActive ? "step-dot-active" : "step-dot-pending"}`}>
                  {isDone ? "✓" : i + 1}
                </div>
                <div style={{ paddingTop: 4 }}>
                  <p style={{
                    fontSize: "0.875rem",
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "var(--text-primary)" : isDone ? "var(--text-secondary)" : "var(--text-muted)",
                    marginBottom: 2,
                  }}>
                    {step.title}
                  </p>
                  <span className={`badge step-type-${step.type}`} style={{ padding: "2px 8px", fontSize: "0.65rem" }}>
                    {step.type}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20 }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
            Signed in as<br />
            <span style={{ color: "var(--text-secondary)" }}>{user?.email}</span>
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="onboarding-main">
        <div style={{ width: "100%", maxWidth: 560 }} className="animate-slide-up">

          {/* Step type badge */}
          <div style={{ marginBottom: 16 }}>
            <span className={`badge step-type-${activeStep.type}`}>
              {STEP_ICONS[activeStep.type] || "📌"} {activeStep.type}
            </span>
          </div>

          {/* Step card */}
          <div className="glass-card" style={{ padding: 40 }}>
            <div style={{ fontSize: "3rem", marginBottom: 20 }}>
              {STEP_ICONS[activeStep.type] || "📌"}
            </div>

            <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 12, lineHeight: 1.3 }}>
              {activeStep.title}
            </h2>

            {activeStep.description && (
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: 32 }}>
                {activeStep.description}
              </p>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                id="onboarding-next"
                className="btn-primary"
                onClick={handleNext}
              >
                {currentStep === steps.length - 1 ? "Finish Onboarding 🎉" : "Continue →"}
              </button>

              <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
