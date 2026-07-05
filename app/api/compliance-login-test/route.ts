import { NextResponse } from "next/server";

export async function GET() {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CCBill Compliance Login</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: monospace;
      background: #060608;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      width: 100%;
      max-width: 420px;
      background: #0d0d0f;
      border: 1px solid rgba(255, 0, 110, 0.25);
      border-radius: 8px;
      padding: 40px;
    }
    .header {
      font-size: 10px;
      color: #ff006e;
      letter-spacing: 0.2em;
      margin-bottom: 24px;
      text-transform: uppercase;
    }
    .title {
      font-size: 20px;
      font-weight: 800;
      color: #fff;
      margin-bottom: 32px;
    }
    .error {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 16px;
      font-size: 13px;
      display: none;
    }
    .error.show {
      display: block;
    }
    input {
      width: 100%;
      padding: 12px;
      background: #1a1a1d;
      border: 1px solid #3f3f46;
      border-radius: 6px;
      color: #fff;
      margin-bottom: 12px;
      font-family: monospace;
      font-size: 14px;
    }
    input::placeholder {
      color: #52525b;
    }
    input:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    button {
      width: 100%;
      padding: 12px;
      background: #ff006e;
      border: none;
      border-radius: 6px;
      color: #fff;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      font-family: monospace;
      transition: background 0.2s;
    }
    button:disabled {
      background: rgba(255, 0, 110, 0.4);
      cursor: not-allowed;
    }
    button:hover:not(:disabled) {
      background: #ff0055;
    }
    .footer {
      font-size: 10px;
      color: #52525b;
      margin-top: 24px;
      text-align: center;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">AURA8 — COMPLIANCE ACCESS</div>
    <div class="title">Compliance Review Login</div>
    <div id="error" class="error"></div>
    <input type="text" id="username" placeholder="Username" disabled>
    <input type="password" id="password" placeholder="Password" disabled>
    <button id="loginBtn" disabled>Loading...</button>
    <div class="footer">
      Authorized Visa/Mastercard compliance personnel only.<br>
      Unauthorized access is prohibited.<br>
      All access is logged and audited.
    </div>
  </div>

  <script>
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const errorDiv = document.getElementById('error');

    // Enable inputs after page loads
    window.addEventListener('load', () => {
      usernameInput.disabled = false;
      passwordInput.disabled = false;
      loginBtn.disabled = false;
      loginBtn.textContent = 'Access Compliance Dashboard';
    });

    // Submit on Enter key
    [usernameInput, passwordInput].forEach(input => {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !loginBtn.disabled) {
          handleLogin();
        }
      });
    });

    // Login button click
    loginBtn.addEventListener('click', handleLogin);

    async function handleLogin() {
      const username = usernameInput.value;
      const password = passwordInput.value;

      if (!username || !password) {
        showError('Please enter username and password');
        return;
      }

      loginBtn.disabled = true;
      loginBtn.textContent = 'Authenticating...';
      errorDiv.classList.remove('show');

      try {
        const res = await fetch('/api/auth/compliance-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        if (!res.ok) {
          const data = await res.json();
          showError(data.error || 'Login failed');
          loginBtn.disabled = false;
          loginBtn.textContent = 'Access Compliance Dashboard';
          return;
        }

        const data = await res.json();
        localStorage.setItem('compliance_session_token', data.session_token);
        window.location.href = '/aura8/compliance-review';
      } catch (err) {
        showError('An error occurred. Please try again.');
        console.error(err);
        loginBtn.disabled = false;
        loginBtn.textContent = 'Access Compliance Dashboard';
      }
    }

    function showError(msg) {
      errorDiv.textContent = msg;
      errorDiv.classList.add('show');
    }
  </script>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
