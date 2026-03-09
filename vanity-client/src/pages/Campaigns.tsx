import { useEffect, useState, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

interface Campaign {
    _id: string;
    name: string;
    status: "draft" | "launched";
    createdAt: string;
}

export default function Campaigns() {
    const { user } = useContext(AuthContext);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState("");
    const [creating, setCreating] = useState(false);

    const loadCampaigns = async () => {
        try {
            const res = await axios.get("/campaigns");
            setCampaigns(res.data);
        } catch { }
        setLoading(false);
    };

    useEffect(() => { loadCampaigns(); }, []);

    const handleCreateCampaign = async () => {
        if (!name.trim()) return;
        setCreating(true);
        try {
            await axios.post("/campaigns", { name });
            setName("");
            setShowModal(false);
            loadCampaigns();
        } catch { }
        setCreating(false);
    };

    const handleLaunchCampaign = async (campaignId: string) => {
        try {
            await axios.post(`/campaigns/${campaignId}/launch`);
            loadCampaigns();
        } catch { }
    };

    const launchedCount = campaigns.filter((c) => c.status === "launched").length;
    const draftCount = campaigns.filter((c) => c.status === "draft").length;

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
                    <div>
                        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
                            Campaigns
                        </h1>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                            Create and manage your activation campaigns
                        </p>
                    </div>
                    <button
                        id="new-campaign-btn"
                        className="btn-primary"
                        onClick={() => setShowModal(true)}
                    >
                        + New Campaign
                    </button>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
                    <div className="stat-card">
                        <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                            Total Campaigns
                        </p>
                        <p style={{ color: "var(--text-primary)", fontSize: "2rem", fontWeight: 800 }}>{campaigns.length}</p>
                    </div>
                    <div className="stat-card">
                        <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                            Launched
                        </p>
                        <p style={{ color: "var(--success)", fontSize: "2rem", fontWeight: 800 }}>{launchedCount}</p>
                    </div>
                    <div className="stat-card">
                        <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                            Drafts
                        </p>
                        <p style={{ color: "var(--warning)", fontSize: "2rem", fontWeight: 800 }}>{draftCount}</p>
                    </div>
                </div>

                {/* Campaign List */}
                {loading ? (
                    <div style={{ textAlign: "center", padding: 48 }}>
                        <div style={{ 
                            width: 40, height: 40, 
                            border: "3px solid var(--border)", 
                            borderTopColor: "var(--accent)", 
                            borderRadius: "50%", 
                            animation: "spin 1s linear infinite",
                            margin: "0 auto"
                        }} />
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="glass-card" style={{ padding: 48, textAlign: "center" }}>
                        <div style={{ fontSize: "3rem", marginBottom: 16 }}>📢</div>
                        <h3 style={{ color: "var(--text-primary)", marginBottom: 8 }}>No campaigns yet</h3>
                        <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>Create your first campaign to start tracking user activation</p>
                        <button className="btn-primary" onClick={() => setShowModal(true)}>+ New Campaign</button>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {campaigns.map((campaign) => (
                            <div
                                key={campaign._id}
                                className="glass-card"
                                style={{ padding: "20px 24px" }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <h3 style={{ color: "var(--text-primary)", fontWeight: 600, marginBottom: 4, fontSize: "1rem" }}>
                                            {campaign.name}
                                        </h3>
                                        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                                            Created {new Date(campaign.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <span className={`badge ${campaign.status === "launched" ? "badge-green" : "badge-yellow"}`}>
                                            {campaign.status === "launched" ? "✓ Launched" : "⏳ Draft"}
                                        </span>
                                        {campaign.status === "draft" && (
                                            <button
                                                className="btn-primary"
                                                style={{ padding: "8px 16px", fontSize: "0.8rem" }}
                                                onClick={() => handleLaunchCampaign(campaign._id)}
                                            >
                                                Launch
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Create Modal */}
                {showModal && (
                    <div className="modal-backdrop">
                        <div className="modal-box">
                            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 24 }}>
                                Create New Campaign
                            </h3>
                            <div style={{ marginBottom: 16 }}>
                                <label className="form-label">Campaign Name</label>
                                <input
                                    id="campaign-name"
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g., Q1 User Activation"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: 24 }}>
                                Define a campaign to track a specific user activation goal.
                            </p>
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                                <button className="btn-secondary" onClick={() => { setShowModal(false); setName(""); }}>
                                    Cancel
                                </button>
                                <button
                                    id="campaign-create-btn"
                                    className="btn-primary"
                                    onClick={handleCreateCampaign}
                                    disabled={creating || !name.trim()}
                                >
                                    {creating ? "Creating..." : "Create Campaign"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

