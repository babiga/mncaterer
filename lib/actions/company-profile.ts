"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  companyProfileSchema,
  type CompanyProfileData,
} from "@/lib/validations/company";
import { revalidatePath } from "next/cache";

export async function updateCompanyProfile(data: CompanyProfileData) {
  const session = await getSession();

  if (!session || session.role !== "COMPANY") {
    throw new Error("Unauthorized");
  }

  const validatedData = companyProfileSchema.parse(data);

  const { name, phone, avatar, ...profileData } = validatedData;

  try {
    await prisma.$transaction([
      prisma.dashboardUser.update({
        where: { id: session.userId },
        data: {
          name,
          phone,
          avatar,
        },
      }),
      prisma.companyProfile.update({
        where: { dashboardUserId: session.userId },
        data: {
          ...profileData,
          updatedAt: new Date(),
        },
      }),
    ]);

    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    console.error("Failed to update company profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}
