import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signupApiSchema } from "@/lib/validations/auth";
import { hashPassword } from "@/lib/auth";
import { generateUniqueSlug, generateSlug } from "@/lib/slug";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const result = signupApiSchema.safeParse(body);
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

    const data = result.data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "EMAIL_EXISTS",
          message: "An account with this email already exists",
        },
        { status: 409 },
      );
    }

    // Also check DashboardUser table
    const existingDashboardUser = await prisma.dashboardUser.findUnique({
      where: { email: data.email },
    });

    if (existingDashboardUser) {
      return NextResponse.json(
        {
          success: false,
          error: "EMAIL_EXISTS",
          message: "An account with this email already exists",
        },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user based on type
    if (data.userType === "INDIVIDUAL") {
      const user = await prisma.user.create({
        data: {
          email: data.email,
          name: `${data.firstName} ${data.lastName}`,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          password: hashedPassword,
          userType: "INDIVIDUAL",
        },
        select: {
          id: true,
          email: true,
          name: true,
          firstName: true,
          lastName: true,
          userType: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Account created successfully",
        user,
      });
    } else if (data.userType === "CHEF") {
      // CHEF user (DashboardUser + ChefProfile)
      const user = await prisma.dashboardUser.create({
        data: {
          email: data.email,
          name: `${data.firstName} ${data.lastName}`,
          phone: data.phone,
          password: hashedPassword,
          role: "CHEF",
          isVerified: true, // Auto-verify since there's no email verification flow
          chefProfile: {
            create: {
              id: await generateUniqueSlug(
                generateSlug(`${data.firstName} ${data.lastName}`),
                async (slug) => !!(await prisma.chefProfile.findUnique({ where: { id: slug } }))
              ),
              specialty: "General", // Default specialty
              yearsExperience: 0, // Default experience
            },
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Chef account created successfully",
        user,
      });
    } else {
      // CORPORATE user
      const user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.companyName,
          organizationName: data.companyName,
          companyLegalNo: data.companyLegalNo,
          phone: data.phone,
          password: hashedPassword,
          userType: "CORPORATE",
        },
        select: {
          id: true,
          email: true,
          name: true,
          organizationName: true,
          companyLegalNo: true,
          userType: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Account created successfully",
        user,
      });
    }
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { success: false, error: "INTERNAL_SERVER_ERROR" },
      { status: 500 },
    );
  }
}
