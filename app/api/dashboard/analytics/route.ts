import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  return Number(value);
}

function percentageDelta(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.userType !== "dashboard") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const currentMonthStart = getMonthStart(now);
    const previousMonthStart = new Date(
      currentMonthStart.getFullYear(),
      currentMonthStart.getMonth() - 1,
      1,
    );

    // Weekly stats
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [
      totalRevenueAgg,
      currentRevenueAgg,
      previousRevenueAgg,
      newCustomersCurrent,
      newCustomersPrevious,
      customerCountTotal,
      dashboardActiveCountTotal,
      dashboardCreatedCurrent,
      dashboardCreatedPrevious,
      bookingsCurrent,
      bookingsPrevious,
      visitorCountTotal,
      visitorCountCurrent,
      visitorCountPrevious,
      visitorCountWeek,
      visitorCountWeekPrevious,
    ] = await Promise.all([
      prisma.booking.aggregate({
        where: { status: "COMPLETED" },
        _sum: { totalPrice: true },
      }),
      prisma.booking.aggregate({
        where: {
          status: "COMPLETED",
          createdAt: { gte: currentMonthStart },
        },
        _sum: { totalPrice: true },
      }),
      prisma.booking.aggregate({
        where: {
          status: "COMPLETED",
          createdAt: { gte: previousMonthStart, lt: currentMonthStart },
        },
        _sum: { totalPrice: true },
      }),
      prisma.user.count({
        where: { createdAt: { gte: currentMonthStart } },
      }),
      prisma.user.count({
        where: { createdAt: { gte: previousMonthStart, lt: currentMonthStart } },
      }),
      prisma.user.count(),
      prisma.dashboardUser.count({
        where: { isActive: true },
      }),
      prisma.dashboardUser.count({
        where: { createdAt: { gte: currentMonthStart } },
      }),
      prisma.dashboardUser.count({
        where: { createdAt: { gte: previousMonthStart, lt: currentMonthStart } },
      }),
      prisma.booking.count({
        where: { createdAt: { gte: currentMonthStart } },
      }),
      prisma.booking.count({
        where: { createdAt: { gte: previousMonthStart, lt: currentMonthStart } },
      }),
      prisma.visitorMetric.count(),
      prisma.visitorMetric.count({
        where: { timestamp: { gte: currentMonthStart } },
      }),
      prisma.visitorMetric.count({
        where: { timestamp: { gte: previousMonthStart, lt: currentMonthStart } },
      }),
      prisma.visitorMetric.count({
        where: { timestamp: { gte: sevenDaysAgo } },
      }),
      prisma.visitorMetric.count({
        where: { timestamp: { gte: fourteenDaysAgo, lt: sevenDaysAgo } },
      }),
    ]);

    const totalRevenue = toNumber(totalRevenueAgg._sum.totalPrice);
    const currentRevenue = toNumber(currentRevenueAgg._sum.totalPrice);
    const previousRevenue = toNumber(previousRevenueAgg._sum.totalPrice);

    const revenueDelta = percentageDelta(currentRevenue, previousRevenue);
    const customersDelta = percentageDelta(newCustomersCurrent, newCustomersPrevious);
    const currentAccountsCreated = newCustomersCurrent + dashboardCreatedCurrent;
    const previousAccountsCreated = newCustomersPrevious + dashboardCreatedPrevious;
    const activeAccountsDelta = percentageDelta(currentAccountsCreated, previousAccountsCreated);
    const bookingsGrowthRate = percentageDelta(bookingsCurrent, bookingsPrevious);

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        newCustomers: newCustomersCurrent,
        activeAccounts: customerCountTotal + dashboardActiveCountTotal,
        growthRate: bookingsGrowthRate,
        visitors: visitorCountTotal,
        visitorDelta: percentageDelta(visitorCountCurrent, visitorCountPrevious),
        visitorsWeek: visitorCountWeek,
        visitorsWeekDelta: percentageDelta(visitorCountWeek, visitorCountWeekPrevious),
        deltas: {
          totalRevenue: revenueDelta,
          newCustomers: customersDelta,
          activeAccounts: activeAccountsDelta,
          growthRate: bookingsGrowthRate,
          visitors: percentageDelta(visitorCountCurrent, visitorCountPrevious),
        },
      },
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
