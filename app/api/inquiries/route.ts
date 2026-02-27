import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createInquirySchema, inquiriesQuerySchema } from "@/lib/validations/inquiries";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.userType !== "dashboard" || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const queryResult = inquiriesQuerySchema.safeParse({
      limit: searchParams.get("limit") || 100,
      status: searchParams.get("status") || undefined,
      sortOrder: searchParams.get("sortOrder") || "desc",
    });

    if (!queryResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: queryResult.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { limit, status, sortOrder } = queryResult.data;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const inquiries = await prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: sortOrder },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: inquiries,
    });
  } catch (error) {
    console.error("List inquiries error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();
    const result = createInquirySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input",
          details: result.error.flatten(),
        },
        { status: 400 },
      );
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        ...result.data,
        message: result.data.message?.trim() || null,
        ...(session?.userType === "customer"
          ? {
              user: {
                connect: { id: session.userId },
              },
            }
          : {}),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Inquiry submitted successfully",
      data: inquiry,
    });
  } catch (error) {
    console.error("Create inquiry error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
