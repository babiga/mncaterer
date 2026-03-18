"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { User, Phone, Mail, MessageSquare, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useBookingStore } from "@/lib/store/use-booking-store";

export function ContactStep() {
  const t = useTranslations("Booking.steps.contact");
  const tOrders = useTranslations("UserOrders");
  const contactInfo = useBookingStore((s) => s.contactInfo);
  const setContactInfo = useBookingStore((s) => s.setContactInfo);
  const nextStep = useBookingStore((s) => s.nextStep);
  const prevStep = useBookingStore((s) => s.prevStep);

  const canProceed =
    contactInfo.contactName.trim().length >= 2 &&
    /^[+]?[0-9]{8,15}$/.test(contactInfo.contactPhone.trim()) &&
    contactInfo.contactEmail.includes("@");

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-serif text-white mb-2">
          {t("heading")}
        </h2>
        <p className="text-white/50">{t("description")}</p>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Name */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl border border-white/5 bg-white/2"
          >
            <div className="flex items-center gap-3 mb-3">
              <User className="w-5 h-5 text-primary" />
              <label className="text-sm font-medium text-white">
                {tOrders("form.fields.contactName")}
              </label>
            </div>
            <Input
              value={contactInfo.contactName}
              onChange={(e) =>
                setContactInfo({ contactName: e.target.value })
              }
              className="bg-white/5 border-white/10 h-12 rounded-xl text-white"
            />
          </motion.div>

          {/* Phone */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="p-5 rounded-2xl border border-white/5 bg-white/2"
          >
            <div className="flex items-center gap-3 mb-3">
              <Phone className="w-5 h-5 text-primary" />
              <label className="text-sm font-medium text-white">
                {tOrders("form.fields.contactPhone")}
              </label>
            </div>
            <Input
              value={contactInfo.contactPhone}
              onChange={(e) =>
                setContactInfo({ contactPhone: e.target.value })
              }
              placeholder="+976XXXXXXXX"
              className="bg-white/5 border-white/10 h-12 rounded-xl text-white"
            />
          </motion.div>

          {/* Email */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-5 rounded-2xl border border-white/5 bg-white/2"
          >
            <div className="flex items-center gap-3 mb-3">
              <Mail className="w-5 h-5 text-primary" />
              <label className="text-sm font-medium text-white">
                {tOrders("form.fields.contactEmail")}
              </label>
            </div>
            <Input
              type="email"
              value={contactInfo.contactEmail}
              onChange={(e) =>
                setContactInfo({ contactEmail: e.target.value })
              }
              className="bg-white/5 border-white/10 h-12 rounded-xl text-white"
            />
          </motion.div>
        </div>

        {/* Special Requests */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-5 rounded-2xl border border-white/5 bg-white/2"
        >
          <div className="flex items-center gap-3 mb-3">
            <MessageSquare className="w-5 h-5 text-white/30" />
            <label className="text-sm font-medium text-white">
              {tOrders("form.fields.specialRequestsOptional")}
            </label>
          </div>
          <Textarea
            rows={4}
            value={contactInfo.specialRequests}
            onChange={(e) =>
              setContactInfo({ specialRequests: e.target.value })
            }
            placeholder={tOrders("form.placeholders.specialRequests")}
            className="bg-white/5 border-white/10 rounded-xl text-white resize-none"
          />
        </motion.div>
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
