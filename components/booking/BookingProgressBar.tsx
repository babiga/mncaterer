"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Check,
  Utensils,
  CalendarDays,
  User,
  FileCheck,
} from "lucide-react";
import { useBookingStore } from "@/lib/store/use-booking-store";
import { cn } from "@/lib/utils";

const STEP_ICONS = [Utensils, Utensils, CalendarDays, User, FileCheck];

export function BookingProgressBar({
  currentStep,
  stepKeys,
}: {
  currentStep: number;
  stepKeys: string[];
}) {
  const t = useTranslations("Booking.steps");
  const goToStep = useBookingStore((s) => s.goToStep);

  return (
    <div className="relative">
      {/* Connection line */}
      <div className="absolute top-6 left-0 right-0 h-px bg-white/10 hidden md:block" />
      <div className="absolute top-6 left-0 h-px bg-primary/60 hidden md:block transition-all duration-500"
        style={{ width: `${(currentStep / (stepKeys.length - 1)) * 100}%` }}
      />

      <div className="grid grid-cols-5 gap-2 md:gap-0">
        {stepKeys.map((key, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const Icon = STEP_ICONS[index];

          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                if (index <= currentStep) goToStep(index);
              }}
              className={cn(
                "relative z-10 flex flex-col items-center text-center group",
                index > currentStep && "pointer-events-none opacity-40",
              )}
            >
              <motion.div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 mb-2",
                  isCompleted
                    ? "border-emerald-400 bg-emerald-400/10"
                    : isCurrent
                      ? "border-primary bg-primary/10 scale-110"
                      : "border-white/15 bg-white/5",
                )}
                whileHover={index <= currentStep ? { scale: 1.1 } : {}}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-colors",
                      isCurrent ? "text-primary" : "text-white/40",
                    )}
                  />
                )}
              </motion.div>
              <p
                className={cn(
                  "text-xs font-medium hidden md:block",
                  isCurrent ? "text-white" : "text-white/50",
                )}
              >
                {t(`${key}.title`)}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
