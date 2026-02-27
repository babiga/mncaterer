"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type InquiryFormData = {
  type: "INDIVIDUAL" | "ORG";
  name: string;
  phone: string;
  email: string;
  serviceType: "CORPORATE" | "PRIVATE" | "WEDDING" | "VIP" | "OTHER";
  message: string;
};

const initialForm: InquiryFormData = {
  type: "INDIVIDUAL",
  name: "",
  phone: "",
  email: "",
  serviceType: "CORPORATE",
  message: "",
};

export default function InquiryPage() {
  const t = useTranslations("InquiryPage");
  const [formData, setFormData] = useState<InquiryFormData>(initialForm);
  const [hasAutofill, setHasAutofill] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const meResponse = await fetch("/api/auth/me", { cache: "no-store" });
        if (!meResponse.ok) return;

        const meResult = await meResponse.json();
        if (!meResult.success || !meResult.data) return;

        const me = meResult.data as {
          name?: string;
          email?: string;
          userType?: "customer" | "dashboard";
        };

        if (!isMounted) return;

        setFormData((prev) => ({
          ...prev,
          name: prev.name || me.name || "",
          email: prev.email || me.email || "",
        }));
        setHasAutofill(true);

        if (me.userType !== "customer") return;

        const profileResponse = await fetch("/api/profile", { cache: "no-store" });
        if (!profileResponse.ok) return;

        const profileResult = await profileResponse.json();
        if (!profileResult.success || !profileResult.data || !isMounted) return;

        const profile = profileResult.data as {
          phone?: string | null;
          userType?: "INDIVIDUAL" | "CORPORATE";
        };

        setFormData((prev) => ({
          ...prev,
          type: profile.userType === "CORPORATE" ? "ORG" : prev.type,
          phone: prev.phone || profile.phone || "",
        }));
      } catch {
        // Ignore profile autofill errors and keep manual input flow.
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!result.success) {
        toast.error(result.error || t("messages.submitError"));
        return;
      }

      toast.success(t("messages.submitSuccess"));
      if (hasAutofill) {
        setFormData((prev) => ({ ...prev, message: "" }));
      } else {
        setFormData(initialForm);
      }
    } catch {
      toast.error(t("messages.submitError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar trimmed />
      <main className="container mx-auto px-6 pb-20 pt-28">
        <div className="mx-auto max-w-3xl space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t("eyebrow")}</p>
            <h1 className="mt-2 text-4xl font-semibold">{t("title")}</h1>
            <p className="mt-3 text-muted-foreground">
              {t("description")}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("cardTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={onSubmit}>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="inquiry-type">{t("fields.type.label")}</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: "INDIVIDUAL" | "ORG") =>
                        setFormData((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger id="inquiry-type">
                        <SelectValue placeholder={t("fields.type.placeholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INDIVIDUAL">{t("fields.type.options.INDIVIDUAL")}</SelectItem>
                        <SelectItem value="ORG">{t("fields.type.options.ORG")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service-type">{t("fields.serviceType.label")}</Label>
                    <Select
                      value={formData.serviceType}
                      onValueChange={(
                        value: "CORPORATE" | "PRIVATE" | "WEDDING" | "VIP" | "OTHER",
                      ) => setFormData((prev) => ({ ...prev, serviceType: value }))}
                    >
                      <SelectTrigger id="service-type">
                        <SelectValue placeholder={t("fields.serviceType.placeholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CORPORATE">{t("fields.serviceType.options.CORPORATE")}</SelectItem>
                        <SelectItem value="PRIVATE">{t("fields.serviceType.options.PRIVATE")}</SelectItem>
                        <SelectItem value="WEDDING">{t("fields.serviceType.options.WEDDING")}</SelectItem>
                        <SelectItem value="VIP">{t("fields.serviceType.options.VIP")}</SelectItem>
                        <SelectItem value="OTHER">{t("fields.serviceType.options.OTHER")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">{t("fields.name.label")}</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("fields.phone.label")}</Label>
                    <Input
                      id="phone"
                      required
                      value={formData.phone}
                      onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="email">{t("fields.email.label")}</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">{t("fields.message.label")}</Label>
                  <Textarea
                    id="message"
                    rows={5}
                    placeholder={t("fields.message.placeholder")}
                    value={formData.message}
                    onChange={(event) => setFormData((prev) => ({ ...prev, message: event.target.value }))}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? t("actions.submitting") : t("actions.submit")}
                  </Button>
                  <Button asChild type="button" variant="outline">
                    <Link href="/">{t("actions.backHome")}</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
