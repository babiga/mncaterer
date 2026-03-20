"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Landmark, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BankTransferSettings {
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  iban?: string;
  paymentInstructions?: string;
  isActive: boolean;
}

interface PaymentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  bookingNumber: string;
  amount: number;
}

export function PaymentDialog({
  isOpen,
  onOpenChange,
  bookingNumber,
  amount,
}: PaymentDialogProps) {
  const t = useTranslations("UserOrders.bankTransfer");
  const [settings, setSettings] = useState<BankTransferSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  async function fetchSettings() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/settings/bank-transfer");
      const result = await response.json();
      if (result.success) {
        setSettings(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch bank transfer settings:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(t("copied"));
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-serif">
            <Landmark className="w-5 h-5 text-primary" />
            {t("title")}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            {t("instructions")}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : settings && settings.isActive ? (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/10">
                <span className="text-sm text-zinc-400">{t("amount")}</span>
                <span className="text-lg font-semibold">{amount.toLocaleString()}₮</span>
              </div>

              <div className="space-y-3">
                <div className="grid gap-1.5">
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    {t("bankName")}
                  </span>
                  <div className="flex items-center justify-between group">
                    <span className="text-sm font-medium">{settings.bankName}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-zinc-500 hover:text-white"
                      onClick={() => copyToClipboard(settings.bankName, "bankName")}
                    >
                      {copiedField === "bankName" ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid gap-1.5 border-t border-zinc-800 pt-3">
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    {t("accountNumber")}
                  </span>
                  <div className="flex items-center justify-between group">
                    <span className="text-sm font-medium font-mono">
                      {settings.accountNumber}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-zinc-500 hover:text-white"
                      onClick={() =>
                        copyToClipboard(settings.accountNumber, "accountNumber")
                      }
                    >
                      {copiedField === "accountNumber" ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid gap-1.5 border-t border-zinc-800 pt-3">
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    {t("accountHolder")}
                  </span>
                  <div className="flex items-center justify-between group">
                    <span className="text-sm font-medium">
                      {settings.accountHolderName}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-zinc-500 hover:text-white"
                      onClick={() =>
                        copyToClipboard(settings.accountHolderName, "accountHolder")
                      }
                    >
                      {copiedField === "accountHolder" ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid gap-1.5 border-t border-zinc-800 pt-3">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      {t("reference")}
                    </span>
                    <div className="flex items-center justify-between group">
                      <span className="text-sm font-medium text-primary">
                        {bookingNumber}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-500 hover:text-white"
                        onClick={() => copyToClipboard(bookingNumber, "reference")}
                      >
                        {copiedField === "reference" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                </div>
              </div>
            </div>

            {settings.paymentInstructions && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs text-zinc-400 leading-relaxed italic">
                  {settings.paymentInstructions}
                </p>
              </div>
            )}

            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white"
              onClick={() => onOpenChange(false)}
            >
              {t("close")}
            </Button>
          </div>
        ) : (
          <div className="py-8 text-center text-zinc-500">
            {t("unavailable")}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
