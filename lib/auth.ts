import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import type {
  DashboardUser,
  User,
  ChefProfile,
  CompanyProfile,
  DashboardUserRole,
} from "@/generated/prisma/client";

const SALT_ROUNDS = 12;
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);
const SESSION_COOKIE_NAME = "session";
const SESSION_DURATION = 7 * 24 * 60 * 60; // 7 days in seconds

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Session payload type
export interface SessionPayload {
  userId: string;
  userType: "dashboard" | "customer";
  role?: DashboardUserRole;
  exp?: number;
}

// User with profile type for dashboard users
export type DashboardUserWithProfile = Omit<DashboardUser, "password"> & {
  type: "admin" | "chef" | "company";
  chefProfile: ChefProfile | null;
  companyProfile: CompanyProfile | null;
};

export type CustomerUser = Omit<User, "password">;

// Create a session token
export async function createSession(payload: Omit<SessionPayload, "exp">): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(JWT_SECRET);

  return token;
}

// Set session cookie
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  });
}

// Get session from cookie
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// Clear session cookie
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// Get current dashboard user with profile
export async function getCurrentUserWithProfile(): Promise<DashboardUserWithProfile | null> {
  const session = await getSession();

  if (!session || session.userType !== "dashboard") {
    return null;
  }

  const dashboardUser = await prisma.dashboardUser.findUnique({
    where: { id: session.userId },
    include: {
      chefProfile: true,
      companyProfile: true,
    },
  });

  if (!dashboardUser || !dashboardUser.isActive) {
    return null;
  }

  // Map role to type
  const typeMap: Record<DashboardUserRole, "admin" | "chef" | "company"> = {
    ADMIN: "admin",
    CHEF: "chef",
    COMPANY: "company",
  };

  const { password: _, ...userWithoutPassword } = dashboardUser;

  return {
    ...userWithoutPassword,
    type: typeMap[dashboardUser.role],
  };
}

// Get current regular customer user
export async function getCurrentCustomer(): Promise<CustomerUser | null> {
  const session = await getSession();

  if (!session || session.userType !== "customer") {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) {
    return null;
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
