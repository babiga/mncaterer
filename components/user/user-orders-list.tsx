"use client";

import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShoppingBag,
  Utensils,
  ChefHat,
  Calendar,
  MapPin,
  Users,
  Clock,
  ExternalLink,
} from "lucide-react";

type BookingListItem = {
  id: string;
  bookingNumber: string;
  serviceType: "CORPORATE" | "PRIVATE" | "WEDDING" | "VIP" | "OTHER";
  status:
  | "PENDING"
  | "CONFIRMED"
  | "DEPOSIT_PAID"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";
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
    <div className="space-y-4">
      {bookings.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <ShoppingBag className="w-12 h-12 text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground">{t("list.empty")}</p>
          </CardContent>
        </Card>
      ) : (
        bookings.map((booking) => (
          <Link
            href={`/orders/${booking.id}`}
            key={booking.id}
            className="group block rounded-2xl border bg-card hover:border-primary/50 transition-all duration-300 overflow-hidden"
          >
            {/* Header section */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b bg-muted/30 group-hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground/70 mb-0.5">
                    {t("list.orderNumber", { bookingNumber: "" }).replace("#", "").replace(":", "").trim()}
                  </p>
                  <p className="font-serif text-lg font-medium group-hover:text-primary transition-colors">
                    #{booking.bookingNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Badge
                  variant="outline"
                  className={`${bookingStatusVariant[booking.status]} px-3 py-1 rounded-full text-[11px] border`}
                >
                  {t(`statuses.${booking.status}`)}
                </Badge>
                <div className="hidden sm:flex items-center text-primary group-hover:translate-x-1 transition-transform">
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Content section */}
            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Service & Guests */}
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Utensils className="w-4 h-4 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                        {t("summary.serviceType")}
                      </p>
                      <p className="text-sm font-medium">
                        {t(`serviceTypes.${booking.serviceType}`)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                        {booking.serviceTier.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Users className="w-4 h-4 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                        {t("summary.guests")}
                      </p>
                      <p className="text-sm font-medium">
                        {booking.guestCount} {t("summary.guests")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Calendar className="w-4 h-4 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                        {t("summary.eventDateTime")}
                      </p>
                      <p className="text-sm font-medium">
                        {format(new Date(booking.eventDate), "PPP")}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{booking.eventTime}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <MapPin className="w-4 h-4 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                        {t("summary.venue")}
                      </p>
                      <p className="text-sm font-medium capitalize truncate max-w-[150px]">
                        {booking.venue}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chef & Menu */}
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <ChefHat className="w-4 h-4 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                        {t("list.chef")}
                      </p>
                      <p className="text-sm font-medium truncate max-w-[150px]">
                        {booking.chefProfile?.dashboardUser.name ?? t("form.none.chef")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Utensils className="w-4 h-4 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                        {t("list.menu")}
                      </p>
                      <p className="text-sm font-medium truncate max-w-[150px]">
                        {booking.menu?.name ?? t("list.notSelected")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price & Summary */}
                <div className="flex flex-col justify-end p-4 rounded-xl bg-muted/30 lg:items-end">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                    {t("summary.total")}
                  </p>
                  <p className="text-xl font-medium text-primary">
                    {formatPrice(booking.totalPrice)}₮
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    {t("list.submitted")}: {format(new Date(booking.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
