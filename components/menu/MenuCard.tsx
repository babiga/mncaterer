"use client";

import { motion } from "framer-motion";
import { Plus, ChevronRight, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useBookingStore } from "@/lib/store/use-booking-store";

interface MenuCardProps {
  menu: any;
}

export function MenuCard({ menu }: MenuCardProps) {
  const t = useTranslations("SignatureMenus");
  const router = useRouter();
  const toggleMenu = useBookingStore((s) => s.toggleMenu);
  const selectedMenus = useBookingStore((s) => s.selectedMenus);

  const handleBooking = () => {
    // If not already selected, add it
    if (!selectedMenus.some(m => m.menuId === menu.id)) {
      toggleMenu(menu.id);
    }
    router.push("/booking");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group relative h-full flex flex-col p-8 bg-white/3 backdrop-blur-xl border border-white/5 rounded-3xl hover:border-primary/30 transition-all duration-500"
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-medium mb-1 block">
            {menu.serviceTier?.name || t("standardTier")}
          </span>
          <h3 className="text-2xl font-serif text-white group-hover:text-primary transition-colors">
            {menu.name}
          </h3>
        </div>
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
          <UtensilsCrossed className="w-5 h-5 text-primary/60 group-hover:text-primary transition-colors" />
        </div>
      </div>

      <p className="text-white/40 text-sm font-light mb-8 line-clamp-2">
        {menu.description}
      </p>

      {menu.serviceTier?.pricePerGuest && (
        <div className="mb-8 p-4 bg-white/3 rounded-2xl border border-white/5">
          <div className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Price Per Guest</div>
          <div className="text-xl text-white font-medium">
            {Number(menu.serviceTier.pricePerGuest).toLocaleString()}₮
            <span className="text-sm font-light text-white/40 ml-1">/ {t("perGuest")}</span>
          </div>
        </div>
      )}

      <div className="space-y-3 mb-10 grow">
        {menu.items?.slice(0, 4).map((item: any, i: number) => (
          <div key={i} className="flex items-center gap-3 text-white/60 text-sm group-hover:text-white/80 transition-colors">
            <div className="w-1 h-1 bg-primary rounded-full group-hover:scale-125 transition-transform" />
            <span className="truncate">{item.name}</span>
          </div>
        ))}
        {menu.items?.length > 4 && (
          <div className="text-[10px] uppercase tracking-widest text-primary/60 pt-2">
            + {menu.items.length - 4} more exquisite items
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-6 border-t border-white/5">
        <Button 
          variant="outline" 
          onClick={handleBooking}
          className="grow border-white/10 hover:border-primary/50 text-white rounded-xl gap-2 h-12"
        >
          {t("addToBooking")} <Plus className="w-4 h-4" />
        </Button>
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={handleBooking}
          className="shrink-0 w-12 h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-primary hover:text-black transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </motion.div>
  );
}
