"use client";

import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type BookingListItem = {
  id: string;
  bookingNumber: string;
  serviceType: "CORPORATE" | "PRIVATE" | "WEDDING" | "VIP" | "OTHER";
  status: "PENDING" | "CONFIRMED" | "DEPOSIT_PAID" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  eventDate: string;
  eventTime: string;
  guestCount: number;
  venue: string;
  totalPrice: number;
  depositAmount: number | null;
  serviceTier: { id: string; name: string; pricePerGuest: number };
  menu: { id: string; name: string } | null;
  chefProfile: { id: string; dashboardUser: { name: string } } | null;
  createdAt: string;
};

type UserOrdersListProps = {
  bookings: BookingListItem[];
};

const bookingStatusVariant: Record<BookingListItem["status"], string> = {
  PENDING: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  CONFIRMED: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  DEPOSIT_PAID: "bg-cyan-500/10 text-cyan-700 border-cyan-500/20",
  IN_PROGRESS: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20",
  COMPLETED: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  CANCELLED: "bg-rose-500/10 text-rose-700 border-rose-500/20",
};

function formatPrice(amount: number) {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function UserOrdersList({ bookings }: UserOrdersListProps) {
  const t = useTranslations("UserOrders");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("list.title")}</CardTitle>
        <CardDescription>{t("list.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {bookings.length === 0 ? (
          <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
            {t("list.empty")}
          </div>
        ) : (
          bookings.map((booking) => (
            <Link href={`/orders/${booking.id}`} key={booking.id} className="block rounded-lg border p-4 hover:border-primary transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("list.orderNumber", { bookingNumber: booking.bookingNumber })}
                  </p>
                  <p className="font-medium">{booking.serviceTier.name}</p>
                </div>
                <Badge variant="outline" className={bookingStatusVariant[booking.status]}>
                  {t(`statuses.${booking.status}`)}
                </Badge>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-muted-foreground md:grid-cols-2">
                <p>
                  {t(`serviceTypes.${booking.serviceType}`)} | {t("list.guests", { count: booking.guestCount })}
                </p>
                <p>
                  {format(new Date(booking.eventDate), "PPP")} {t("list.at")} {booking.eventTime}
                </p>
                <p>{booking.venue}</p>
                <p>
                  {t("summary.total")}: {formatPrice(booking.totalPrice)}
                </p>
                {booking.menu ? (
                  <p>
                    {t("list.menu")}: {booking.menu.name}
                  </p>
                ) : (
                  <p>
                    {t("list.menu")}: {t("list.notSelected")}
                  </p>
                )}
                <p>
                  {t("list.chef")}: {booking.chefProfile?.dashboardUser.name ?? t("form.none.chef")}
                </p>
                <p>
                  {t("list.submitted")}: {format(new Date(booking.createdAt), "PPP")}
                </p>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
