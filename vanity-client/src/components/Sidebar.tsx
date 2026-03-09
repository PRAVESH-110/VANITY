import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useAuth } from "../hooks/useAuth";

const NAV_ITEMS_BY_ROLE: Record<string, Array<{ to: string; icon: string; label: string }>> = {
    developer: [
        { to: "/dashboard", icon: "⚡", label: "Projects" },
        { to: "/api-keys", icon: "🔑", label: "API Keys" },
        { to: "/analytics", icon: "📊", label: "Analytics" },
        { to: "/settings", icon: "⚙️", label: "Settings" },
    ],
    founder: [
        { to: "/dashboard", icon: "⚡", label: "Projects" },
        { to: "/analytics", icon: "📊", label: "Analytics" },
        { to: "/settings", icon: "⚙️", label: "Settings" },
    ],
    marketer: [
        { to: "/campaigns", icon: "📢", label: "Campaigns" },
        { to: "/analytics", icon: "📊", label: "Analytics" },
        { to: "/settings", icon: "⚙️", label: "Settings" },
    ],
};

export default function Sidebar() {
    const { user } = useContext(AuthContext);
    const { handleLogout } = useAuth();

    const role = user?.role || "developer";
    const navItems = NAV_ITEMS_BY_ROLE[role] || NAV_ITEMS_BY_ROLE.developer;

    const getRoleEmoji = (role: string) =>
        ({ developer: "🛠", founder: "🚀", marketer: "🎯" }[role] || "👤");

    return (
        <aside className="sidebar">
            <NavLink to="/dashboard" style={{ textDecoration: "none" }}>
                <span className="logo-text">VANITY</span>
            </NavLink>

            <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                    >
                        <span>{item.icon}</span> {item.label}
                    </NavLink>
                ))}
            </nav>

            {/* User info */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.85rem", fontWeight: 700, color: "white",
                    }}>
                        {user?.email?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)" }}>
                            {getRoleEmoji(user?.role)} {user?.role || "user"}
                        </p>
                        <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>
                            {user?.email}
                        </p>
                    </div>
                </div>
                <button
                    id="logout-btn"
                    className="btn-secondary"
                    style={{ width: "100%", padding: "8px 16px", fontSize: "0.8rem" }}
                    onClick={handleLogout}
                >
                    ← Sign Out
                </button>
            </div>
        </aside>
    );
}
