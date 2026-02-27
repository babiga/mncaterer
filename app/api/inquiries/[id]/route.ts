import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { updateInquirySchema } from "@/lib/validations/inquiries";

function isAdminSession(
  session: Awaited<ReturnType<typeof getSession>>,
): session is NonNullable<Awaited<ReturnType<typeof getSession>>> {
  return Boolean(session && session.userType === "dashboard" && session.role === "ADMIN");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!isAdminSession(session)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const result = updateInquirySchema.safeParse(body);

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

    const existing = await prisma.inquiry.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Inquiry not found" },
        { status: 404 },
      );
    }

    const inquiry = await prisma.inquiry.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json({
      success: true,
      message: "Inquiry updated successfully",
      data: inquiry,
    });
  } catch (error) {
    console.error("Update inquiry error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!isAdminSession(session)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.inquiry.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Inquiry not found" },
        { status: 404 },
      );
    }

    await prisma.inquiry.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Inquiry deleted successfully",
    });
  } catch (error) {
    console.error("Delete inquiry error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
