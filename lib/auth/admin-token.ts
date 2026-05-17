import { SignJWT, jwtVerify } from "jose";
import type { Scope } from "@/lib/auth/permissions";
import type { UserRole } from "@/lib/types";

const COOKIE_NAME = "admin_session";

export type AdminTokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
  isSuperAdmin: boolean;
  scopes: Scope[];
};

function secretKey() {
  const secret =
    process.env.ADMIN_JWT_SECRET ??
    process.env.SUPERVISOR_SUPABASE_JWT_SECRET ??
    process.env.SUPERVISOR_JWT_SECRET;
  if (!secret) {
    throw new Error("ADMIN_JWT_SECRET veya SUPERVISOR_SUPABASE_JWT_SECRET tanımlı değil.");
  }
  return new TextEncoder().encode(secret);
}

export async function signAdminToken(payload: AdminTokenPayload): Promise<string> {
  return new SignJWT({
    email: payload.email,
    role: payload.role,
    isSuperAdmin: payload.isSuperAdmin,
    scopes: payload.scopes,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());
}

export async function verifyAdminToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const sub = payload.sub;
    if (!sub || typeof payload.email !== "string") return null;
    return {
      sub,
      email: payload.email,
      role: payload.role as UserRole,
      isSuperAdmin: Boolean(payload.isSuperAdmin),
      scopes: Array.isArray(payload.scopes) ? (payload.scopes as Scope[]) : [],
    };
  } catch {
    return null;
  }
}

export { COOKIE_NAME as ADMIN_SESSION_COOKIE };
