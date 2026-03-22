"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { useBookingStore } from "@/lib/store/use-booking-store";
import { BookingProgressBar } from "./BookingProgressBar";
import { BookingBasket } from "./BookingBasket";
import { ServiceTypeStep } from "./steps/ServiceTypeStep";
import { MenuSelectionStep } from "./steps/MenuSelectionStep";
import { EventDetailsStep } from "./steps/EventDetailsStep";
import { ContactStep } from "./steps/ContactStep";
import { ReviewStep } from "./steps/ReviewStep";

export type ServiceTierOption = {
  id: string;
  name: string;
  pricePerGuest: number;
  isVIP: boolean;
  sortOrder: number;
};

export type MenuItemInfo = {
  id: string;
  name: string;
  description: string | null;
  price: string | number;
  category: string;
  imageUrl: string | null;
};

export type MenuOption = {
  id: string;
  name: string;
  description: string | null;
  serviceTierId: string | null;
  serviceTier: {
    id: string;
    name: string;
    isVIP: boolean;
    pricePerGuest: string | number;
  } | null;
  items: {
    menuItem: MenuItemInfo;
    sortOrder: number;
  }[];
};

export type ChefOption = {
  id: string;
  name: string;
  specialty: string;
  rating: number;
};

export type InitialCustomer = {
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
};

export type MenuItemOption = MenuItemInfo;

type BookingFlowProps = {
  serviceTiers: ServiceTierOption[];
  menus: MenuOption[];
  chefs: ChefOption[];
  menuItems: MenuItemOption[];
  initialCustomer: InitialCustomer;
};

const STEP_KEYS = [
  "serviceType",
  "menuSelection",
  "eventDetails",
  "contact",
  "review",
] as const;

export function BookingFlow({
  serviceTiers,
  menus,
  chefs,
  menuItems,
  initialCustomer,
}: BookingFlowProps) {
  const t = useTranslations("Booking");
  const currentStep = useBookingStore((s) => s.currentStep);
  const contactInfo = useBookingStore((s) => s.contactInfo);
  const setContactInfo = useBookingStore((s) => s.setContactInfo);
  const titleRef = useRef<HTMLDivElement>(null);

  // Pre-fill contact info from user profile on first mount
  useEffect(() => {
    if (!contactInfo.contactName && initialCustomer.name) {
      setContactInfo({
        contactName: initialCustomer.name,
        contactEmail: initialCustomer.email,
        contactPhone: initialCustomer.phone ?? "",
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Scroll to title whenever currentStep changes
    titleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentStep]);

  const stepComponents = [
    <ServiceTypeStep key="service" />,
    <MenuSelectionStep
      key="menu"
      serviceTiers={serviceTiers}
      menus={menus}
      chefs={chefs}
      menuItems={menuItems}
    />,
    <EventDetailsStep
      key="event"
      serviceTiers={serviceTiers}
      menus={menus}
      menuItems={menuItems}
    />,
    <ContactStep key="contact" />,
    <ReviewStep
      key="review"
      serviceTiers={serviceTiers}
      menus={menus}
      chefs={chefs}
      menuItems={menuItems}
    />,
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6">
      {/* Header */}
      <motion.div
        ref={titleRef}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10 scroll-mt-32"
      >
        <h1 className="text-3xl md:text-5xl font-serif text-white mb-3">
          {t("title")}
        </h1>
        <p className="text-white/50 text-base md:text-lg max-w-xl mx-auto">
          {t("subtitle")}
        </p>
      </motion.div>

      {/* Progress */}
      <BookingProgressBar
        currentStep={currentStep}
        stepKeys={STEP_KEYS as unknown as string[]}
      />

      {/* Content */}
      <div className="mt-10 flex flex-col lg:flex-row gap-8">
        {/* Step area */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              {stepComponents[currentStep]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Basket sidebar */}
        <div className="lg:w-80 shrink-0">
          <BookingBasket
            serviceTiers={serviceTiers}
            menus={menus}
            chefs={chefs}
            menuItems={menuItems}
          />
        </div>
      </div>
    </div>
  );
}
