"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CheckIcon, SearchIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { createMenuSchema } from "@/lib/validations/menus";
import type { MenuRecord } from "@/components/menus/menus-columns";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

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

interface MenuFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menu: MenuRecord | null;
  mode: "create" | "edit" | "view";
  onSuccess: () => void;
}

export function MenuFormSheet({
  open,
  onOpenChange,
  menu,
  mode,
  onSuccess,
}: MenuFormSheetProps) {
  const [isPending, setIsPending] = useState(false);
  const [serviceTiers, setServiceTiers] = useState<ServiceTierOption[]>([]);
  const [availableItems, setAvailableItems] = useState<AvailableMenuItem[]>([]);
  const [itemSearch, setItemSearch] = useState("");

  const isCreate = mode === "create";
  const isEdit = mode === "edit";
  const isView = mode === "view";

  const form = useForm<MenuFormValues>({
    resolver: zodResolver(createMenuSchema),
    defaultValues: {
      name: "",
      description: "",
      downloadUrl: "",
      serviceTierId: null,
      menuItemIds: [],
      imageUrl: "",
      isActive: true,
    },
  });

  // Load service tiers + available food items when sheet opens (not in view mode)
  useEffect(() => {
    if (!open || isView) return;

    let isMounted = true;

    async function loadData() {
      try {
        const [tiersRes, itemsRes] = await Promise.all([
          fetch("/api/service-tiers"),
          fetch("/api/menu-items?isActive=true&limit=200&sortBy=name&sortOrder=asc"),
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
      }
    }

    void loadData();
    return () => { isMounted = false; };
  }, [isView, open]);

  // Reset form when mode/menu changes
  useEffect(() => {
    if (isCreate) {
      form.reset({
        name: "",
        description: "",
        downloadUrl: "",
        serviceTierId: null,
        menuItemIds: [],
        imageUrl: "",
        isActive: true,
      });
      setItemSearch("");
      return;
    }

    if (menu) {
      form.reset({
        name: menu.name,
        description: menu.description ?? "",
        downloadUrl: menu.downloadUrl ?? "",
        serviceTierId: menu.serviceTierId,
        menuItemIds: menu.items.map((item) => item.id),
        imageUrl: menu.imageUrl ?? "",
        isActive: menu.isActive,
      });
    }
  }, [form, isCreate, menu]);

  async function onSubmit(values: MenuFormValues) {
    setIsPending(true);

    const payload = {
      ...values,
      description: values.description || null,
      imageUrl: values.imageUrl || null,
      downloadUrl: values.downloadUrl || null,
      serviceTierId: values.serviceTierId || null,
    };

    try {
      const response = await fetch(isCreate ? "/api/menus" : `/api/menus/${menu?.id}`, {
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
      onSuccess();
      onOpenChange(false);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsPending(false);
    }
  }

  const selectedIds = form.watch("menuItemIds") ?? [];

  function toggleItem(itemId: string) {
    const current = [...selectedIds];
    const idx = current.indexOf(itemId);
    if (idx === -1) {
      form.setValue("menuItemIds", [...current, itemId], { shouldDirty: true });
    } else {
      current.splice(idx, 1);
      form.setValue("menuItemIds", current, { shouldDirty: true });
    }
  }

  const filteredItems = availableItems.filter((i) =>
    i.name.toLowerCase().includes(itemSearch.toLowerCase()),
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {isCreate ? "Add New Menu" : isEdit ? "Edit Menu" : "Menu Details"}
          </SheetTitle>
          <SheetDescription>
            {isCreate
              ? "Compose a menu by selecting existing food items"
              : isEdit
                ? "Update menu information and food items"
                : "View menu details"}
          </SheetDescription>
        </SheetHeader>

        {menu && !isCreate ? (
          <>
            <div className="flex items-center justify-between py-4">
              <div>
                <h3 className="text-lg font-semibold">{menu.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {menu.serviceTier ? `${menu.serviceTier.name} tier` : "Available across all tiers"}
                </p>
              </div>
              <Badge variant={menu.isActive ? "default" : "secondary"}>
                {menu.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <Separator />
          </>
        ) : null}

        {isView && menu ? (
          <div className="flex flex-1 flex-col gap-4 py-4 text-sm">
            <div>
              <label className="text-muted-foreground flex items-center justify-between mb-2">Cover Image</label>
              {menu.imageUrl ? (
                <div className="aspect-video w-full relative overflow-hidden rounded-lg border">
                  <img
                    src={menu.imageUrl}
                    alt={menu.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <p className="text-sm font-medium text-muted-foreground italic">— No cover image</p>
              )}
            </div>
            <div>
              <label className="text-muted-foreground">Description</label>
              <p className="mt-1 font-medium">{menu.description || "—"}</p>
            </div>
            <div>
              <label className="text-muted-foreground">Service Tier</label>
              <p className="mt-1 font-medium">
                {menu.serviceTier ? menu.serviceTier.name : "All tiers"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-muted-foreground">Items</label>
                <p className="mt-1 font-medium">{menu._count.items}</p>
              </div>
              <div>
                <label className="text-muted-foreground">Bookings</label>
                <p className="mt-1 font-medium">{menu._count.bookings}</p>
              </div>
            </div>
            <div>
              <label className="text-muted-foreground">Food Items</label>
              {menu.items.length > 0 ? (
                <div className="mt-2 space-y-2">
                  {menu.items.map((item) => (
                    <div key={item.id} className="rounded-md border p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.description ? (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {item.description}
                            </p>
                          ) : null}
                        </div>
                        <span className="shrink-0 text-xs font-mono text-muted-foreground">
                          {Number(item.price).toLocaleString("en-US")}₮
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-1 font-medium">—</p>
              )}
            </div>
            <Separator />
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{format(new Date(menu.createdAt), "MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Updated</span>
                <span>{format(new Date(menu.updatedAt), "MMM d, yyyy")}</span>
              </div>
            </div>
            <SheetFooter className="mt-auto pt-4">
              <SheetClose asChild>
                <Button variant="outline" className="w-full">Close</Button>
              </SheetClose>
            </SheetFooter>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Dinner Menu" {...field} />
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
                    <Select
                      value={field.value ?? "all"}
                      onValueChange={(value) => field.onChange(value === "all" ? null : value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an optional service tier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">All tiers</SelectItem>
                        {serviceTiers.map((tier) => (
                          <SelectItem key={tier.id} value={tier.id}>
                            {tier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Leave unset to make this menu available across all tiers.
                    </p>
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
                        rows={2}
                        placeholder="Short menu description"
                        {...field}
                        value={field.value ?? ""}
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
                    <FormLabel>Menu Cover Image</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        onRemove={() => field.onChange("")}
                        aspectRatio="video"
                      />
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
                    <FormLabel className="m-0">Active Status</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Food item picker */}
              <FormField
                control={form.control}
                name="menuItemIds"
                render={() => (
                  <FormItem>
                    <div className="rounded-lg border">
                      <div className="flex items-center justify-between p-3 border-b">
                        <div>
                          <FormLabel className="text-sm font-medium">Food Items</FormLabel>
                          <p className="text-xs text-muted-foreground">
                            {selectedIds.length} selected
                          </p>
                        </div>
                        {availableItems.length === 0 && (
                          <span className="text-xs text-muted-foreground">
                            No active food items yet
                          </span>
                        )}
                      </div>

                      {availableItems.length > 0 && (
                        <>
                          <div className="p-2 border-b">
                            <div className="relative">
                              <SearchIcon className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                              <Input
                                placeholder="Search food items..."
                                value={itemSearch}
                                onChange={(e) => setItemSearch(e.target.value)}
                                className="h-8 pl-8 text-sm"
                              />
                            </div>
                          </div>

                          <div className="max-h-60 overflow-y-auto divide-y">
                            {filteredItems.length === 0 ? (
                              <p className="p-4 text-center text-sm text-muted-foreground">
                                No items match your search
                              </p>
                            ) : (
                              filteredItems.map((item) => {
                                const isSelected = selectedIds.includes(item.id);
                                return (
                                  <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => toggleItem(item.id)}
                                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
                                  >
                                    <Checkbox
                                      checked={isSelected}
                                      onCheckedChange={() => toggleItem(item.id)}
                                      className="pointer-events-none shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium truncate">{item.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {CATEGORY_LABELS[item.category] ?? item.category}
                                      </p>
                                    </div>
                                    <span className="shrink-0 text-xs font-mono text-muted-foreground">
                                      {Number(item.price).toLocaleString("en-US")}₮
                                    </span>
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <SheetFooter className="mt-auto pt-4">
                <SheetClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </SheetClose>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : isCreate ? "Create Menu" : "Save Changes"}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}
