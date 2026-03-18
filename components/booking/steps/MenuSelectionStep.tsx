"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  UtensilsCrossed,
  Check,
  ChefHat,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBookingStore } from "@/lib/store/use-booking-store";
import type {
  ServiceTierOption,
  MenuOption,
  ChefOption,
} from "../BookingFlow";

interface MenuSelectionStepProps {
  serviceTiers: ServiceTierOption[];
  menus: MenuOption[];
  chefs: ChefOption[];
}

export function MenuSelectionStep({
  serviceTiers,
  menus,
  chefs,
}: MenuSelectionStepProps) {
  const t = useTranslations("Booking.steps.menuSelection");
  const tOrders = useTranslations("UserOrders");
  const serviceType = useBookingStore((s) => s.serviceType);
  const selectedMenuIds = useBookingStore((s) => s.selectedMenuIds);
  const chefProfileId = useBookingStore((s) => s.chefProfileId);
  const toggleMenu = useBookingStore((s) => s.toggleMenu);
  const setChef = useBookingStore((s) => s.setChef);
  const nextStep = useBookingStore((s) => s.nextStep);
  const prevStep = useBookingStore((s) => s.prevStep);

  // Resolve the service tier for the selected type
  const resolvedTier = useMemo(() => {
    const sorted = [...serviceTiers].sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );
    if (serviceType === "VIP") return sorted.find((t) => t.isVIP) ?? sorted[0];
    return sorted.find((t) => !t.isVIP) ?? sorted[0];
  }, [serviceTiers, serviceType]);

  // Filter by tier
  const filteredMenus = useMemo(
    () =>
      menus.filter(
        (menu) =>
          !menu.serviceTierId || menu.serviceTierId === resolvedTier?.id,
      ),
    [menus, resolvedTier?.id],
  );

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-serif text-white mb-2">
          {t("heading")}
        </h2>
        <p className="text-white/50">{t("description")}</p>
      </div>

      {/* Menu cards */}
      {filteredMenus.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {filteredMenus.map((menu, i) => {
            const isSelected = selectedMenuIds.includes(menu.id);
            return (
              <motion.button
                key={menu.id}
                type="button"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => toggleMenu(menu.id)}
                className={`group relative p-6 rounded-2xl border-2 text-left transition-all duration-300 ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-white/5 bg-white/2 hover:border-white/15"
                }`}
              >
                {/* Selected checkmark */}
                <div
                  className={`absolute top-4 right-4 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-white/20 bg-transparent"
                  }`}
                >
                  {isSelected && (
                    <Check className="w-4 h-4 text-black" />
                  )}
                </div>

                {/* Header */}
                <div className="mb-4">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-medium mb-1 block">
                    {menu.serviceTier?.name || tOrders("form.none.menu")}
                  </span>
                  <h3 className="text-lg font-medium text-white pr-8">
                    {menu.name}
                  </h3>
                  {menu.description && (
                    <p className="text-white/40 text-sm mt-1 line-clamp-2">
                      {menu.description}
                    </p>
                  )}
                </div>

                {/* Price */}
                {menu.serviceTier?.pricePerGuest && (
                  <div className="mb-4 p-3 bg-white/3 rounded-xl border border-white/5">
                    <div className="text-[10px] uppercase tracking-widest text-white/30 mb-1">
                      {t("pricePerGuest")}
                    </div>
                    <div className="text-lg text-white font-medium">
                      {Number(menu.serviceTier.pricePerGuest).toLocaleString()}₮
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="space-y-2">
                  {menu.items?.slice(0, 5).map((item) => (
                    <div
                      key={item.menuItem.id}
                      className="flex items-center gap-2 text-white/50 text-sm"
                    >
                      <div className="w-1 h-1 rounded-full bg-primary shrink-0" />
                      <span className="truncate">{item.menuItem.name}</span>
                      <span className="ml-auto text-[10px] uppercase tracking-wider text-white/25 shrink-0">
                        {item.menuItem.category.replace("_", " ")}
                      </span>
                    </div>
                  ))}
                  {(menu.items?.length ?? 0) > 5 && (
                    <p className="text-[10px] uppercase tracking-widest text-primary/50 pt-1">
                      + {menu.items.length - 5} more
                    </p>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center mb-8">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <UtensilsCrossed className="w-7 h-7 text-white/20" />
          </div>
          <p className="text-white/40">{t("noMenus")}</p>
        </div>
      )}

      {/* Chef selector */}
      <div className="p-5 rounded-2xl border border-white/5 bg-white/2 mb-8">
        <div className="flex items-center gap-3 mb-3">
          <ChefHat className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-white">
            {tOrders("form.fields.chefOptional")}
          </span>
        </div>
        <Select
          value={chefProfileId || "none"}
          onValueChange={(v) => setChef(v === "none" ? "" : v)}
        >
          <SelectTrigger className="bg-white/5 border-white/10 h-11 rounded-xl text-white">
            <SelectValue placeholder={tOrders("form.placeholders.chef")} />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
            <SelectItem value="none">
              {tOrders("form.none.chef")}
            </SelectItem>
            {chefs.map((chef) => (
              <SelectItem key={chef.id} value={chef.id}>
                {chef.name} ({chef.specialty})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
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
          className="gap-2"
        >
          {tOrders("actions.continue")}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
