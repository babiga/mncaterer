"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookingStore } from "@/lib/store/use-booking-store";
import { Link, useRouter } from "@/i18n/routing";
import type { ServiceTierOption, MenuOption, ChefOption, MenuItemOption } from "../BookingFlow";

interface ReviewStepProps {
  serviceTiers: ServiceTierOption[];
  menus: MenuOption[];
  chefs: ChefOption[];
  menuItems: MenuItemOption[];
}

export function ReviewStep({ serviceTiers, menus, chefs, menuItems }: ReviewStepProps) {
  const t = useTranslations("Booking.steps.review");
  const tCommon = useTranslations("Booking.steps.common");
  const tOrders = useTranslations("UserOrders");
  const store = useBookingStore();
  const router = useRouter();
  const [bookingId, setBookingId] = useState<string | null>(null);

  const resolvedTier = useMemo(() => {
    const sorted = [...serviceTiers].sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );
    if (store.serviceType === "VIP")
      return sorted.find((t) => t.isVIP) ?? sorted[0];
    return sorted.find((t) => !t.isVIP) ?? sorted[0];
  }, [serviceTiers, store.serviceType]);

  const selectedMenus = store.selectedMenus
    .map((selection) => {
      const menu = menus.find((m) => m.id === selection.menuId);
      return menu ? { ...menu, guestCount: selection.guestCount } : null;
    })
    .filter(Boolean);
  const selectedChef = chefs.find((c) => c.id === store.chefProfileId);

  // Estimated total: sum of (menu.pricePerGuest * menu.guestCount)
  const estimatedTotal = useMemo(() => {
    if (store.isCustomMenu) {
      return store.customMenuItems.reduce((sum, item) => {
        const menuItem = menuItems.find((m) => m.id === item.menuItemId);
        return sum + (Number(menuItem?.price) || 0) * item.quantity;
      }, 0);
    }
    if (store.selectedMenus.length === 0) return 0;
    return store.selectedMenus.reduce((sum, selection) => {
      const menu = menus.find((m) => m.id === selection.menuId);
      const price = menu?.serviceTier ? Number(menu.serviceTier.pricePerGuest) : 0;
      return sum + price * selection.guestCount;
    }, 0);
  }, [store.isCustomMenu, store.customMenuItems, store.selectedMenus, menus, menuItems]);

  async function handleSubmit() {
    store.setSubmitting(true);
    store.setSubmissionError(null);

    const payload = {
      serviceType: store.serviceType,
      serviceTierId: resolvedTier?.id,
      selectedMenus: store.selectedMenus,
      isCustomMenu: store.isCustomMenu,
      customMenuItems: store.customMenuItems,
      chefProfileId: store.chefProfileId?.trim() || null,
      eventDate: store.eventDetails.eventDate,
      eventTime: store.eventDetails.eventTime,
      venue: store.eventDetails.venue.trim(),
      guestCount: store.eventDetails.guestCount,
      contactName: store.contactInfo.contactName.trim(),
      contactPhone: store.contactInfo.contactPhone.trim(),
      contactEmail: store.contactInfo.contactEmail.trim(),
      specialRequests: store.contactInfo.specialRequests?.trim() || null,
    };

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        store.setSubmissionError(
          result.error || tOrders("messages.createError"),
        );
        store.setSubmitting(false);
        return;
      }

      setBookingId(result.data.id);
      store.setSubmitting(false);
      store.setSubmitted(true);
    } catch {
      store.setSubmissionError(tOrders("messages.createError"));
      store.setSubmitting(false);
    }
  }

  // Success state
  if (store.isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 12, delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6"
        >
          <PartyPopper className="w-9 h-9 text-emerald-400" />
        </motion.div>
        <h2 className="text-3xl font-serif text-white mb-3">{t("successTitle")}</h2>
        <p className="text-white/50 max-w-md mb-8">
          {t("successDescription")}
        </p>
        <div className="flex gap-3">
          <Button asChild variant="outline" className="border-white/10 text-white hover:bg-white/5">
            <Link href="/">{t("backHome")}</Link>
          </Button>
          <Button
            onClick={() => {
              if (bookingId) {
                router.push(`/orders/${bookingId}`);
                store.resetBooking();
              } else {
                store.resetBooking();
              }
            }}
            className="gap-2"
          >
            {t("newBooking")}
          </Button>
        </div>
      </motion.div>
    );
  }

  const summaryRows = [
    {
      label: tOrders("summary.serviceType"),
      value: store.serviceType
        ? tOrders(`serviceTypes.${store.serviceType}`)
        : "—",
    },
    {
      label: tOrders("summary.assignedPackage"),
      value: resolvedTier?.name ?? tOrders("summary.autoSelectUnavailable"),
    },
    {
      label: tOrders("list.menu"),
      value: store.isCustomMenu
        ? store.customMenuItems
          .map((item) => {
            const menuItem = menuItems.find((m) => m.id === item.menuItemId);
            return `${menuItem?.name || tCommon("item")} (x${item.quantity})`;
          })
          .join(", ")
        : selectedMenus.length > 0
          ? selectedMenus
            .map((m) => `${m!.name} (${m!.guestCount} ${tOrders("summary.guests")})`)
            .join(", ")
          : tOrders("form.none.menu"),
    },
    {
      label: tOrders("list.chef"),
      value: selectedChef
        ? `${selectedChef.name} (${selectedChef.specialty})`
        : tOrders("form.none.chef"),
    },
    {
      label: tOrders("summary.eventDateTime"),
      value: `${store.eventDetails.eventDate} ${tOrders("list.at")} ${store.eventDetails.eventTime}`,
    },
    {
      label: tOrders("summary.venue"),
      value: store.eventDetails.venue || "—",
    },
    {
      label: tOrders("form.fields.guestCount"),
      value: `${store.eventDetails.guestCount} ${tOrders("summary.guests")}`,
    },
    {
      label: tOrders("summary.contact"),
      value: `${store.contactInfo.contactName} | ${store.contactInfo.contactPhone}`,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-serif text-white mb-2">
          {t("heading")}
        </h2>
        <p className="text-white/50">{t("description")}</p>
      </div>

      {/* Summary grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/5 bg-white/2 overflow-hidden mb-6"
      >
        {summaryRows.map((row, i) => (
          <div
            key={i}
            className={`flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 px-5 py-4 ${i < summaryRows.length - 1 ? "border-b border-white/5" : ""
              }`}
          >
            <span className="text-white/40 text-sm sm:w-44 shrink-0">
              {row.label}
            </span>
            <span className="text-white font-medium text-sm">
              {row.value}
            </span>
          </div>
        ))}
      </motion.div>

      {/* Contact email */}
      <div className="text-white/30 text-sm mb-6 px-1">
        {store.contactInfo.contactEmail}
      </div>

      {/* Estimated total */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="p-5 rounded-2xl bg-primary/5 border border-primary/20 mb-6"
      >
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest text-primary/60">
            {tOrders("summary.estimatedTotal")}
          </p>
          <p className="text-2xl font-medium text-white">
            {estimatedTotal.toLocaleString()}₮
          </p>
        </div>
      </motion.div>

      {/* Error */}
      {store.submissionError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 mb-6">
          {store.submissionError}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <Button
          type="button"
          variant="outline"
          onClick={store.prevStep}
          disabled={store.isSubmitting}
          className="border-white/10 text-white hover:bg-white/5 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {tOrders("actions.back")}
        </Button>
        <Button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={store.isSubmitting}
          className="gap-2 min-w-[160px]"
        >
          {store.isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {tOrders("actions.submitting")}
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              {tOrders("actions.createBooking")}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
