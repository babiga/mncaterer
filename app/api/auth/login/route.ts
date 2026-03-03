import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import { verifyPassword, createSession, setSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_INPUT",
          details: result.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { email, password } = result.data;

    // Check DashboardUser first
    const dashboardUser = await prisma.dashboardUser.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        isActive: true,
        isVerified: true,
      },
    });

    if (dashboardUser) {
      if (!dashboardUser.isActive) {
        return NextResponse.json(
          { success: false, error: "ACCOUNT_DEACTIVATED" },
          { status: 403 },
        );
      }

      const isValidPassword = await verifyPassword(
        password,
        dashboardUser.password,
      );
      if (!isValidPassword) {
        return NextResponse.json(
          { success: false, error: "INVALID_CREDENTIALS" },
          { status: 401 },
        );
      }

      // Update lastLoginAt
      await prisma.dashboardUser.update({
        where: { id: dashboardUser.id },
        data: { lastLoginAt: new Date() },
      });

      // Create and set session cookie
      const token = await createSession({
        userId: dashboardUser.id,
        userType: "dashboard",
        role: dashboardUser.role,
      });
      await setSessionCookie(token);

      const { password: _, ...userWithoutPassword } = dashboardUser;
      return NextResponse.json({
        success: true,
        user: userWithoutPassword,
        userType: "dashboard",
      });
    }

    // Check regular User
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        phone: true,
        userType: true,
      },
    });

    if (user) {
      if (!user.password) {
        return NextResponse.json(
          {
            success: false,
            error: "PASSWORD_NOT_SET",
          },
          { status: 401 },
        );
      }

      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { success: false, error: "INVALID_CREDENTIALS" },
          { status: 401 },
        );
      }

      // Create and set session cookie
      const token = await createSession({
        userId: user.id,
        userType: "customer",
      });
      await setSessionCookie(token);

      const { password: _, ...userWithoutPassword } = user;
      return NextResponse.json({
        success: true,
        user: userWithoutPassword,
        userType: "customer",
      });
    }

    // No user found
    return NextResponse.json(
      { success: false, error: "INVALID_CREDENTIALS" },
      { status: 401 },
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "INTERNAL_SERVER_ERROR" },
      { status: 500 },
    );
  }
}
