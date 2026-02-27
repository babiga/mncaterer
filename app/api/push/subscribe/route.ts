import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

const unsubscribeSchema = z.object({
  endpoint: z.string().url(),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const parsed = pushSubscriptionSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid push subscription payload" },
        { status: 400 },
      );
    }

    const payload = parsed.data;
    const userAgent = req.headers.get("user-agent") ?? undefined;

    const isDashboardUser = session?.userType === "dashboard";
    const isCustomer = session?.userType === "customer";

    await prisma.pushSubscription.upsert({
      where: { endpoint: payload.endpoint },
      create: {
        endpoint: payload.endpoint,
        p256dh: payload.keys.p256dh,
        auth: payload.keys.auth,
        userAgent,
        userId: isCustomer ? session?.userId : null,
        dashboardUserId: isDashboardUser ? session?.userId : null,
      },
      update: {
        p256dh: payload.keys.p256dh,
        auth: payload.keys.auth,
        userAgent,
        userId: isCustomer ? session?.userId : null,
        dashboardUserId: isDashboardUser ? session?.userId : null,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to persist push subscription" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const parsed = unsubscribeSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid unsubscribe payload" },
        { status: 400 },
      );
    }

    await prisma.pushSubscription.deleteMany({
      where: { endpoint: parsed.data.endpoint },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to remove push subscription" },
      { status: 500 },
    );
  }
}
