"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Fuse from "fuse.js";
import {
  CheckIcon,
  SearchIcon,
  XIcon,
  PlusIcon,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Trash2,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { createMenuSchema } from "@/lib/validations/menus";
import { ImageUpload } from "@/components/ui/image-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { z } from "zod";

type MenuFormValues = z.input<typeof createMenuSchema>;

type ServiceTierOption = {
  id: string;
  name: string;
  description: string | null;
  isVIP: boolean;
  sortOrder: number;
};

type AvailableMenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  isActive: boolean;
  imageUrl?: string | null;
};

const CATEGORY_LABELS: Record<string, string> = {
  APPETIZER: "Appetizer",
  MAIN_COURSE: "Main Course",
  DESSERT: "Dessert",
  BEVERAGE: "Beverage",
  SIDE_DISH: "Side Dish",
  SALAD: "Salad",
  SOUP: "Soup",
  OTHER: "Other",
};

const CATEGORY_ORDER = [
  "APPETIZER",
  "SALAD",
  "SOUP",
  "MAIN_COURSE",
  "SIDE_DISH",
  "DESSERT",
  "BEVERAGE",
  "OTHER",
];

interface MenuFormClientProps {
  initialData?: any;
  menuId?: string;
  isView?: boolean;
}

export function MenuFormClient({ initialData, menuId, isView = false }: MenuFormClientProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [serviceTiers, setServiceTiers] = useState<ServiceTierOption[]>([]);
  const [availableItems, setAvailableItems] = useState<AvailableMenuItem[]>([]);
  const [itemSearch, setItemSearch] = useState("");

  const isCreate = !menuId;
  const isEdit = !!menuId && !isView;

  // Track selection simply bypassing heavy RHF array validations to fix update depth errors
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (initialData?.items && Array.isArray(initialData.items)) {
      return initialData.items.map((item: any) => String(item.id));
    }
    return [];
  });

  const defaultValues = useMemo<MenuFormValues>(() => {
    if (initialData) {
      return {
        name: initialData.name || "",
        description: initialData.description ?? "",
        downloadUrl: initialData.downloadUrl ?? "",
        serviceTierId: initialData.serviceTierId || null,
        menuItemIds: [],
        imageUrl: initialData.imageUrl ?? "",
        isActive: initialData.isActive ?? true,
      };
    }
    return {
      name: "",
      description: "",
      downloadUrl: "",
      serviceTierId: null,
      menuItemIds: [],
      imageUrl: "",
      isActive: true,
    };
  }, [initialData]);

  const form = useForm<MenuFormValues>({
    resolver: zodResolver(createMenuSchema),
    defaultValues,
  });

  // Load service tiers + available food items
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [tiersRes, itemsRes] = await Promise.all([
          fetch("/api/service-tiers"),
          fetch("/api/menu-items?limit=1000&sortBy=name&sortOrder=asc"),
        ]);

        const [tiersResult, itemsResult] = await Promise.all([
          tiersRes.json(),
          itemsRes.json(),
        ]);

        if (isMounted) {
          setServiceTiers(tiersResult.data ?? []);
          setAvailableItems(itemsResult.data ?? []);
        }
      } catch {
        if (isMounted) toast.error("Failed to load data");
      } finally {
        if (isMounted) setIsLoadingData(false);
      }
    }

    void loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fuse.js search
  const fuse = useMemo(
    () =>
      new Fuse(availableItems, {
        keys: ["name", "category", "description"],
        threshold: 0.3,
      }),
    [availableItems],
  );

  const filteredItems = useMemo(() => {
    if (!itemSearch.trim()) return availableItems;
    return fuse.search(itemSearch).map((res) => res.item);
  }, [fuse, itemSearch, availableItems]);

  const selectedItems = useMemo(
    () => availableItems.filter((i) => selectedIds.includes(i.id)),
    [availableItems, selectedIds],
  );

  const groupedSelectedItems = useMemo(() => {
    const groups: Record<string, AvailableMenuItem[]> = {};
    selectedItems.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return Object.entries(groups).sort(([a], [b]) => {
      const idxA = CATEGORY_ORDER.indexOf(a);
      const idxB = CATEGORY_ORDER.indexOf(b);
      return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    });
  }, [selectedItems]);

  const groupedFilteredItems = useMemo(() => {
    const groups: Record<string, AvailableMenuItem[]> = {};
    filteredItems.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return Object.entries(groups).sort(([a], [b]) => {
      const idxA = CATEGORY_ORDER.indexOf(a);
      const idxB = CATEGORY_ORDER.indexOf(b);
      return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    });
  }, [filteredItems]);

  function toggleItem(itemId: string) {
    if (isView) return;
    setSelectedIds((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      }
      return [...prev, itemId];
    });
  }

  async function onSubmit(values: MenuFormValues) {
    setIsPending(true);

    const payload = {
      ...values,
      menuItemIds: selectedIds,
      description: values.description || null,
      imageUrl: values.imageUrl || null,
      downloadUrl: values.downloadUrl || null,
      serviceTierId: values.serviceTierId || null,
    };

    try {
      const response = await fetch(isCreate ? "/api/menus" : `/api/menus/${menuId}`, {
        method: isCreate ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || "Failed to save menu");
        return;
      }

      toast.success(isCreate ? "Menu created successfully" : "Menu updated successfully");
      router.push("/dashboard/menus");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsPending(false);
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            type="button"
            size="icon"
            onClick={() => router.push("/dashboard/menus")}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">
              {isCreate ? "Create Menu" : isView ? "Menu Details" : "Edit Menu"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isCreate
                ? "Design a new menu with selection of food items"
                : isView
                  ? "Viewing specific menu composition and details"
                  : "Update your existing menu information"}
            </p>
          </div>
        </div>
        {isView ? (
          <div className="flex items-center gap-3">
            <Button type="button" onClick={() => router.push(`/dashboard/menus/${menuId}?mode=edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Menu
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.push(isEdit ? `/dashboard/menus/${menuId}?mode=view` : "/dashboard/menus")}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="button" onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isCreate ? "Create Menu" : "Save Changes"}
            </Button>
          </div>
        )}
      </div>

      <Form {...form}>
        <form className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Basic Info */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <Card>
              <CardContent className="pt-6 flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Menu Name</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g. Premium Wedding Buffet" {...field} disabled={isView} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serviceTierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Tier</FormLabel>
                      <FormControl>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant={field.value === null ? "default" : "outline"}
                            size="sm"
                            onClick={() => field.onChange(null)}
                            disabled={isView}
                            className={cn("rounded-full transition-all", field.value === null ? "shadow-sm" : "")}
                          >
                            All tiers
                          </Button>
                          {serviceTiers.map((tier) => (
                            <Button
                              key={tier.id}
                              type="button"
                              variant={field.value === tier.id ? "default" : "outline"}
                              size="sm"
                              onClick={() => field.onChange(tier.id)}
                              disabled={isView}
                              className={cn("rounded-full transition-all", field.value === tier.id ? "shadow-sm" : "")}
                            >
                              {tier.name}
                            </Button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What makes this menu special?"
                          className="min-h-[120px] resize-none"
                          {...field}
                          value={field.value ?? ""}
                          disabled={isView}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Image</FormLabel>
                      <FormControl>
                        {isView ? (
                          field.value ? (
                            <div className="aspect-video w-full relative overflow-hidden rounded-lg border">
                              <img
                                src={field.value}
                                alt="Menu cover"
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="aspect-video w-full flex items-center justify-center rounded-lg border bg-muted text-muted-foreground text-sm italic">
                              No cover image
                            </div>
                          )
                        ) : (
                          <ImageUpload
                            value={field.value}
                            onChange={field.onChange}
                            onRemove={() => field.onChange("")}
                            aspectRatio="video"
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Active Status</FormLabel>
                        <p className="text-[10px] text-muted-foreground">
                          Visible to customers on the frontend
                        </p>
                      </div>
                      <FormControl>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={field.value}
                          onClick={() => field.onChange(!field.value)}
                          disabled={isView}
                          className={cn(
                            "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
                            field.value ? "bg-primary" : "bg-input"
                          )}
                        >
                          <span
                            className={cn(
                              "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform",
                              field.value ? "translate-x-4" : "translate-x-0"
                            )}
                          />
                        </button>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Food Item Selection */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="border-b bg-muted/30 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold italic">Food Items Composition</h3>
                  <Badge variant="secondary" className="font-mono">
                    {selectedIds.length} items
                  </Badge>
                </div>
              </div>

              <CardContent className="p-0">
                <div className="flex flex-col">
                  {/* Selected Items Grid */}
                  <div className="p-6">
                    <h4 className="mb-4 text-sm font-medium text-muted-foreground">Selected Items</h4>
                    {selectedItems.length > 0 ? (
                      <div className="flex flex-col gap-6">
                        {groupedSelectedItems.map(([category, items]) => (
                          <div key={category} className="space-y-3">
                            <h5 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary/70">
                              <span className="h-px flex-1 bg-border" />
                              {CATEGORY_LABELS[category] || category}
                              <Badge variant="outline" className="h-4 px-1 text-[8px] font-normal lowercase">
                                {items.length} items
                              </Badge>
                              <span className="h-px flex-1 bg-border" />
                            </h5>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                              {items.map((item) => (
                                <div
                                  key={item.id}
                                  className="group flex items-center justify-between gap-3 rounded-lg border p-3 bg-card transition-shadow hover:shadow-sm"
                                >
                                  <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                                      {item.imageUrl ? (
                                        <img
                                          src={item.imageUrl}
                                          alt={item.name}
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <div className="flex h-full w-full items-center justify-center text-[8px] text-muted-foreground uppercase bg-muted/50">
                                          {item.name.substring(0, 2)}
                                        </div>
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-semibold">{item.name}</p>
                                      <p className="text-[10px] text-muted-foreground">
                                        {Number(item.price).toLocaleString()}₮
                                        {!item.isActive && (
                                          <span className="ml-2 text-destructive font-bold uppercase">Inactive</span>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                  {!isView && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => toggleItem(item.id)}
                                      className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center bg-muted/5">
                        <p className="text-sm text-muted-foreground">No food items selected yet.</p>
                        <p className="text-xs text-muted-foreground">Start searching below to add items to this menu.</p>
                      </div>
                    )}
                  </div>

                  {!isView && (
                    <>
                      <Separator />
                      {/* Search and Picker */}
                      <div className="bg-muted/10 p-6">
                        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <h4 className="text-sm font-medium text-muted-foreground">Add More Items</h4>
                          <div className="relative w-full md:w-64">
                            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Fuzzy search items..."
                              value={itemSearch}
                              onChange={(e) => setItemSearch(e.target.value)}
                              className="h-9 pl-9 text-xs"
                            />
                          </div>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto rounded-lg border bg-background">
                          <div className="grid grid-cols-1 divide-y">
                            {filteredItems.length === 0 ? (
                              <div className="flex flex-col items-center justify-center py-10 text-center">
                                <p className="text-xs text-muted-foreground italic">No food items found matching that criteria.</p>
                              </div>
                            ) : (
                              <div className="flex flex-col">
                                {groupedFilteredItems.map(([category, items]) => (
                                  <div key={category} className="flex flex-col">
                                    <div className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-y border-border/50">
                                      {CATEGORY_LABELS[category] || category}
                                    </div>
                                    <div className="flex flex-col divide-y">
                                      {items.map((item) => {
                                        const isSelected = selectedIds.includes(item.id);
                                        return (
                                          <div
                                            key={item.id}
                                            onClick={() => toggleItem(item.id)}
                                            className={cn(
                                              "flex cursor-pointer items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-muted/50",
                                              isSelected && "bg-primary/5 hover:bg-primary/10"
                                            )}
                                          >
                                            <div
                                              className={cn(
                                                "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-primary shadow pointer-events-none transition-colors",
                                                isSelected ? "bg-primary text-primary-foreground" : "bg-transparent text-transparent"
                                              )}
                                            >
                                              <CheckIcon className="h-3 w-3" />
                                            </div>
                                            <div className="flex h-10 w-10 shrink-0 overflow-hidden rounded border bg-muted">
                                              {item.imageUrl ? (
                                                <img
                                                  src={item.imageUrl}
                                                  alt={item.name}
                                                  className="h-full w-full object-cover"
                                                />
                                              ) : (
                                                <div className="flex h-full w-full items-center justify-center text-[6px] text-muted-foreground uppercase bg-muted/30">
                                                  {item.name.substring(0, 2)}
                                                </div>
                                              )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                              <p className="text-sm font-medium truncate">{item.name}</p>
                                              <p className="text-[10px] text-muted-foreground">
                                                {Number(item.price).toLocaleString()}₮
                                                {!item.isActive && (
                                                  <span className="ml-2 text-destructive font-bold uppercase">Draft</span>
                                                )}
                                              </p>
                                            </div>
                                            {isSelected ? (
                                              <Badge variant="default" className="h-5 px-1.5 text-[9px] uppercase tracking-wider">
                                                Selected
                                              </Badge>
                                            ) : (
                                              <div className="inline-flex h-7 items-center justify-center rounded-md border border-input bg-background px-3 text-[10px] font-bold uppercase shadow-sm transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                                                <PlusIcon className="mr-1 h-3 w-3" />
                                                Add
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}
