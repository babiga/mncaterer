import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DAY_MS = 24 * 60 * 60 * 1000;

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.userType !== "dashboard") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const startDate = new Date(todayUtc.getTime() - (90 - 1) * DAY_MS);

    const [bookings, users, visitors] = await Promise.all([
      prisma.booking.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
      }),
      prisma.visitorMetric.findMany({
        where: { timestamp: { gte: startDate } },
        select: { timestamp: true, deviceType: true },
      }),
    ]);

    const trendMap = new Map<string, { date: string; bookings: number; customers: number; visitors: number; mobileVisitors: number; desktopVisitors: number }>();
    for (let i = 0; i < 90; i += 1) {
      const date = new Date(startDate.getTime() + i * DAY_MS);
      const key = toDateKey(date);
      trendMap.set(key, { date: key, bookings: 0, customers: 0, visitors: 0, mobileVisitors: 0, desktopVisitors: 0 });
    }

    for (const booking of bookings) {
      const key = toDateKey(booking.createdAt);
      const bucket = trendMap.get(key);
      if (bucket) bucket.bookings += 1;
    }

    for (const user of users) {
      const key = toDateKey(user.createdAt);
      const bucket = trendMap.get(key);
      if (bucket) bucket.customers += 1;
    }

    for (const visitor of visitors) {
      const key = toDateKey(visitor.timestamp);
      const bucket = trendMap.get(key);
      if (bucket) {
        bucket.visitors += 1;
        if (visitor.deviceType === "mobile") {
          bucket.mobileVisitors += 1;
        } else {
          bucket.desktopVisitors += 1;
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: Array.from(trendMap.values()),
    });
  } catch (error) {
    console.error("Dashboard trend analytics error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
