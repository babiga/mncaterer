import { getCurrentCustomer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import {
  ArrowLeft,
  ShoppingBag,
  Utensils,
  ChefHat,
  Calendar,
  MapPin,
  Users,
  Clock,
  MessageSquare,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { PaymentButton } from "@/components/booking/PaymentButton";

const bookingStatusVariant: Record<string, string> = {
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

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ locale: string; orderId: string }>;
}) {
  const { locale, orderId } = await params;
  const t = await getTranslations("UserOrders");
  const user = await getCurrentCustomer();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const booking = await prisma.booking.findUnique({
    where: {
      id: orderId,
      customerId: user.id,
    },
    include: {
      serviceTier: true,
      menu: true,
      chefProfile: {
        include: {
          dashboardUser: true,
        },
      },
    },
  });

  if (!booking) {
    notFound();
  }

  // Parse structured data for detailed view
  const customMenuData = booking.customMenuData as any;
  const isCustom = booking.isCustomMenu;
  const customItems = isCustom ? (customMenuData?.items || []) : [];
  let structuredMenus = !isCustom && customMenuData?.menus ? customMenuData.menus : [];

  // Fallback parsing for older bookings that stored multiple menus in specialRequests
  if (!isCustom && structuredMenus.length === 0 && booking.specialRequests) {
    const menuSection = booking.specialRequests.split("Selected menus:\n- ")[1];
    if (menuSection) {
      const menuLines = menuSection.split("\nContact email")[0].split("\n- ");
      structuredMenus = menuLines.map((line: string) => {
        const match = line.match(/(.*) \((\d+) guests\)/);
        if (match) {
          return { name: match[1], guestCount: parseInt(match[2], 10) };
        }
        return null;
      }).filter(Boolean);
    }
  }

  // Clean specialRequests for display (remove structured info)
  let displayRequests = booking.specialRequests;
  if (displayRequests) {
    const markers = ["Selected menus:", "Custom menu items:", "Contact email for this booking:"];
    let firstMarker = -1;
    for (const marker of markers) {
      const idx = displayRequests.indexOf(marker);
      if (idx !== -1 && (firstMarker === -1 || idx < firstMarker)) {
        firstMarker = idx;
      }
    }
    if (firstMarker !== -1) {
      displayRequests = displayRequests.substring(0, firstMarker).trim();
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header with Navigation */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Link
            href="/orders"
            className="p-2.5 rounded-full bg-muted/50 hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground/70 mb-1">
              {t("list.orderNumber", { bookingNumber: "" }).replace("#", "").replace(":", "").trim()}
            </p>
            <h1 className="text-3xl md:text-4xl font-serif tracking-tight">
              #{booking.bookingNumber}
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <Badge
              variant="outline"
              className={`${bookingStatusVariant[booking.status]} px-4 py-1.5 rounded-full text-xs border-2`}
            >
              {t(`statuses.${booking.status}`)}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-muted/30 border border-muted-foreground/10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">
                {format(new Date(booking.createdAt), "PPP")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-sm">{t("list.submitted")}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {booking.status === "PENDING" && (
              <PaymentButton
                bookingNumber={booking.bookingNumber}
                amount={Number(booking.totalPrice)}
              />
            )}
            <Badge
              variant="outline"
              className={`${bookingStatusVariant[booking.status]} sm:hidden px-3 py-1 rounded-full text-xs`}
            >
              {t(`statuses.${booking.status}`)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column: Service Info */}
        <div className="md:col-span-2 space-y-8">
          <section className="space-y-6">
            <h2 className="text-xl font-serif flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {t("summary.serviceType")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 p-6 rounded-2xl border bg-card">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {t("form.fields.eventType")}
                </p>
                <p className="text-base font-medium">
                  {t(`serviceTypes.${booking.serviceType}`)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {t("form.fields.serviceTier")}
                </p>
                <p className="text-base font-medium capitalize">
                  {booking.serviceTier.name}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {t("list.menu")}
                </p>
                <div className="flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-primary" />
                  <p className="text-base font-medium">
                    {isCustom 
                      ? t("serviceTypes.OTHER") 
                      : (structuredMenus.length > 1 
                        ? `${structuredMenus.length} ${t("list.menu")}` 
                        : (booking.menu?.name || t("list.notSelected")))}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {t("list.chef")}
                </p>
                <div className="flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-primary" />
                  <p className="text-base font-medium">
                    {booking.chefProfile?.dashboardUser.name || t("form.none.chef")}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-serif flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              {t("form.steps.eventDetails.title")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 p-6 rounded-2xl border bg-card">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {t("form.fields.eventDate")}
                </p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <p className="text-base font-medium">
                    {format(new Date(booking.eventDate), "PPP")}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {t("form.fields.eventTime")}
                </p>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <p className="text-base font-medium">{booking.eventTime}</p>
                </div>
              </div>
              <div className="sm:col-span-2 space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {t("summary.venue")}
                </p>
                <p className="text-base font-medium capitalize">
                  {booking.venue}
                </p>
                {booking.venueAddress && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {booking.venueAddress}
                  </p>
                )}
              </div>
              {booking.specialRequests && (
                <div className="sm:col-span-2 space-y-2 mt-2">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="w-3 h-3" />
                    {t("form.fields.specialRequestsOptional").replace(" (Optional)", "")}
                  </p>
                  <div className="p-4 rounded-xl bg-muted/30 border border-dashed text-sm italic whitespace-pre-line">
                    {displayRequests}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right column: Summary */}
        <div className="space-y-8">
          <section className="space-y-6">
            <h2 className="text-xl font-serif flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              {t("summary.total")}
            </h2>
            <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {t("summary.guests")}
                    </p>
                    <p className="text-base font-medium">
                      {booking.guestCount} {t("summary.guests")}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-4">
                  {isCustom ? (
                    customItems.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-start text-sm">
                        <div className="max-w-[70%]">
                          <p className="font-medium leading-tight">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">x {item.quantity}</p>
                        </div>
                        <span className="font-medium whitespace-nowrap text-xs">
                          {formatPrice(item.price * item.quantity)}₮
                        </span>
                      </div>
                    ))
                  ) : structuredMenus.length > 0 ? (
                    structuredMenus.map((menu: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-start text-sm">
                        <div className="max-w-[70%]">
                          <p className="font-medium leading-tight">{menu.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{menu.guestCount} {t("summary.guests")}</p>
                        </div>
                        {menu.pricePerGuest && (
                          <span className="font-medium whitespace-nowrap text-xs">
                            {formatPrice(menu.pricePerGuest * menu.guestCount)}₮
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-normal">
                        {booking.menu?.name || t("serviceTypes." + booking.serviceType)}
                      </span>
                      <span className="font-medium">{formatPrice(Number(booking.totalPrice))}₮</span>
                    </div>
                  )}
                </div>

                {!isCustom && structuredMenus.length <= 1 && (
                  <div className="pt-4 border-t border-dashed space-y-2 font-medium bg-muted/20 -mx-6 px-6 py-3">
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                      <span className="uppercase tracking-wider">{t("pricePerGuest")}</span>
                      <span>{formatPrice(Number(booking.serviceTier.pricePerGuest))}₮</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                      <span className="uppercase tracking-wider">{t("totalGuests")}</span>
                      <span>x {booking.guestCount}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-primary/10 p-6 flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] font-bold text-primary">
                  {t("summary.total")}
                </span>
                <span className="text-2xl font-serif font-bold text-primary transition-all">
                  {formatPrice(Number(booking.totalPrice))}₮
                </span>
              </div>
            </div>
          </section>

          {/* Additional details card or helper info */}
          {/* <div className="p-5 rounded-2xl bg-muted/20 border border-dashed flex items-start gap-3">
            <ShoppingBag className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground space-y-2">
              <p className="font-semibold text-foreground uppercase tracking-wider">
                {t("paymentDetails")}
              </p>
              <p>
                Your booking is currently in {booking.status.toLowerCase()} status.
                Please contact support if you have any questions regarding your order.
              </p>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
