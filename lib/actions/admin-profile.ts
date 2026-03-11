"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  adminProfileSchema,
  type AdminProfileData,
} from "@/lib/validations/admin";
import { revalidatePath } from "next/cache";

export async function updateAdminProfile(data: AdminProfileData) {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const validatedData = adminProfileSchema.parse(data);

  try {
    await prisma.dashboardUser.update({
      where: { id: session.userId },
      data: {
        ...validatedData,
      },
    });

    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    console.error("Failed to update admin profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}
