import { getCurrentUserWithProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DashboardRecentBookings } from "@/components/dashboard-recent-bookings";
import { SectionCards } from "@/components/section-cards";

export default async function Page() {
  const user = await getCurrentUserWithProfile();

  if (user?.role === "CHEF") {
    redirect("/dashboard/profile");
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DashboardRecentBookings />
    </div>
  );
}
