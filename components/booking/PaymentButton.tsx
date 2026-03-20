"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentDialog } from "./PaymentDialog";

interface PaymentButtonProps {
  bookingNumber: string;
  amount: number;
}

export function PaymentButton({ bookingNumber, amount }: PaymentButtonProps) {
  const t = useTranslations("UserOrders");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
      >
        <CreditCard className="w-4 h-4" />
        {t("payment")}
      </Button>

      <PaymentDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        bookingNumber={bookingNumber}
        amount={amount}
      />
    </>
  );
}
