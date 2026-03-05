"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Check, ChefHat, FileSignature, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  getCreateBookingSchema,
  type CreateBookingData,
} from "@/lib/validations/bookings";

type ServiceTierOption = {
  id: string;
  name: string;
  pricePerGuest: number;
  isVIP: boolean;
  sortOrder: number;
};

type MenuOption = {
  id: string;
  name: string;
  description: string | null;
  serviceTierId: string | null;
};

type ChefOption = {
  id: string;
  name: string;
  specialty: string;
  rating: number;
};

type UserBookingFormProps = {
  serviceTiers: ServiceTierOption[];
  menus: MenuOption[];
  chefs: ChefOption[];
  initialCustomer: {
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
  };
};

type BookingServiceType = "CORPORATE" | "PRIVATE" | "WEDDING" | "VIP" | "OTHER";

function formatPrice(amount: number) {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function UserBookingForm({
  serviceTiers,
  menus,
  chefs,
  initialCustomer,
}: UserBookingFormProps) {
  const t = useTranslations("UserOrders");
  const vt = useTranslations("UserOrders.validation");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<CreateBookingData>({
    resolver: zodResolver(getCreateBookingSchema((key) => vt(key))),
    defaultValues: {
      menuId: "",
      chefProfileId: "",
      serviceType: "CORPORATE",
      eventDate: "",
      eventTime: "18:00",
      guestCount: 20,
      venue: "",
      venueAddress: initialCustomer.address ?? "",
      specialRequests: "",
      contactName: initialCustomer.name,
      contactPhone: initialCustomer.phone ?? "",
      contactEmail: initialCustomer.email,
    },
  });

  function resolveServiceTier(serviceType: BookingServiceType) {
    const byOrder = [...serviceTiers].sort((a, b) => a.sortOrder - b.sortOrder);
    const vipTier = byOrder.find((tierItem) => tierItem.isVIP);
    const nonVipTier = byOrder.find((tierItem) => !tierItem.isVIP);

    if (serviceType === "VIP") {
      return vipTier ?? byOrder[0] ?? null;
    }

    return nonVipTier ?? byOrder[0] ?? null;
  }

  const selectedServiceType = form.watch("serviceType");
  const selectedTier = resolveServiceTier(selectedServiceType);
  const guestCount = Number(form.watch("guestCount") || 0);

  const filteredMenus = useMemo(
    () => menus.filter((menu) => !menu.serviceTierId || menu.serviceTierId === selectedTier?.id),
    [menus, selectedTier?.id],
  );

  const estimatedTotal = selectedTier ? selectedTier.pricePerGuest * guestCount : 0;

  async function onSubmit(values: CreateBookingData) {
    setIsSubmitting(true);
    setStatusMessage(null);
    setErrorMessage(null);

    const payload = {
      ...values,
      serviceTierId: selectedTier?.id,
      menuId: values.menuId?.trim() ? values.menuId : null,
      chefProfileId: values.chefProfileId?.trim() ? values.chefProfileId : null,
      venueAddress: values.venueAddress?.trim() || null,
      specialRequests: values.specialRequests?.trim() || null,
      contactName: values.contactName.trim(),
      contactPhone: values.contactPhone.trim(),
      contactEmail: values.contactEmail.trim(),
      venue: values.venue.trim(),
    };

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || t("messages.createError"));
        return;
      }

      setStatusMessage(t("messages.createSuccess"));
      form.reset({
        ...values,
        serviceTierId: "",
        menuId: "",
        chefProfileId: "",
        specialRequests: "",
      });
      setCurrentStep(0);
    } catch {
      setErrorMessage(t("messages.createError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  type BookingStep = {
    id: number;
    title: string;
    description: string;
    icon: LucideIcon;
    fields: Path<CreateBookingData>[];
  };

  const bookingSteps: BookingStep[] = [
    {
      id: 1,
      title: t("form.steps.serviceSelection.title"),
      description: t("form.steps.serviceSelection.description"),
      icon: Check,
      fields: ["serviceType"],
    },
    {
      id: 2,
      title: t("form.steps.eventDetails.title"),
      description: t("form.steps.eventDetails.description"),
      icon: Calendar,
      fields: ["guestCount", "eventDate", "eventTime", "venue"],
    },
    {
      id: 3,
      title: t("form.steps.contactAndNotes.title"),
      description: t("form.steps.contactAndNotes.description"),
      icon: ChefHat,
      fields: ["contactName", "contactPhone", "contactEmail"],
    },
    {
      id: 4,
      title: t("form.steps.reviewAndSubmit.title"),
      description: t("form.steps.reviewAndSubmit.description"),
      icon: FileSignature,
      fields: [],
    },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const isFinalStep = currentStep === bookingSteps.length - 1;

  async function handleNextStep() {
    const step = bookingSteps[currentStep];
    const isValid = step.fields.length === 0
      ? true
      : await form.trigger(step.fields, { shouldFocus: true });

    if (!isValid) {
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, bookingSteps.length - 1));
  }

  function handleBackStep() {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }

  async function handleStepClick(index: number) {
    if (index === currentStep) {
      return;
    }

    if (index < currentStep) {
      setCurrentStep(index);
      return;
    }

    const step = bookingSteps[currentStep];
    const isValid = step.fields.length === 0
      ? true
      : await form.trigger(step.fields, { shouldFocus: true });

    if (isValid) {
      setCurrentStep(index);
    }
  }

  const selectedMenu = menus.find((menu) => menu.id === form.watch("menuId"));
  const selectedChef = chefs.find((chef) => chef.id === form.watch("chefProfileId"));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("form.title")}</CardTitle>
        <CardDescription>{t("form.description")}</CardDescription>
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

            <div className="grid grid-cols-2 gap-4 relative lg:grid-cols-4">
              <div className="absolute left-0 top-8 hidden h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent lg:block" />
              {bookingSteps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                const circleClass = isCompleted
                  ? "border-emerald-500/50 bg-emerald-500/10"
                  : isCurrent
                    ? "border-primary/50 bg-primary/10"
                    : "border-white/10 bg-card";

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => void handleStepClick(index)}
                    className="group relative z-10 flex flex-col items-center text-center"
                    aria-current={isCurrent ? "step" : undefined}
                  >
                    <div className={`mb-3 flex h-16 w-16 items-center justify-center rounded-full border transition-colors ${circleClass}`}>
                      <step.icon className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
                    </div>
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>
                  </button>
                );
              })}
            </div>

            {currentStep === 0 && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.fields.eventType")}</FormLabel>
                      <Select value={field.value} onValueChange={(value: BookingServiceType) => {
                        field.onChange(value);
                        form.setValue("menuId", "");
                      }}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("form.placeholders.eventType")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="WEDDING">{t("serviceTypes.WEDDING")}</SelectItem>
                          <SelectItem value="CORPORATE">{t("serviceTypes.CORPORATE")}</SelectItem>
                          <SelectItem value="VIP">{t("serviceTypes.VIP")}</SelectItem>
                          <SelectItem value="PRIVATE">{t("serviceTypes.PRIVATE")}</SelectItem>
                          <SelectItem value="OTHER">{t("serviceTypes.OTHER")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="menuId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.fields.menuOptional")}</FormLabel>
                      <Select
                        value={field.value || "none"}
                        onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("form.placeholders.menu")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">{t("form.none.menu")}</SelectItem>
                          {filteredMenus.map((menu) => (
                            <SelectItem key={menu.id} value={menu.id}>
                              {menu.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="chefProfileId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.fields.chefOptional")}</FormLabel>
                      <Select
                        value={field.value || "none"}
                        onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("form.placeholders.chef")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">{t("form.none.chef")}</SelectItem>
                          {chefs.map((chef) => (
                            <SelectItem key={chef.id} value={chef.id}>
                              {chef.name} ({chef.specialty})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="guestCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.fields.guestCount")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            {...field}
                            onChange={(event) => field.onChange(Number(event.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="eventDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.fields.eventDate")}</FormLabel>
                        <FormControl>
                          <Input type="date" min={getTodayDate()} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="eventTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.fields.eventTime")}</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="venue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.fields.locationName")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("form.placeholders.locationName")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="venueAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.fields.addressOptional")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("form.placeholders.address")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.fields.contactName")}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.fields.contactPhone")}</FormLabel>
                        <FormControl>
                          <Input placeholder="+976XXXXXXXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.fields.contactEmail")}</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="specialRequests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.fields.specialRequestsOptional")}</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder={t("form.placeholders.specialRequests")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 rounded-md border bg-muted/20 p-4 text-sm md:grid-cols-2">
                  <div>
                    <p className="text-muted-foreground">{t("summary.serviceType")}</p>
                    <p className="font-medium">{t(`serviceTypes.${form.getValues("serviceType")}`)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("summary.assignedPackage")}</p>
                    <p className="font-medium">{selectedTier?.name ?? t("summary.autoSelectUnavailable")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("list.menu")}</p>
                    <p className="font-medium">{selectedMenu?.name ?? t("form.none.menu")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("list.chef")}</p>
                    <p className="font-medium">{selectedChef ? `${selectedChef.name} (${selectedChef.specialty})` : t("form.none.chef")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("summary.guests")}</p>
                    <p className="font-medium">{t("list.guests", { count: guestCount })}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("summary.eventDateTime")}</p>
                    <p className="font-medium">{form.getValues("eventDate")} {t("list.at")} {form.getValues("eventTime")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("summary.venue")}</p>
                    <p className="font-medium">{form.getValues("venue")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("summary.contact")}</p>
                    <p className="font-medium">{form.getValues("contactName")} | {form.getValues("contactPhone")}</p>
                    <p className="text-muted-foreground">{form.getValues("contactEmail")}</p>
                  </div>
                </div>

                <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
                  {t("summary.estimatedTotal")}: <strong>{formatPrice(estimatedTotal)}</strong>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 border-t pt-4">
              <Button type="button" variant="outline" onClick={handleBackStep} disabled={currentStep === 0 || isSubmitting}>
                {t("actions.back")}
              </Button>

              {isFinalStep ? (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t("actions.submitting") : t("actions.createBooking")}
                </Button>
              ) : (
                <Button type="button" onClick={() => void handleNextStep()} disabled={isSubmitting}>
                  {t("actions.continue")}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
