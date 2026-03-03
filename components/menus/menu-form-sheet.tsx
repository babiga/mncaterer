"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type MenuFormValues = z.input<typeof createMenuSchema>;

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

  const isCreate = mode === "create";
  const isEdit = mode === "edit";
  const isView = mode === "view";

  const form = useForm<MenuFormValues>({
    resolver: zodResolver(createMenuSchema),
    defaultValues: {
      name: "",
      description: undefined,
      downloadUrl: undefined,
      isActive: true,
    },
  });

  useEffect(() => {
    if (isCreate) {
      form.reset({
        name: "",
        description: undefined,
        downloadUrl: undefined,
        isActive: true,
      });
      return;
    }

    if (menu) {
      form.reset({
        name: menu.name,
        description: menu.description ?? "",
        downloadUrl: menu.downloadUrl ?? "",
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
              <label className="text-muted-foreground">Download URL</label>
              {menu.downloadUrl ? (
                <a
                  href={menu.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block font-medium text-primary hover:underline"
                >
                  {menu.downloadUrl}
                </a>
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
                name="downloadUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Download URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} value={field.value ?? ""} />
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
