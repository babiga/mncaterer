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
  MenuItemOption,
} from "../BookingFlow";

interface MenuSelectionStepProps {
  serviceTiers: ServiceTierOption[];
  menus: MenuOption[];
  chefs: ChefOption[];
  menuItems: MenuItemOption[];
}

export function MenuSelectionStep({
  serviceTiers,
  menus,
  chefs,
  menuItems,
}: MenuSelectionStepProps) {
  const t = useTranslations("Booking.steps.menuSelection");
  const tCommon = useTranslations("Booking.steps.common");
  const tOrders = useTranslations("UserOrders");
  const serviceType = useBookingStore((s) => s.serviceType);
  const selectedMenus = useBookingStore((s) => s.selectedMenus);
  const chefProfileId = useBookingStore((s) => s.chefProfileId);
  const isCustomMenu = useBookingStore((s) => s.isCustomMenu);
  const customMenuItems = useBookingStore((s) => s.customMenuItems);
  const toggleMenu = useBookingStore((s) => s.toggleMenu);
  const updateMenuGuestCount = useBookingStore((s) => s.updateMenuGuestCount);
  const setChef = useBookingStore((s) => s.setChef);
  const setCustomMenuMode = useBookingStore((s) => s.setCustomMenuMode);
  const toggleCustomMenuItem = useBookingStore((s) => s.toggleCustomMenuItem);
  const updateCustomMenuItemQuantity = useBookingStore((s) => s.updateCustomMenuItemQuantity);
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

  // Group menu items by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, MenuItemOption[]> = {};
    menuItems.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [menuItems]);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-serif text-white mb-2">
          {isCustomMenu ? t("headingCustom") : t("heading")}
        </h2>
        <p className="text-white/50">{t("description")}</p>
      </div>

      {/* Menu cards */}
      {serviceType !== "OTHER" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {filteredMenus.map((menu, i) => {
            const menuState = selectedMenus.find((m) => m.menuId === menu.id);
            const isSelected = !!menuState && !isCustomMenu;
            return (
              <motion.div
                key={menu.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (i + 1) * 0.05 }}
                onClick={() => {
                  if (isCustomMenu) setCustomMenuMode(false);
                  toggleMenu(menu.id);
                }}
                className={`group relative p-6 rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer ${isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-white/5 bg-white/2 hover:border-white/15"
                  }`}
              >
                {/* Selected checkmark */}
                <div
                  className={`absolute top-4 right-4 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                      ? "border-primary bg-primary"
                      : "border-white/20 bg-transparent"
                    }`}
                >
                  {isSelected && <Check className="w-4 h-4 text-black" />}
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

                {/* Price & Guest Count */}
                {menu.serviceTier?.pricePerGuest && (
                  <div className="mb-4 grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white/3 rounded-xl border border-white/5">
                      <div className="text-[10px] uppercase tracking-widest text-white/30 mb-1">
                        {t("pricePerGuest")}
                      </div>
                      <div className="text-lg text-white font-medium">
                        {Number(menu.serviceTier.pricePerGuest).toLocaleString()}₮
                      </div>
                    </div>
                    {isSelected && (
                      <div
                        className="p-3 bg-white/5 rounded-xl border border-primary/30"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="text-[10px] uppercase tracking-widest text-primary mb-1">
                          {tOrders("form.fields.guestCount")}
                        </div>
                        <input
                          type="number"
                          min="1"
                          value={menuState.guestCount}
                          onChange={(e) =>
                            updateMenuGuestCount(menu.id, parseInt(e.target.value) || 0)
                          }
                          className="bg-transparent border-none text-white w-full text-lg font-medium focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    )}
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
                      + {menu.items.length - 5} {tCommon("more")}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* Custom Menu Option */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (filteredMenus.length + 1) * 0.05 }}
            onClick={() => setCustomMenuMode(!isCustomMenu)}
            className={`group relative p-6 rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer ${isCustomMenu
                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                : "border-white/5 bg-white/2 hover:border-white/15"
              }`}
          >
            <div
              className={`absolute top-4 right-4 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${isCustomMenu
                  ? "border-primary bg-primary"
                  : "border-white/20 bg-transparent"
                }`}
            >
              {isCustomMenu && <Check className="w-4 h-4 text-black" />}
            </div>
            <div className="mb-4">
              <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-medium mb-1 block">
                {t("customOptionTag")}
              </span>
              <h3 className="text-lg font-medium text-white pr-8">{t("customOption")}</h3>
              <p className="text-white/40 text-sm mt-1">
                {t("customOptionDesc")}
              </p>
            </div>
            <div className="flex items-center gap-2 text-white/50 text-sm italic">
              <UtensilsCrossed className="w-4 h-4" />
              <span>{t("customOptionFooter")}</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Custom Menu Item Selection */}
      {isCustomMenu && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-8 space-y-6"
        >
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-sm font-medium text-white/60 mb-3 uppercase tracking-widest flex items-center gap-2">
                <span className="w-8 h-px bg-white/10" />
                {category.replace("_", " ")}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((item) => {
                  const customItem = customMenuItems.find(
                    (m) => m.menuItemId === item.id,
                  );
                  const isItemSelected = !!customItem;
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleCustomMenuItem(item.id)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${isItemSelected
                          ? "border-primary bg-primary/5"
                          : "border-white/5 bg-white/2 hover:border-white/10"
                        }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="text-white font-medium text-sm truncate">
                            {item.name}
                          </p>
                          <p className="text-primary text-xs font-medium">
                            {Number(item.price).toLocaleString()}₮
                          </p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isItemSelected
                              ? "border-primary bg-primary"
                              : "border-white/20"
                            }`}
                        >
                          {isItemSelected && (
                            <Check className="w-3 h-3 text-black" />
                          )}
                        </div>
                      </div>
                      {isItemSelected && (
                        <div
                          className="mt-3 flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-[10px] text-white/40 uppercase tracking-tighter">
                            {tCommon("qty")}:
                          </span>
                          <input
                            type="number"
                            min="1"
                            value={customItem.quantity}
                            onChange={(e) =>
                              updateCustomMenuItemQuantity(
                                item.id,
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="bg-white/10 border-none rounded-md text-white text-xs w-16 p-1 focus:ring-1 focus:ring-primary h-7"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </motion.div>
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
