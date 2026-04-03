type Props = {
  status: string;
};

const STAGES = [
  { key: "created",   label: "Created",   icon: "📦", color: "#a78bfa" },
  { key: "building",  label: "Building",  icon: "🔨", color: "#f59e0b" },
  { key: "deploying", label: "Deploying", icon: "🚀", color: "#3b82f6" },
  { key: "deployed",  label: "Deployed",  icon: "✅", color: "#10b981" },
];

export default function DeploymentTimeline({ status }: Props) {
  const currentIndex = STAGES.findIndex((s) => s.key === status);

  return (
    <div style={{ padding: "24px 0" }}>
      {/* Pipeline */}
      <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
        {STAGES.map((stage, i) => {
          const isDone = i < currentIndex;
          const isActive = i === currentIndex;
          const isPending = i > currentIndex;

          const dotColor = isDone
            ? "#10b981"
            : isActive
            ? stage.color
            : "var(--border)";

          const labelColor = isDone
            ? "var(--text-secondary)"
            : isActive
            ? "var(--text-primary)"
            : "var(--text-muted)";

          return (
            <div key={stage.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 2 }}>
              {/* Dot */}
              <div
                style={{
                  width: isActive ? 48 : 36,
                  height: isActive ? 48 : 36,
                  borderRadius: "50%",
                  background: isPending
                    ? "var(--bg-surface)"
                    : isDone
                    ? "rgba(16, 185, 129, 0.15)"
                    : `${stage.color}18`,
                  border: `2.5px solid ${dotColor}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isActive ? "1.2rem" : "0.95rem",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: isActive
                    ? `0 0 20px ${stage.color}40, 0 0 40px ${stage.color}20`
                    : "none",
                  animation: isActive && (status === "building" || status === "deploying")
                    ? "pulse-glow 2s ease-in-out infinite"
                    : "none",
                }}
              >
                {isDone ? "✓" : stage.icon}
              </div>

              {/* Label */}
              <p
                style={{
                  marginTop: 10,
                  fontSize: "0.78rem",
                  fontWeight: isActive ? 700 : 500,
                  color: labelColor,
                  textTransform: "capitalize",
                  letterSpacing: isActive ? "0.03em" : "0",
                  transition: "all 0.3s ease",
                }}
              >
                {stage.label}
              </p>

              {/* Active badge */}
              {isActive && (
                <span
                  style={{
                    marginTop: 6,
                    padding: "2px 10px",
                    borderRadius: 999,
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    background: `${stage.color}20`,
                    color: stage.color,
                    border: `1px solid ${stage.color}40`,
                    animation: (status === "building" || status === "deploying")
                      ? "pulse-glow 2s ease-in-out infinite"
                      : "none",
                  }}
                >
                  {status === "deployed" ? "done" : "current"}
                </span>
              )}
            </div>
          );
        })}


      </div>
    </div>
  );
}
