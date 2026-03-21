"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ShoppingBag, Utensils, ChefHat, Calendar, MapPin, Sparkles, AlignLeft } from "lucide-react";
import { useBookingStore } from "@/lib/store/use-booking-store";
import type { ServiceTierOption, MenuOption, ChefOption, MenuItemOption } from "./BookingFlow";

interface BookingBasketProps {
  serviceTiers: ServiceTierOption[];
  menus: MenuOption[];
  chefs: ChefOption[];
  menuItems: MenuItemOption[];
}

export function BookingBasket({
  serviceTiers,
  menus,
  chefs,
  menuItems,
}: BookingBasketProps) {
  const t = useTranslations("Booking.basket");
  const tOrders = useTranslations("UserOrders");
  const serviceType = useBookingStore((s) => s.serviceType);
  const selectedMenusSelection = useBookingStore((s) => s.selectedMenus);
  const isCustomMenu = useBookingStore((s) => s.isCustomMenu);
  const customMenuItems = useBookingStore((s) => s.customMenuItems);
  const chefProfileId = useBookingStore((s) => s.chefProfileId);
  const eventDetails = useBookingStore((s) => s.eventDetails);
  const contactInfo = useBookingStore((s) => s.contactInfo);

  const resolvedTier = useMemo(() => {
    const sorted = [...serviceTiers].sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );
    if (serviceType === "VIP") return sorted.find((t) => t.isVIP) ?? sorted[0];
    return sorted.find((t) => !t.isVIP) ?? sorted[0];
  }, [serviceTiers, serviceType]);

  const selectedMenus = selectedMenusSelection
    .map((selection) => {
      const menu = menus.find((m) => m.id === selection.menuId);
      return menu ? { ...menu, guestCount: selection.guestCount } : null;
    })
    .filter(Boolean);
  const selectedChef = chefs.find((c) => c.id === chefProfileId);

  // Estimated total: sum of (menu.pricePerGuest * menu.guestCount)
  const estimatedTotal = useMemo(() => {
    if (isCustomMenu) {
      return customMenuItems.reduce((sum, item) => {
        const menuItem = menuItems.find((m) => m.id === item.menuItemId);
        return sum + (Number(menuItem?.price) || 0) * item.quantity;
      }, 0);
    }
    if (selectedMenusSelection.length === 0) return 0;
    return selectedMenusSelection.reduce((sum, selection) => {
      const menu = menus.find((m) => m.id === selection.menuId);
      const price = menu?.serviceTier ? Number(menu.serviceTier.pricePerGuest) : 0;
      return sum + price * selection.guestCount;
    }, 0);
  }, [isCustomMenu, customMenuItems, selectedMenusSelection, menus, menuItems]);

  const hasAny =
    serviceType ||
    (isCustomMenu ? customMenuItems.length > 0 : selectedMenusSelection.length > 0) ||
    eventDetails.venue ||
    eventDetails.eventDate;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="lg:sticky lg:top-28 rounded-2xl border border-white/5 bg-white/2 backdrop-blur-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
        <ShoppingBag className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-medium text-white">{t("title")}</h3>
      </div>

      <div className="p-5 space-y-4">
        {!hasAny ? (
          <p className="text-white/30 text-sm text-center py-6">
            {t("empty")}
          </p>
        ) : (
          <>
            {/* Service Type */}
            {serviceType && (
              <div className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/30">
                    {tOrders("summary.serviceType")}
                  </p>
                  <p className="text-sm text-white font-medium">
                    {tOrders(`serviceTypes.${serviceType}`)}
                  </p>
                  {resolvedTier && (
                    <p className="text-xs text-white/40 mt-0.5 capitalize">
                      {resolvedTier.name}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Menus / Custom Items */}
            {!isCustomMenu && selectedMenus.length > 0 && (
              <div className="flex items-start gap-3">
                <Utensils className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/30">
                    {tOrders("list.menu")}
                  </p>
                  {selectedMenus.map((menu) => (
                    <div key={menu!.id} className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-sm text-white font-medium truncate">
                        {menu!.name}
                      </p>
                      <p className="text-xs text-white/40 shrink-0">
                        {menu!.guestCount} {tOrders("summary.guests")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isCustomMenu && customMenuItems.length > 0 && (
              <div className="flex items-start gap-3">
                <Utensils className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/30">
                    {t("customItemsTitle")}
                  </p>
                  {customMenuItems.map((item) => {
                    const menuItem = menuItems.find((m) => m.id === item.menuItemId);
                    return (
                      <div key={item.menuItemId} className="flex items-center justify-between gap-2 mt-0.5">
                        <p className="text-sm text-white font-medium truncate">
                          {menuItem?.name || "Item"}
                        </p>
                        <p className="text-xs text-white/40 shrink-0">
                          x{item.quantity}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Chef */}
            {selectedChef && (
              <div className="flex items-start gap-3">
                <ChefHat className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/30">
                    {tOrders("list.chef")}
                  </p>
                  <p className="text-sm text-white font-medium">
                    {selectedChef.name}
                  </p>
                </div>
              </div>
            )}

            {/* Event info */}
            {eventDetails.eventDate && (
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/30">
                    {tOrders("summary.eventDateTime")}
                  </p>
                  <p className="text-sm text-white font-medium">
                    {eventDetails.eventDate} {eventDetails.eventTime && `• ${eventDetails.eventTime}`}
                  </p>
                </div>
              </div>
            )}

            {eventDetails.venue && (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/30">
                    {tOrders("summary.venue")}
                  </p>
                  <p className="text-sm text-white font-medium capitalize">
                    {eventDetails.venue}
                  </p>
                </div>
              </div>
            )}

            {contactInfo.specialRequests && (
              <div className="flex items-start gap-3">
                <AlignLeft className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/30">
                    {tOrders("form.fields.specialRequestsOptional")}
                  </p>
                  <p className="text-xs text-white/60 line-clamp-2 first-letter:uppercase">
                    {contactInfo.specialRequests}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Total */}
      {estimatedTotal > 0 && (
        <div className="px-5 py-4 border-t border-white/5 bg-primary/5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-primary/60">
              {tOrders("summary.estimatedTotal")}
            </span>
            <span className="text-lg font-medium text-white">
              {estimatedTotal.toLocaleString()}₮
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
