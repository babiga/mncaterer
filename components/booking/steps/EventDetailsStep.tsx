"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import {
  CalendarIcon,
  Users,
  MapPin,
  Clock,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useBookingStore } from "@/lib/store/use-booking-store";
import { cn } from "@/lib/utils";
import type { ServiceTierOption, MenuOption } from "../BookingFlow";

function getTodayDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function EventDetailsStep({
  serviceTiers,
  menus,
}: {
  serviceTiers: ServiceTierOption[];
  menus: MenuOption[];
}) {
  const t = useTranslations("Booking.steps.eventDetails");
  const tOrders = useTranslations("UserOrders");
  const eventDetails = useBookingStore((s) => s.eventDetails);
  const serviceType = useBookingStore((s) => s.serviceType);
  const selectedMenus = useBookingStore((s) => s.selectedMenus);
  const setEventDetails = useBookingStore((s) => s.setEventDetails);
  const nextStep = useBookingStore((s) => s.nextStep);
  const prevStep = useBookingStore((s) => s.prevStep);

  const resolvedTier = useMemo(() => {
    const sorted = [...serviceTiers].sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );
    if (serviceType === "VIP") return sorted.find((t) => t.isVIP) ?? sorted[0];
    return sorted.find((t) => !t.isVIP) ?? sorted[0];
  }, [serviceTiers, serviceType]);

  // Estimated total: sum of (menu.pricePerGuest * menu.guestCount)
  const estimatedTotal = useMemo(() => {
    if (selectedMenus.length === 0) return 0;
    return selectedMenus.reduce((sum, selection) => {
      const menu = menus.find((m) => m.id === selection.menuId);
      const price = menu?.serviceTier ? Number(menu.serviceTier.pricePerGuest) : 0;
      return sum + price * selection.guestCount;
    }, 0);
  }, [selectedMenus, menus]);

  const canProceed =
    eventDetails.eventDate &&
    eventDetails.eventTime &&
    eventDetails.venue.trim().length >= 2;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-serif text-white mb-2">
          {t("heading")}
        </h2>
        <p className="text-white/50">{t("description")}</p>
      </div>

      <div className="space-y-6">
        {/* Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="p-5 rounded-2xl border border-white/5 bg-white/2"
          >
            <div className="flex items-center gap-3 mb-3">
              <CalendarIcon className="w-5 h-5 text-primary" />
              <label className="text-sm font-medium text-white">
                {tOrders("form.fields.eventDate")}
              </label>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-between h-12 rounded-xl bg-white/5 border-white/10 text-white",
                    !eventDetails.eventDate && "text-white/40",
                  )}
                >
                  {eventDetails.eventDate
                    ? format(parseISO(eventDetails.eventDate), "PPP")
                    : tOrders("form.placeholders.eventDate")}
                  <CalendarIcon className="h-4 w-4 opacity-60" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 min-w-3xs" align="start">
                <Calendar
                  mode="single"
                  className="w-full [--cell-size:2.5rem] sm:[--cell-size:2.8rem]"
                  selected={
                    eventDetails.eventDate
                      ? parseISO(eventDetails.eventDate)
                      : undefined
                  }
                  onSelect={(date) =>
                    setEventDetails({
                      eventDate: date ? format(date, "yyyy-MM-dd") : "",
                    })
                  }
                  disabled={(date) => date < new Date(getTodayDate())}
                  captionLayout="dropdown"
                />
              </PopoverContent>
            </Popover>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-5 rounded-2xl border border-white/5 bg-white/2"
          >
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-5 h-5 text-primary" />
              <label className="text-sm font-medium text-white">
                {tOrders("form.fields.eventTime")}
              </label>
            </div>
            <Input
              type="time"
              value={eventDetails.eventTime}
              onChange={(e) => setEventDetails({ eventTime: e.target.value })}
              className="bg-white/5 border-white/10 h-12 rounded-xl text-white"
            />
          </motion.div>
        </div>

        {/* Venue */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-5 rounded-2xl border border-white/5 bg-white/2"
          >
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-5 h-5 text-primary" />
              <label className="text-sm font-medium text-white">
                {tOrders("form.fields.locationName")}
              </label>
            </div>
            <Input
              value={eventDetails.venue}
              onChange={(e) => setEventDetails({ venue: e.target.value })}
              placeholder={tOrders("form.placeholders.locationName")}
              className="bg-white/5 border-white/10 h-12 rounded-xl text-white"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-5 rounded-2xl border border-white/5 bg-white/2"
          >
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-5 h-5 text-white/30" />
              <label className="text-sm font-medium text-white">
                {tOrders("form.fields.addressOptional")}
              </label>
            </div>
            <Input
              value={eventDetails.venueAddress}
              onChange={(e) =>
                setEventDetails({ venueAddress: e.target.value })
              }
              placeholder={tOrders("form.placeholders.address")}
              className="bg-white/5 border-white/10 h-12 rounded-xl text-white"
            />
          </motion.div>
        </div>

        {/* Estimated total */}
        {estimatedTotal > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-5 rounded-2xl bg-primary/5 border border-primary/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-primary/60 mb-1">
                  {tOrders("summary.estimatedTotal")}
                </p>
                <p className="text-2xl font-medium text-white">
                  {estimatedTotal.toLocaleString()}₮
                </p>
              </div>
              <div className="text-right text-white/40 text-sm">
                <p>
                  {selectedMenus.length} {tOrders("form.fields.menuOptional")}
                </p>
                {resolvedTier && <p className="text-xs">{resolvedTier.name}</p>}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/5">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          className="border-white/10 text-white hover:bg-white/5 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {tOrders("actions.back")}
        </Button>
        <Button
          type="button"
          onClick={nextStep}
          disabled={!canProceed}
          className="gap-2"
        >
          {tOrders("actions.continue")}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
