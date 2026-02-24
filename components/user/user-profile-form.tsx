"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {statusMessage && (
              <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
                {statusMessage}
              </div>
            )}
            {errorMessage && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.name")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("placeholders.name")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>{t("fields.email")}</FormLabel>
                <FormControl>
                  <Input value={initialData.email} disabled />
                </FormControl>
              </FormItem>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.firstName")}</FormLabel>
                    <FormControl>
                      <Input
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
                    <FormLabel>{t("fields.lastName")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("placeholders.lastName")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.phone")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("placeholders.phone")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>{t("fields.userType")}</FormLabel>
                <FormControl>
                  <Input
                    value={t(`userType.${initialData.userType}`)}
                    disabled
                  />
                </FormControl>
              </FormItem>
            </div>

            {initialData.userType === "CORPORATE" && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormItem>
                  <FormLabel>{t("fields.organizationName")}</FormLabel>
                  <FormControl>
                    <Input value={initialData.organizationName || "-"} disabled />
                  </FormControl>
                </FormItem>
                <FormItem>
                  <FormLabel>{t("fields.companyLegalNo")}</FormLabel>
                  <FormControl>
                    <Input value={initialData.companyLegalNo || "-"} disabled />
                  </FormControl>
                </FormItem>
              </div>
            )}

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.address")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("placeholders.address")}
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSaving}>
              {isSaving ? t("actions.saving") : t("actions.save")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
