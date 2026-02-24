"use client";

import { siteContentSchema } from "@/lib/validations/contents";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";

type ContentType = "BANNER" | "SOCIAL_LINK" | "PARTNER";

interface SiteContent {
  id: string;
  type: ContentType;
  title: string | null;
  subtitle: string | null;
  imageUrl: string | null;
  link: string | null;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface ContentFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: SiteContent | null;
  type: ContentType;
  onSuccess: () => void;
}

export function ContentFormSheet({
  open,
  onOpenChange,
  content,
  type,
  onSuccess,
}: ContentFormSheetProps) {
  const [isPending, setIsPending] = useState(false);
  const isEdit = !!content;

  const form = useForm({
    resolver: zodResolver(siteContentSchema),
    defaultValues: {
      type,
      title: "",
      subtitle: "",
      imageUrl: "",
      link: "",
      icon: "",
      isActive: true,
      sortOrder: 0,
    },
  });

  useEffect(() => {
    if (content) {
      form.reset({
        type: content.type,
        title: content.title || "",
        subtitle: content.subtitle || "",
        imageUrl: content.imageUrl || "",
        link: content.link || "",
        icon: content.icon || "",
        isActive: content.isActive,
        sortOrder: content.sortOrder || 0,
      });
    } else {
      form.reset({
        type,
        title: "",
        subtitle: "",
        imageUrl: "",
        link: "",
        icon: "",
        isActive: true,
        sortOrder: 0,
      });
    }
  }, [content, type, form, open]);

  async function onSubmit(data: any) {
    setIsPending(true);
    try {
      const url = isEdit ? `/api/contents/${content.id}` : "/api/contents";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(
          result.error || `Failed to ${isEdit ? "update" : "create"}`,
        );
        return;
      }

      toast.success(`Successfully ${isEdit ? "updated" : "created"}`);
      onSuccess();
      onOpenChange(false);
      if (!isEdit) form.reset();
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
            {isEdit ? "Edit" : "Add New"} {type.replace("_", " ")}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update the content item settings."
              : "Create a new content item."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col gap-4 py-4"
          >
            {(type === "BANNER" || type === "PARTNER") && (
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {type === "BANNER" ? "Title" : "Name"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={type === "BANNER" ? "Title" : "Name"}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {(type === "BANNER" || type === "SOCIAL_LINK") && (
              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {type === "BANNER"
                        ? "Subtitle"
                        : "Description (Optional)"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          type === "BANNER" ? "Subtitle" : "Description"
                        }
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Image URL {type !== "BANNER" && "(Optional)"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    {type === "BANNER"
                      ? "URL for the main banner image."
                      : "URL for the partner or social icon image."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Link URL {type !== "SOCIAL_LINK" && "(Optional)"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {type === "SOCIAL_LINK" && (
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon Name (lucide-react)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Facebook, Instagram, Twitter"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Use valid Lucide icon names (PascalCase).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value || ""}
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
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <SheetFooter className="mt-auto pt-4">
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Save Changes" : "Create"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
