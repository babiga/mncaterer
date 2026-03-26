import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bankTransferSettingsSchema } from "@/lib/validations/settings";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.userType !== "dashboard" && session.userType !== "customer")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const setting = await prisma.bankTransferSetting.findUnique({
      where: { key: "default" },
    });

    return NextResponse.json({
      success: true,
      data: setting
        ? setting
        : {
            bankName: "",
            accountNumber: "",
            accountHolderName: "",
            iban: "",
            paymentInstructions: "",
            isActive: true,
          },
    });
  } catch (error) {
    console.error("Get bank transfer settings error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (
      !session ||
      session.userType !== "dashboard" ||
      session.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const result = bankTransferSettingsSchema.safeParse(body);
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

    const data = result.data;
    
    const setting = await prisma.bankTransferSetting.upsert({
      where: { key: "default" },
      update: {
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountHolderName: data.accountHolderName,
        iban: data.iban || null,
        paymentInstructions: data.paymentInstructions || null,
        initialTaxAmount: data.initialTaxAmount,
        isActive: data.isActive,
      },
      create: {
        key: "default",
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountHolderName: data.accountHolderName,
        iban: data.iban || null,
        paymentInstructions: data.paymentInstructions || null,
        initialTaxAmount: data.initialTaxAmount,
        isActive: data.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Bank transfer settings updated successfully",
      data: setting,
    });
  } catch (error) {
    console.error("Update bank transfer settings error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
