export const runtime = "nodejs";

export async function GET() {
  return new Response(
    `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login</title>
  <style>
    body { background: #060608; margin: 0; padding: 0; font-family: monospace; }
    .box { width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; }
    .form { background: #0d0d0f; border: 1px solid rgba(255,0,110,0.25); border-radius: 8px; padding: 40px; width: 90%; max-width: 420px; }
    .header { color: #ff006e; font-size: 10px; letter-spacing: 2px; margin-bottom: 24px; }
    .title { color: #fff; font-size: 20px; font-weight: bold; margin-bottom: 32px; }
    input { width: 100%; padding: 12px; background: #1a1a1d; border: 1px solid #3f3f46; border-radius: 6px; color: #fff; margin-bottom: 12px; font-family: monospace; }
    button { width: 100%; padding: 12px; background: #ff006e; border: none; border-radius: 6px; color: #fff; font-weight: bold; cursor: pointer; font-family: monospace; }
    .footer { color: #52525b; font-size: 10px; margin-top: 24px; text-align: center; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="box">
    <div class="form">
      <div class="header">AURA8 — COMPLIANCE ACCESS</div>
      <div class="title">Compliance Review Login</div>
      <input type="text" placeholder="Username" value="ccbill_auditor">
      <input type="password" placeholder="Password">
      <button onclick="alert('Test page loaded successfully!')">Access Compliance Dashboard</button>
      <div class="footer">
        Authorized Visa/Mastercard compliance personnel only.<br>
        Unauthorized access is prohibited.<br>
        All access is logged and audited.
      </div>
    </div>
  </div>
</body>
</html>`,
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    }
  );
}
