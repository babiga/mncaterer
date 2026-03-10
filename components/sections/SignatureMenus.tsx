"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useTranslations } from "next-intl";

const menuData = [
  { key: "menu1", price: "185,000₮+", tier: "luxuryTier" },
  { key: "menu2", price: "145,000₮+", tier: "premiumTier" },
  { key: "menu3", price: "95,000₮+", tier: "standardTier" },
];

type MenuType = {
  id: string;
  name: string;
  description: string | null;
  downloadUrl: string | null;
  items: string[];
};

export default function SignatureMenus({ menus }: { menus?: MenuType[] }) {
  const t = useTranslations("SignatureMenus");

  const menuCards =
    menus && menus.length > 0
      ? menus.map((menu) => ({
          id: menu.id,
          tier: t("standardTier"),
          title: menu.name,
          price: "",
          items: menu.items,
          downloadUrl: menu.downloadUrl,
        }))
      : menuData.map((menu) => ({
          id: menu.key,
          tier: t(menu.tier),
          title: t(`${menu.key}.title`),
          price: menu.price,
          items: t.raw(`${menu.key}.items`) as string[],
          downloadUrl: null,
        }));

  return (
    <section id="menus" className="py-24 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-4">
          <div className="text-center md:text-left">
            <h2 className="text-4xl md:text-5xl mb-2 text-white">
              {t("title")}
            </h2>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>
          <Button className="bg-primary text-black hover:bg-white px-8 py-6 rounded-none text-lg">
            {t("downloadMenu")}
          </Button>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {menuCards.map((menu, index) => (
              <CarouselItem
                key={menu.id}
                className="pl-4 md:basis-1/2 lg:basis-1/3"
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-8 bg-card border border-white/5 relative group hover:border-primary/30 transition-colors h-full flex flex-col"
                >
                  <span className="text-xs uppercase tracking-[0.2em] text-primary mb-4 block">
                    {menu.tier}
                  </span>
                  <h3 className="text-2xl text-white mb-2">{menu.title}</h3>
                  {menu.price ? (
                    <p className="text-xl text-foreground/80 mb-8 font-light">
                      {menu.price}{" "}
                      <span className="text-sm">{t("perGuest")}</span>
                    </p>
                  ) : null}

                  <ul className="space-y-4 mb-10">
                    {menu.items.map((item) => (
                      <li
                        key={item}
                        className="text-sm text-muted-foreground flex items-center gap-3"
                      >
                        <div className="w-1 h-1 bg-primary rounded-full" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <Button className="w-full border border-white/10 hover:border-primary hover:text-black group transition-all duration-300 mt-auto">
                    {t("addToBooking")} <Plus className="ml-2 w-4 h-4" />
                  </Button>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center gap-4 mt-10">
            <CarouselPrevious className="static translate-y-0 hover:bg-primary hover:text-black border-white/10" />
            <CarouselNext className="static translate-y-0 hover:bg-primary hover:text-black border-white/10" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
