"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { useRouter as useBaseRouter } from "next/navigation";

import { getLoginSchema, type LoginFormData } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AuthCard,
  AuthCardHeader,
  AuthCardTitle,
  AuthCardDescription,
  AuthCardContent,
  AuthCardFooter,
} from "@/components/auth/AuthCard";
import { PasswordInput } from "@/components/auth/PasswordInput";

export function LoginForm() {
  const t = useTranslations("Auth.login");
  const router = useRouter();
  const baseRouter = useBaseRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vt = useTranslations("Auth.validation");
  const form = useForm<LoginFormData>({
    resolver: zodResolver(getLoginSchema(vt)),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || t("errors.serverError"));
        return;
      }

      // Redirect based on user type
      if (result.userType === "dashboard") {
        baseRouter.push("/dashboard");
      } else {
        router.push("/profile");
      }
    } catch {
      setError(t("errors.serverError"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthCard>
      <div className="mb-10 text-left">
        <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-lg max-w-lg">
          {t("subtitle")}
        </p>
      </div>

      <div className="mt-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
                {error}
              </div>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium text-foreground/70 tracking-wide">
                    {t("email")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t("emailPlaceholder")}
                      className="h-12 bg-background/50 border-white/10 focus:border-primary focus-visible:ring-primary/50 transition-all rounded-none"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm font-medium text-foreground/70 tracking-wide">
                      {t("password")}
                    </FormLabel>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-primary hover:text-primary/80 transition-colors tracking-widest"
                    >
                      {t("forgotPassword")}
                    </Link>
                  </div>
                  <FormControl>
                    <PasswordInput
                      placeholder={t("passwordPlaceholder")}
                      className="h-12 bg-background/50 border-white/10 focus:border-primary focus-visible:ring-primary/50 transition-all rounded-none"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-primary text-black hover:bg-primary/90 rounded-none font-semibold text-base transition-all duration-300 btn-glow mt-2"
            >
              {isLoading ? t("submitting") : t("submit")}
            </Button>
          </form>
        </Form>
      </div>

      <div className="mt-10 pt-6 border-t border-white/5 text-center">
        <span className="text-muted-foreground">{t("noAccount")} </span>
        <Link
          href="/signup"
          className="text-primary hover:text-primary/80 transition-colors font-medium ml-1"
        >
          {t("signUp")}
        </Link>
      </div>
    </AuthCard>
  );
}
