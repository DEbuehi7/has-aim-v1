"use client";

import { useEffect, useMemo, useState } from "react";

type ComplianceDashboardData = {
  yoti_verifications: Record<string, unknown>[];
  ccbill_webhook_events: Record<string, unknown>[];
  aura8_subscribers: Record<string, unknown>[];
  compliance_audit_log: Record<string, unknown>[];
  exported_at?: string;
};

type ComplianceTab =
  | "age-verification"
  | "payment-events"
  | "subscriber-status"
  | "audit-trail";

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

const TAB_LABELS: Record<ComplianceTab, string> = {
  "age-verification": "Age Verification Logs",
  "payment-events": "Payment Events",
  "subscriber-status": "Subscriber Status",
  "audit-trail": "Compliance Audit Trail",
};

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "—";
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  try {
    return JSON.stringify(value);
  } catch {
    return "—";
  }
}

function TableView({
  rows,
  emptyMessage,
}: {
  rows: Record<string, unknown>[];
  emptyMessage: string;
}) {
  const columns = useMemo(() => {
    const orderedKeys = new Set<string>();
    for (const row of rows) {
      for (const key of Object.keys(row)) {
        orderedKeys.add(key);
      }
    }
    return Array.from(orderedKeys);
  }, [rows]);

  if (!rows.length) {
    return (
      <div
        style={{
          background: "#0D0D0F",
          border: "1px solid #1F1F25",
          borderRadius: "8px",
          padding: "18px",
          color: "#9A9AA5",
          fontSize: "12px",
        }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      style={{
        border: "1px solid #1F1F25",
        borderRadius: "8px",
        overflowX: "auto",
        background: "#0D0D0F",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                style={{
                  textAlign: "left",
                  fontSize: "10px",
                  letterSpacing: "0.08em",
                  color: "#FF006E",
                  borderBottom: "1px solid #1F1F25",
                  padding: "10px 12px",
                  whiteSpace: "nowrap",
                }}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={String(row.id ?? rowIndex)}>
              {columns.map((column) => (
                <td
                  key={`${rowIndex}-${column}`}
                  style={{
                    color: "#E4E4E7",
                    borderBottom: "1px solid #18181B",
                    padding: "10px 12px",
                    verticalAlign: "top",
                  }}
                >
                  {formatValue(row[column])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ComplianceReviewPage() {
  const [activeTab, setActiveTab] = useState<ComplianceTab>("age-verification");
  const [dashboardData, setDashboardData] = useState<ComplianceDashboardData | null>(
    null
  );
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = window.localStorage.getItem("compliance_session_token");
    if (!token) {
      window.location.replace("/aura8/compliance-login");
      return;
    }

    async function fetchComplianceData() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("/api/compliance/data", {
          headers: {
            "X-Compliance-Token": token,
          },
        });

        if (!response.ok) {
          window.localStorage.removeItem("compliance_session_token");
          window.localStorage.removeItem("compliance_session_expires_at");
          window.localStorage.removeItem("compliance_last_activity");
          window.location.replace("/aura8/compliance-login");
          return;
        }

        const payload = (await response.json()) as ComplianceDashboardData;
        setDashboardData(payload);
      } catch (requestError) {
        console.error("[compliance-review] Failed to fetch data:", requestError);
        setError("Unable to load compliance dashboard data.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchComplianceData();
  }, []);

  useEffect(() => {
    function markActivity() {
      window.localStorage.setItem("compliance_last_activity", Date.now().toString());
    }

    function enforceInactivityTimeout() {
      const lastActivity = Number(
        window.localStorage.getItem("compliance_last_activity") ?? Date.now()
      );
      if (Date.now() - lastActivity > INACTIVITY_TIMEOUT_MS) {
        window.localStorage.removeItem("compliance_session_token");
        window.localStorage.removeItem("compliance_session_expires_at");
        window.localStorage.removeItem("compliance_last_activity");
        window.location.replace("/aura8/compliance-login");
      }
    }

    markActivity();
    const listeners = ["mousemove", "keydown", "click", "touchstart"] as const;
    listeners.forEach((eventName) => {
      window.addEventListener(eventName, markActivity, { passive: true });
    });
    const intervalId = window.setInterval(enforceInactivityTimeout, 30_000);

    return () => {
      listeners.forEach((eventName) => {
        window.removeEventListener(eventName, markActivity);
      });
      window.clearInterval(intervalId);
    };
  }, []);

  const tabRows = useMemo(() => {
    return {
      "age-verification": dashboardData?.yoti_verifications ?? [],
      "payment-events": dashboardData?.ccbill_webhook_events ?? [],
      "subscriber-status": dashboardData?.aura8_subscribers ?? [],
      "audit-trail": dashboardData?.compliance_audit_log ?? [],
    };
  }, [dashboardData]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060608",
        color: "#FAFAFA",
        fontFamily: "DM Mono, monospace",
      }}
    >
      <header
        style={{
          borderBottom: "1px solid #1F1F25",
          background: "#0D0D0F",
          padding: "16px 22px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: "12px",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ color: "#FF006E", fontSize: "10px", letterSpacing: "0.16em" }}>
            AURA8 · READ-ONLY COMPLIANCE ACCESS
          </div>
          <h1 style={{ margin: "6px 0 0", fontSize: "20px" }}>
            Compliance Review Dashboard
          </h1>
        </div>

        <button
          type="button"
          onClick={() => {
            window.localStorage.removeItem("compliance_session_token");
            window.localStorage.removeItem("compliance_session_expires_at");
            window.localStorage.removeItem("compliance_last_activity");
            window.location.replace("/aura8/compliance-login");
          }}
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid #FF006E80",
            background: "transparent",
            color: "#FF006E",
            cursor: "pointer",
            fontSize: "11px",
            fontWeight: 700,
          }}
        >
          Logout
        </button>
      </header>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
          {(Object.keys(TAB_LABELS) as ComplianceTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                borderRadius: "6px",
                border:
                  activeTab === tab ? "1px solid #FF006E" : "1px solid #2A2A32",
                padding: "8px 12px",
                fontSize: "11px",
                cursor: "pointer",
                color: activeTab === tab ? "#FF006E" : "#A1A1AA",
                background: activeTab === tab ? "#FF006E14" : "transparent",
              }}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: "12px", color: "#A1A1AA", fontSize: "11px" }}>
          Data snapshot: {dashboardData?.exported_at ?? "—"}
        </div>

        {isLoading ? (
          <div style={{ color: "#FF006E", fontSize: "12px" }}>
            Loading compliance data...
          </div>
        ) : null}

        {error ? (
          <div
            style={{
              marginBottom: "14px",
              border: "1px solid #EF444480",
              background: "#EF444420",
              color: "#FCA5A5",
              borderRadius: "6px",
              padding: "10px 12px",
              fontSize: "12px",
            }}
          >
            {error}
          </div>
        ) : null}

        {!isLoading && !error ? (
          <TableView
            rows={tabRows[activeTab]}
            emptyMessage={`No entries found for ${TAB_LABELS[activeTab]}.`}
          />
        ) : null}
      </main>
    </div>
  );
}
