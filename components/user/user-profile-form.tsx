"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getUpdateProfileSchema,
  type UpdateProfileData,
} from "@/lib/validations/profile";

type UserProfileFormProps = {
  initialData: {
    email: string;
    userType: "INDIVIDUAL" | "CORPORATE";
    organizationName: string | null;
    companyLegalNo: string | null;
    name: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    address: string | null;
  };
};

export function UserProfileForm({ initialData }: UserProfileFormProps) {
  const t = useTranslations("UserProfile");
  const vt = useTranslations("UserProfile.validation");
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<UpdateProfileData>({
    resolver: zodResolver(getUpdateProfileSchema(vt)),
    defaultValues: {
      name: initialData.name,
      firstName: initialData.firstName || "",
      lastName: initialData.lastName || "",
      phone: initialData.phone || "",
      address: initialData.address || "",
    },
  });

  async function onSubmit(values: UpdateProfileData) {
    setIsSaving(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const payload = {
        name: values.name.trim(),
        firstName: values.firstName?.trim() || null,
        lastName: values.lastName?.trim() || null,
        phone: values.phone?.trim() || null,
        address: values.address?.trim() || null,
      };

      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || t("messages.updateError"));
        return;
      }

      setStatusMessage(t("messages.updateSuccess"));
    } catch {
      setErrorMessage(t("messages.updateError"));
    } finally {
      setIsSaving(false);
    }
  }

  const labelClasses = "text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/70 mb-2 block";

  return (
    <Card className="rounded-2xl border bg-card shadow-sm max-w-4xl">
      <CardHeader>
        <CardTitle className="text-xl font-serif">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {statusMessage && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 animate-in fade-in slide-in-from-top-2">
                {statusMessage}
              </div>
            )}
            {errorMessage && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-in fade-in slide-in-from-top-2">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClasses}>{t("fields.name")}</FormLabel>
                    <FormControl>
                      <Input className="h-10 rounded-xl" placeholder={t("placeholders.name")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <Label className={labelClasses} htmlFor="email">{t("fields.email")}</Label>
                <Input className="h-10 rounded-xl bg-muted/30" id="email" value={initialData.email} disabled readOnly />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClasses}>{t("fields.firstName")}</FormLabel>
                    <FormControl>
                      <Input
                        className="h-10 rounded-xl"
                        placeholder={t("placeholders.firstName")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClasses}>{t("fields.lastName")}</FormLabel>
                    <FormControl>
                      <Input
                        className="h-10 rounded-xl"
                        placeholder={t("placeholders.lastName")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClasses}>{t("fields.phone")}</FormLabel>
                    <FormControl>
                      <Input className="h-10 rounded-xl" placeholder={t("placeholders.phone")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <Label className={labelClasses} htmlFor="user-type">{t("fields.userType")}</Label>
                <Input
                  className="h-10 rounded-xl bg-muted/30 capitalize"
                  id="user-type"
                  value={t(`userType.${initialData.userType}`)}
                  disabled
                  readOnly
                />
              </div>
            </div>

            {initialData.userType === "CORPORATE" && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className={labelClasses} htmlFor="organization-name">
                    {t("fields.organizationName")}
                  </Label>
                  <Input
                    className="h-10 rounded-xl bg-muted/30"
                    id="organization-name"
                    value={initialData.organizationName || "-"}
                    disabled
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label className={labelClasses} htmlFor="company-legal-no">
                    {t("fields.companyLegalNo")}
                  </Label>
                  <Input
                    className="h-10 rounded-xl bg-muted/30"
                    id="company-legal-no"
                    value={initialData.companyLegalNo || "-"}
                    disabled
                    readOnly
                  />
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClasses}>{t("fields.address")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("placeholders.address")}
                      className="rounded-xl min-h-[120px] resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSaving} size="lg" className="rounded-xl px-8 min-w-[160px] shadow-lg shadow-primary/20">
                {isSaving ? t("actions.saving") : t("actions.save")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
