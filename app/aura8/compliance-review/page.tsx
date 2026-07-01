"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ComplianceData = {
  yoti_verifications: any[];
  ccbill_webhook_events: any[];
  subscribers: any[];
  audit_log: any[];
  exported_at: string;
} | null;

type TabName = "verifications" | "payments" | "subscribers" | "audit";

export default function ComplianceReview() {
  const router = useRouter();
  const [data, setData] = useState<ComplianceData>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabName>("verifications");
  const [autoLogoutTimer, setAutoLogoutTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("compliance_session_token");
    if (!token) {
      router.push("/aura8/compliance-login");
      return;
    }

    fetchComplianceData(token);

    // Set up auto-logout after 30 minutes
    const timer = setTimeout(() => {
      localStorage.removeItem("compliance_session_token");
      router.push("/aura8/compliance-login");
    }, 30 * 60 * 1000);

    setAutoLogoutTimer(timer);

    return () => clearTimeout(timer);
  }, [router]);

  async function fetchComplianceData(token: string) {
    try {
      const res = await fetch("/api/compliance/data", {
        headers: { "X-Compliance-Token": token },
      });

      if (!res.ok) {
        localStorage.removeItem("compliance_session_token");
        router.push("/aura8/compliance-login");
        return;
      }

      const data = await res.json();
      setData(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching compliance data:", err);
      localStorage.removeItem("compliance_session_token");
      router.push("/aura8/compliance-login");
    }
  }

  function handleLogout() {
    if (autoLogoutTimer) clearTimeout(autoLogoutTimer);
    localStorage.removeItem("compliance_session_token");
    router.push("/aura8/compliance-login");
  }

  if (loading) {
    return (
      <div style={{ background: "#060608", color: "#FFF", padding: "40px", minHeight: "100vh" }}>
        Loading compliance data...
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ background: "#060608", color: "#FFF", padding: "40px", minHeight: "100vh" }}>
        Error loading data. Redirecting...
      </div>
    );
  }

  const tabStyle = (isActive: boolean) => ({
    padding: "12px 16px",
    background: isActive ? "#FF006E" : "#1A1A1D",
    color: "#FFF",
    border: "none",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 600,
    marginRight: "8px",
    borderRadius: "4px",
    fontFamily: "DM Mono, monospace",
  });

  const containerStyle: React.CSSProperties = {
    background: "#060608",
    color: "#FFF",
    padding: "40px",
    minHeight: "100vh",
    fontFamily: "DM Mono, monospace",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
    borderBottom: "1px solid #FF006E40",
    paddingBottom: "16px",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "24px",
    fontWeight: 800,
    color: "#FFF",
  };

  const logoutButtonStyle: React.CSSProperties = {
    padding: "8px 16px",
    background: "#EF4444",
    color: "#FFF",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 600,
    fontFamily: "DM Mono, monospace",
  };

  const dataTableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "16px",
    fontSize: "12px",
  };

  const thStyle: React.CSSProperties = {
    textAlign: "left",
    padding: "12px",
    background: "#1A1A1D",
    borderBottom: "1px solid #FF006E40",
    color: "#FF006E",
    fontWeight: 600,
  };

  const tdStyle: React.CSSProperties = {
    padding: "12px",
    borderBottom: "1px solid #FF006E20",
    color: "#D4D4D8",
    maxWidth: "400px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={titleStyle}>Compliance Review Dashboard</div>
        <button style={logoutButtonStyle} onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div style={{ marginBottom: "16px", display: "flex", flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveTab("verifications")}
          style={tabStyle(activeTab === "verifications")}
        >
          Age Verifications ({data.yoti_verifications.length})
        </button>
        <button
          onClick={() => setActiveTab("payments")}
          style={tabStyle(activeTab === "payments")}
        >
          Payment Events ({data.ccbill_webhook_events.length})
        </button>
        <button
          onClick={() => setActiveTab("subscribers")}
          style={tabStyle(activeTab === "subscribers")}
        >
          Subscribers ({data.subscribers.length})
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          style={tabStyle(activeTab === "audit")}
        >
          Audit Trail ({data.audit_log.length})
        </button>
      </div>

      {activeTab === "verifications" && (
        <div>
          <h2 style={{ fontSize: "16px", marginBottom: "16px" }}>Age Verification Logs (Yoti)</h2>
          <table style={dataTableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Verified At</th>
                <th style={thStyle}>IP Address</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.yoti_verifications.length > 0 ? (
                data.yoti_verifications.map((v) => (
                  <tr key={v.id}>
                    <td style={tdStyle}>{v.email}</td>
                    <td style={tdStyle}>{new Date(v.verified_at).toLocaleString()}</td>
                    <td style={tdStyle}>{v.ip_address}</td>
                    <td style={tdStyle}>{v.status || "completed"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ ...tdStyle, textAlign: "center", color: "#52525B" }}>
                    No verification records
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "payments" && (
        <div>
          <h2 style={{ fontSize: "16px", marginBottom: "16px" }}>Payment Events (CCBill)</h2>
          <table style={dataTableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Currency</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {data.ccbill_webhook_events.length > 0 ? (
                data.ccbill_webhook_events.map((e) => (
                  <tr key={e.id}>
                    <td style={tdStyle}>{e.email}</td>
                    <td style={tdStyle}>{e.amount}</td>
                    <td style={tdStyle}>{e.currency}</td>
                    <td style={tdStyle}>{e.status}</td>
                    <td style={tdStyle}>{new Date(e.created_at).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ ...tdStyle, textAlign: "center", color: "#52525B" }}>
                    No payment records
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "subscribers" && (
        <div>
          <h2 style={{ fontSize: "16px", marginBottom: "16px" }}>Subscriber Status</h2>
          <table style={dataTableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Created</th>
                <th style={thStyle}>Subscription ID</th>
              </tr>
            </thead>
            <tbody>
              {data.subscribers.length > 0 ? (
                data.subscribers.map((s) => (
                  <tr key={s.id}>
                    <td style={tdStyle}>{s.email}</td>
                    <td style={tdStyle}>{s.status}</td>
                    <td style={tdStyle}>{new Date(s.created_at).toLocaleString()}</td>
                    <td style={tdStyle}>{s.subscription_id}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ ...tdStyle, textAlign: "center", color: "#52525B" }}>
                    No subscriber records
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "audit" && (
        <div>
          <h2 style={{ fontSize: "16px", marginBottom: "16px" }}>Compliance Audit Trail</h2>
          <table style={dataTableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Action</th>
                <th style={thStyle}>Resource</th>
                <th style={thStyle}>IP Address</th>
                <th style={thStyle}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {data.audit_log.length > 0 ? (
                data.audit_log.map((log) => (
                  <tr key={log.id}>
                    <td style={tdStyle}>{log.action}</td>
                    <td style={tdStyle}>{log.resource_type || "—"}</td>
                    <td style={tdStyle}>{log.ip_address}</td>
                    <td style={tdStyle}>{new Date(log.created_at).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ ...tdStyle, textAlign: "center", color: "#52525B" }}>
                    No audit records
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: "32px", fontSize: "10px", color: "#52525B", borderTop: "1px solid #FF006E40", paddingTop: "16px" }}>
        Data exported at: {data.exported_at}
        <br />
        This dashboard is read-only. All access is logged for compliance audits.
      </div>
    </div>
  );
}
