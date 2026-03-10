"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { createMenuSchema } from "@/lib/validations/menus";
import type { MenuRecord } from "@/components/menus/menus-columns";
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

  const isCreate = mode === "create";
  const isEdit = mode === "edit";
  const isView = mode === "view";

  const form = useForm<MenuFormValues>({
    resolver: zodResolver(createMenuSchema),
    defaultValues: {
      name: "",
      description: undefined,
      downloadUrl: undefined,
      serviceTierId: null,
      items: [],
      isActive: true,
    },
  });

  useEffect(() => {
    if (!open || isView) {
      return;
    }

    let isMounted = true;

    async function loadServiceTiers() {
      try {
        const response = await fetch("/api/service-tiers");
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Failed to load service tiers");
        }

        if (isMounted) {
          setServiceTiers(result.data ?? []);
        }
      } catch {
        if (isMounted) {
          toast.error("Failed to load service tiers");
        }
      }
    }

    void loadServiceTiers();

    return () => {
      isMounted = false;
    };
  }, [isView, open]);

  useEffect(() => {
    if (isCreate) {
      form.reset({
        name: "",
        description: undefined,
        downloadUrl: undefined,
        serviceTierId: null,
        items: [],
        isActive: true,
      });
      return;
    }

    if (menu) {
      form.reset({
        name: menu.name,
        description: menu.description ?? "",
        downloadUrl: menu.downloadUrl ?? "",
        serviceTierId: menu.serviceTierId,
        items: menu.items.map((item) => ({
          name: item.name,
          description: item.description ?? "",
          price: Number(item.price),
          ingredients: item.ingredients,
          allergens: item.allergens,
          imageUrl: item.imageUrl ?? "",
          sortOrder: item.sortOrder,
        })),
        isActive: menu.isActive,
      });
    }
  }, [form, isCreate, menu]);

  async function onSubmit(values: MenuFormValues) {
    setIsPending(true);

    const payload = {
      ...values,
      description: values.description || null,
      downloadUrl: values.downloadUrl || null,
      serviceTierId: values.serviceTierId || null,
      items: (values.items ?? []).map((item, index) => ({
        ...item,
        description: item.description || null,
        imageUrl: item.imageUrl || null,
        ingredients: (item.ingredients ?? []).map((value) => value.trim()).filter(Boolean),
        allergens: (item.allergens ?? []).map((value) => value.trim()).filter(Boolean),
        sortOrder: item.sortOrder ?? index,
      })),
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {isCreate ? "Add New Menu" : isEdit ? "Edit Menu" : "Menu Details"}
          </SheetTitle>
          <SheetDescription>
            {isCreate
              ? "Create a menu for a service tier"
              : isEdit
                ? "Update menu information"
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
              <label className="text-muted-foreground">Description</label>
              <p className="mt-1 font-medium">{menu.description || "-"}</p>
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
              <label className="text-muted-foreground">Menu Items</label>
              {menu.items.length > 0 ? (
                <div className="mt-2 space-y-2">
                  {menu.items.map((item) => (
                    <div key={item.id} className="rounded-md border p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{item.name}</p>
                        <span className="text-xs text-muted-foreground">
                          {Number(item.price).toLocaleString("en-US")}
                        </span>
                      </div>
                      {item.description ? (
                        <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-1 font-medium">-</p>
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
                <Button variant="outline" className="w-full">
                  Close
                </Button>
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
                        rows={3}
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

              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-medium">Menu Items</h3>
                    <p className="text-sm text-muted-foreground">
                      Add and reorder dishes included in this menu.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const items = form.getValues("items") ?? [];
                      form.setValue("items", [
                        ...items,
                        {
                          name: "",
                          description: "",
                          price: 0,
                        },
                      ], { shouldDirty: true });
                    }}
                  >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>

                {(form.watch("items") ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No items added yet.</p>
                ) : (
                  <div className="space-y-4">
                    {(form.watch("items") ?? []).map((item, index) => (
                      <div key={`${index}-${item.name}`} className="space-y-3 rounded-md border p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium">Item {index + 1}</p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const items = [...(form.getValues("items") ?? [])];
                              items.splice(index, 1);
                              form.setValue(
                                "items",
                                items.map((existingItem, itemIndex) => ({
                                  ...existingItem,
                                  sortOrder: itemIndex,
                                })),
                                { shouldDirty: true },
                              );
                            }}
                          >
                            <Trash2Icon className="h-4 w-4" />
                            <span className="sr-only">Remove item</span>
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name={`items.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Item Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Roasted lamb" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`items.${index}.price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Price</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    {...field}
                                    value={field.value ?? 0}
                                    onChange={(event) => field.onChange(Number(event.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name={`items.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Item Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  rows={2}
                                  placeholder="Brief description"
                                  {...field}
                                  value={field.value ?? ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <SheetFooter className="mt-auto pt-4">
                <SheetClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
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
