import { cookies } from "next/headers";

export interface Aura8Session {
  verified: boolean;
  email: string | null;
}

export async function getAura8Session(): Promise<Aura8Session> {
  const cookieStore = await cookies();
  const verified = cookieStore.get("aura8_verified")?.value === "true";
  const email = cookieStore.get("aura8_email")?.value ?? null;
  return { verified, email };
}
