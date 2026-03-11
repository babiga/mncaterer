import { Metadata } from "next";
import { AlertTriangleIcon } from "lucide-react";

import { BankTransferSettingsForm } from "@/components/settings/bank-transfer-settings-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { BankTransferSettingsInput } from "@/lib/validations/settings";

export const metadata: Metadata = {
  title: "Settings | Mongolian National Caterer",
  description: "Manage dashboard settings and payment configuration.",
};

export default async function SettingsPage() {
  const user = await getCurrentUserWithProfile();

  if (!user) {
    return null;
  }

  if (user.role !== "ADMIN") {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangleIcon className="h-5 w-5 text-amber-500" />
              Access Restricted
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Only administrators can manage global payment settings.
          </CardContent>
        </Card>
      </div>
    );
  }

  const settings = await prisma.bankTransferSetting.findUnique({
    where: { key: "default" },
  });

  const initialData: BankTransferSettingsInput = {
    bankName: settings?.bankName ?? "",
    accountNumber: settings?.accountNumber ?? "",
    accountHolderName: settings?.accountHolderName ?? "",
    iban: settings?.iban ?? "",
    paymentInstructions: settings?.paymentInstructions ?? "",
    isActive: settings?.isActive ?? true,
  };

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage bank transfer details for customer payments.
        </p>
      </div>

      <BankTransferSettingsForm initialData={initialData} />
    </div>
  );
}
