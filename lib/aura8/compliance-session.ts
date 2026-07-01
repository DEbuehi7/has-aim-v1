import crypto from "crypto";

const DEFAULT_SESSION_DURATION_MINUTES = 30;

type ComplianceSessionPayload = {
  sub: string;
  iat: number;
  exp: number;
};

export function getComplianceSessionDurationMs(): number {
  const configured = Number(process.env.COMPLIANCE_SESSION_DURATION_MINUTES);
  const minutes =
    Number.isFinite(configured) && configured > 0
      ? configured
      : DEFAULT_SESSION_DURATION_MINUTES;

  return minutes * 60 * 1000;
}

function getComplianceSessionSecret(): string {
  const secret = process.env.COMPLIANCE_SESSION_SECRET;

  if (!secret) {
    throw new Error("Missing COMPLIANCE_SESSION_SECRET");
  }

  return secret;
}

function encodeBase64Url(value: Buffer | string): string {
  return Buffer.from(value).toString("base64url");
}

function decodeBase64Url(value: string): Buffer {
  return Buffer.from(value, "base64url");
}

export function createComplianceSessionToken(
  accountId: string,
  nowMs: number = Date.now()
): string {
  const sessionDurationMs = getComplianceSessionDurationMs();
  const payload: ComplianceSessionPayload = {
    sub: accountId,
    iat: nowMs,
    exp: nowMs + sessionDurationMs,
  };

  const payloadPart = encodeBase64Url(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", getComplianceSessionSecret())
    .update(payloadPart)
    .digest();
  const signaturePart = encodeBase64Url(signature);

  return `${payloadPart}.${signaturePart}`;
}

export function verifyComplianceSessionToken(
  token: string,
  nowMs: number = Date.now()
): ComplianceSessionPayload | null {
  const [payloadPart, signaturePart] = token.split(".");

  if (!payloadPart || !signaturePart) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac("sha256", getComplianceSessionSecret())
    .update(payloadPart)
    .digest();
  const receivedSignature = decodeBase64Url(signaturePart);

  if (expectedSignature.length !== receivedSignature.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(expectedSignature, receivedSignature)) {
    return null;
  }

  let parsedPayload: Partial<ComplianceSessionPayload>;
  try {
    parsedPayload = JSON.parse(
      decodeBase64Url(payloadPart).toString("utf8")
    ) as Partial<ComplianceSessionPayload>;
  } catch {
    return null;
  }

  if (
    typeof parsedPayload.sub !== "string" ||
    typeof parsedPayload.iat !== "number" ||
    typeof parsedPayload.exp !== "number"
  ) {
    return null;
  }

  if (parsedPayload.exp <= nowMs) {
    return null;
  }

  return parsedPayload as ComplianceSessionPayload;
}

export function getClientIpAddress(request: Request): string {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }

  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp) {
    return xRealIp.trim();
  }

  return "unknown";
}

export function isComplianceIpAllowed(ipAddress: string): boolean {
  const rawWhitelist = process.env.COMPLIANCE_IP_WHITELIST;

  if (!rawWhitelist) {
    return true;
  }

  const whitelist = rawWhitelist
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (!whitelist.length) {
    return true;
  }

  return whitelist.includes(ipAddress);
}
