"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import {
  getIndividualSignupSchema,
  getCompanySignupSchema,
  getChefSignupSchema,
  type IndividualSignupFormData,
  type CompanySignupFormData,
  type ChefSignupFormData,
} from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

type UserType = "individual" | "company" | "chef";

export function SignupForm() {
  const t = useTranslations("Auth.signup");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<UserType>("individual");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const vt = useTranslations("Auth.validation");
  // Individual form
  const individualForm = useForm<IndividualSignupFormData>({
    resolver: zodResolver(getIndividualSignupSchema(vt)),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  // Company form
  const companyForm = useForm<CompanySignupFormData>({
    resolver: zodResolver(getCompanySignupSchema(vt)),
    defaultValues: {
      companyName: "",
      companyLegalNo: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  // Chef form
  const chefForm = useForm<ChefSignupFormData>({
    resolver: zodResolver(getChefSignupSchema(vt)),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value as UserType);
    setError(null);
    setSuccess(null);
  };

  async function onIndividualSubmit(data: IndividualSignupFormData) {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userType: "INDIVIDUAL",
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const code = result.error as string | undefined;
        const mappedError =
          code === "EMAIL_EXISTS"
            ? t("errors.emailExists")
            : code === "INVALID_INPUT"
              ? t("errors.invalidInput")
              : t("errors.serverError");
        setError(mappedError);
        return;
      }

      setSuccess(t("success"));
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch {
      setError(t("errors.serverError"));
    } finally {
      setIsLoading(false);
    }
  }

  async function onCompanySubmit(data: CompanySignupFormData) {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userType: "CORPORATE",
          companyName: data.companyName,
          companyLegalNo: data.companyLegalNo,
          email: data.email,
          phone: data.phone,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const code = result.error as string | undefined;
        const mappedError =
          code === "EMAIL_EXISTS"
            ? t("errors.emailExists")
            : code === "INVALID_INPUT"
              ? t("errors.invalidInput")
              : t("errors.serverError");
        setError(mappedError);
        return;
      }

      setSuccess(t("success"));
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch {
      setError(t("errors.serverError"));
    } finally {
      setIsLoading(false);
    }
  }

  async function onChefSubmit(data: ChefSignupFormData) {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userType: "CHEF",
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const code = result.error as string | undefined;
        const mappedError =
          code === "EMAIL_EXISTS"
            ? t("errors.emailExists")
            : code === "INVALID_INPUT"
              ? t("errors.invalidInput")
              : t("errors.serverError");
        setError(mappedError);
        return;
      }

      setSuccess(t("success"));
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch {
      setError(t("errors.serverError"));
    } finally {
      setIsLoading(false);
    }
  }

  const inputClassName =
    "h-12 bg-background/50 border-white/10 focus:border-primary focus-visible:ring-primary/50 transition-all rounded-none";
  const labelClassName = "text-sm font-medium text-foreground/70 tracking-wide";

  if (success) {
    return (
      <AuthCard className="max-w-none">
        <div className="py-20 px-2">
          <div className="mx-auto max-w-lg rounded-md border border-green-500/25 bg-green-500/10 p-6 text-green-700 dark:text-green-300">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="text-base font-semibold">{t("successTitle")}</p>
                <p className="mt-1 text-sm">{success}</p>
                <p className="mt-2 text-sm">{t("successRedirect")}</p>
              </div>
            </div>
          </div>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard className="max-w-none">
      <div className="mb-10 text-left">
        <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-lg max-w-lg">
          {t("subtitle")}
        </p>
      </div>

      <div className="mt-8">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="individual">{t("tabs.individual")}</TabsTrigger>
            <TabsTrigger value="company">{t("tabs.company")}</TabsTrigger>
            <TabsTrigger value="chef">{t("tabs.chef")}</TabsTrigger>
          </TabsList>

          {error && (
            <div className="mb-4 flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Individual Tab */}
          <TabsContent value="individual">
            <Form {...individualForm}>
              <form
                onSubmit={individualForm.handleSubmit(onIndividualSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={individualForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className={labelClassName}>
                          {t("firstName")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder={t("firstNamePlaceholder")}
                            className={inputClassName}
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={individualForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className={labelClassName}>
                          {t("lastName")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder={t("lastNamePlaceholder")}
                            className={inputClassName}
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={individualForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className={labelClassName}>
                          {t("email")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder={t("emailPlaceholder")}
                            className={inputClassName}
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={individualForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className={labelClassName}>
                          {t("phone")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder={t("phonePlaceholder")}
                            className={inputClassName}
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={individualForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className={labelClassName}>
                          {t("password")}
                        </FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder={t("passwordPlaceholder")}
                            className={inputClassName}
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={individualForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className={labelClassName}>
                          {t("confirmPassword")}
                        </FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder={t("confirmPasswordPlaceholder")}
                            className={inputClassName}
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={individualForm.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm text-muted-foreground font-normal cursor-pointer">
                          {t("acceptTerms")}{" "}
                          <Link
                            href="/terms"
                            className="text-primary hover:text-primary/80 transition-colors"
                          >
                            {t("termsOfService")}
                          </Link>{" "}
                          {t("and")}{" "}
                          <Link
                            href="/privacy"
                            className="text-primary hover:text-primary/80 transition-colors"
                          >
                            {t("privacyPolicy")}
                          </Link>{" "}
                          {t("agreementSuffix")}
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-primary text-black hover:bg-primary/90 rounded-none font-bold text-base transition-all duration-300 btn-glow mt-6"
                >
                  {isLoading ? t("submitting") : t("submit")}
                </Button>
              </form>
            </Form>
          </TabsContent>

          {/* Company Tab */}
          <TabsContent value="company">
            <Form {...companyForm}>
              <form
                onSubmit={companyForm.handleSubmit(onCompanySubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={companyForm.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className={labelClassName}>
                          {t("companyName")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder={t("companyNamePlaceholder")}
                            className={inputClassName}
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={companyForm.control}
                    name="companyLegalNo"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className={labelClassName}>
                          {t("companyLegalNo")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder={t("companyLegalNoPlaceholder")}
                            className={inputClassName}
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={companyForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className={labelClassName}>
                          {t("email")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder={t("emailPlaceholder")}
                            className={inputClassName}
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={companyForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className={labelClassName}>
                          {t("phone")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder={t("phonePlaceholder")}
                            className={inputClassName}
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={companyForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className={labelClassName}>
                          {t("password")}
                        </FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder={t("passwordPlaceholder")}
                            className={inputClassName}
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={companyForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className={labelClassName}>
                          {t("confirmPassword")}
                        </FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder={t("confirmPasswordPlaceholder")}
                            className={inputClassName}
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={companyForm.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm text-muted-foreground font-normal cursor-pointer">
                          {t("acceptTerms")}{" "}
                          <Link
                            href="/terms"
                            className="text-primary hover:text-primary/80 transition-colors"
                          >
                            {t("termsOfService")}
                          </Link>{" "}
                          {t("and")}{" "}
                          <Link
                            href="/privacy"
                            className="text-primary hover:text-primary/80 transition-colors"
                          >
                            {t("privacyPolicy")}
                          </Link>{" "}
                          {t("agreementSuffix")}
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-primary text-black hover:bg-primary/90 rounded-none font-medium text-base transition-all duration-300 btn-glow mt-6"
                >
                  {isLoading ? t("submitting") : t("submit")}
                </Button>
              </form>
            </Form>
          </TabsContent>

          {/* Chef Tab */}
          <TabsContent value="chef">
            <Form {...chefForm}>
              <form
                onSubmit={chefForm.handleSubmit(onChefSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={chefForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className={labelClassName}>
                          {t("firstName")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder={t("firstNamePlaceholder")}
                            className={inputClassName}
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={chefForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className={labelClassName}>
                          {t("lastName")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder={t("lastNamePlaceholder")}
                            className={inputClassName}
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={chefForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className={labelClassName}>
                          {t("email")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder={t("emailPlaceholder")}
                            className={inputClassName}
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={chefForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className={labelClassName}>
                          {t("phone")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder={t("phonePlaceholder")}
                            className={inputClassName}
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={chefForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className={labelClassName}>
                          {t("password")}
                        </FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder={t("passwordPlaceholder")}
                            className={inputClassName}
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={chefForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className={labelClassName}>
                          {t("confirmPassword")}
                        </FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder={t("confirmPasswordPlaceholder")}
                            className={inputClassName}
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={chefForm.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm text-muted-foreground font-normal cursor-pointer">
                          {t("acceptTerms")}{" "}
                          <Link
                            href="/terms"
                            className="text-primary hover:text-primary/80 transition-colors"
                          >
                            {t("termsOfService")}
                          </Link>{" "}
                          {t("and")}{" "}
                          <Link
                            href="/privacy"
                            className="text-primary hover:text-primary/80 transition-colors"
                          >
                            {t("privacyPolicy")}
                          </Link>{" "}
                          {t("agreementSuffix")}
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-primary text-black hover:bg-primary/90 rounded-none font-medium text-base transition-all duration-300 btn-glow mt-6"
                >
                  {isLoading ? t("submitting") : t("submit")}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </div>

      <div className="mt-10 pt-6 border-t border-white/5 text-center">
        <span className="text-muted-foreground">{t("hasAccount")} </span>
        <Link
          href="/login"
          className="text-primary hover:text-primary/80 transition-colors font-medium ml-1"
        >
          {t("signIn")}
        </Link>
      </div>
    </AuthCard>
  );
}
