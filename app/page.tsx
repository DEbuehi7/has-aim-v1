export const dynamic = "force-static";

export default function Home() {
  return (
    <main
      style={{
        fontFamily: "DM Mono, monospace",
        background: "#060608",
        color: "#E8E8F0",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "#0d0d0f",
          border: "1px solid rgba(255, 0, 110, 0.25)",
          borderRadius: "8px",
          padding: "48px 40px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "10px",
            letterSpacing: "0.15em",
            color: "#ff006e",
            textTransform: "uppercase",
            marginBottom: "16px",
          }}
        >
          Compliance Portal
        </p>
        <h1
          style={{
            fontSize: "22px",
            fontWeight: 600,
            marginBottom: "8px",
            letterSpacing: "-0.01em",
          }}
        >
          Aura8 Compliance Portal
        </h1>
        <p
          style={{
            fontSize: "13px",
            color: "#9090A8",
            marginBottom: "32px",
          }}
        >
          Login to continue
        </p>
        <a
          href="/aura8/compliance-login"
          style={{
            display: "inline-block",
            background: "#ff006e",
            color: "#fff",
            fontFamily: "DM Mono, monospace",
            fontSize: "13px",
            fontWeight: 600,
            letterSpacing: "0.05em",
            textDecoration: "none",
            padding: "12px 32px",
            borderRadius: "6px",
          }}
        >
          Go to Login →
        </a>
      </div>
    </main>
  );
}

