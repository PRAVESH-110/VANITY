import { useEffect, useState } from "react";
import axios from "../api/axios";
import Sidebar from "../components/Sidebar";

export default function ApiKeys() {
    const [apiKey, setApiKey] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await axios.get("/api-keys");
                if (res.data) setApiKey(res.data);
            } catch { }
        };
        load();
    }, []);

    const generateKey = async () => {
        setLoading(true);
        try {
            const res = await axios.post("/api-keys/generate");
            setApiKey(res.data);
        } catch { }
        setLoading(false);
    };

    const copyToClipboard = () => {
        if (apiKey?.key) {
            navigator.clipboard.writeText(apiKey.key);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
                        API Keys
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                        Manage your API keys for external integrations
                    </p>
                </div>

                <div className="glass-card" style={{ padding: 32, maxWidth: 600 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                        <span style={{ fontSize: "1.5rem" }}>🔑</span>
                        <h3 style={{ color: "var(--text-primary)", fontWeight: 700 }}>Your API Key</h3>
                    </div>

                    {apiKey ? (
                        <div>
                            <div style={{
                                background: "var(--bg-surface)",
                                border: "1px solid var(--border)",
                                borderRadius: 10,
                                padding: "14px 16px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: 16,
                            }}>
                                <code style={{ color: "var(--accent-light)", fontSize: "0.85rem", fontFamily: "monospace", wordBreak: "break-all" }}>
                                    {apiKey.key}
                                </code>
                                <button
                                    onClick={copyToClipboard}
                                    style={{
                                        background: "none",
                                        border: "1px solid var(--border)",
                                        borderRadius: 8,
                                        color: copied ? "var(--success)" : "var(--text-secondary)",
                                        padding: "6px 12px",
                                        cursor: "pointer",
                                        fontSize: "0.75rem",
                                        fontWeight: 600,
                                        whiteSpace: "nowrap",
                                        marginLeft: 12,
                                        transition: "all 0.2s",
                                    }}
                                >
                                    {copied ? "✓ Copied!" : "Copy"}
                                </button>
                            </div>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                                Created {new Date(apiKey.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    ) : (
                        <div style={{ textAlign: "center", padding: "20px 0" }}>
                            <p style={{ color: "var(--text-secondary)", marginBottom: 20, fontSize: "0.9rem" }}>
                                No API key generated yet. Generate one to start integrating with VANITY.
                            </p>
                            <button className="btn-primary" onClick={generateKey} disabled={loading}>
                                {loading ? "Generating..." : "Generate API Key"}
                            </button>
                        </div>
                    )}
                </div>

                <div className="glass-card" style={{ padding: 32, marginTop: 24, maxWidth: 600 }}>
                    <h3 style={{ color: "var(--text-primary)", fontWeight: 700, marginBottom: 16 }}>📖 Usage</h3>
                    <div style={{
                        background: "var(--bg-surface)",
                        borderRadius: 10,
                        padding: 16,
                        border: "1px solid var(--border)",
                    }}>
                        <pre style={{ color: "var(--text-secondary)", fontSize: "0.8rem", fontFamily: "monospace", margin: 0, whiteSpace: "pre-wrap" }}>
                            {`// Add to your request headers
Authorization: Bearer <your-api-key>

// Example with fetch
fetch("https://api.vanity.dev/v1/data", {
  headers: {
    "Authorization": "Bearer <your-api-key>"
  }
})`}
                        </pre>
                    </div>
                </div>
            </main>
        </div>
    );
}
