"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { PlusIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { createMenuItemSchema, menuItemCategoryValues } from "@/lib/validations/menu-items";
import type { MenuItemRecord } from "@/components/menu-items/menu-items-columns";
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

type MenuItemFormValues = z.input<typeof createMenuItemSchema>;

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

interface MenuItemFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: MenuItemRecord | null;
  mode: "create" | "edit" | "view";
  onSuccess: () => void;
}

export function MenuItemFormSheet({
  open,
  onOpenChange,
  item,
  mode,
  onSuccess,
}: MenuItemFormSheetProps) {
  const [isPending, setIsPending] = useState(false);
  const [ingredientInput, setIngredientInput] = useState("");
  const [allergenInput, setAllergenInput] = useState("");

  const isCreate = mode === "create";
  const isEdit = mode === "edit";
  const isView = mode === "view";

  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(createMenuItemSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "OTHER",
      ingredients: [],
      allergens: [],
      imageUrl: "",
      isActive: true,
      sortOrder: 0,
    },
  });

  useEffect(() => {
    if (isCreate) {
      form.reset({
        name: "",
        description: "",
        price: 0,
        category: "OTHER",
        ingredients: [],
        allergens: [],
        imageUrl: "",
        isActive: true,
        sortOrder: 0,
      });
      setIngredientInput("");
      setAllergenInput("");
      return;
    }

    if (item) {
      form.reset({
        name: item.name,
        description: item.description ?? "",
        price: item.price,
        category: item.category as MenuItemFormValues["category"],
        ingredients: item.ingredients,
        allergens: item.allergens,
        imageUrl: item.imageUrl ?? "",
        isActive: item.isActive,
        sortOrder: item.sortOrder,
      });
    }
  }, [form, isCreate, item]);

  async function onSubmit(values: MenuItemFormValues) {
    setIsPending(true);

    const payload = {
      ...values,
      description: values.description || null,
      imageUrl: values.imageUrl || null,
      ingredients: (values.ingredients ?? []).map((v) => v.trim()).filter(Boolean),
      allergens: (values.allergens ?? []).map((v) => v.trim()).filter(Boolean),
    };

    try {
      const response = await fetch(
        isCreate ? "/api/menu-items" : `/api/menu-items/${item?.id}`,
        {
          method: isCreate ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || "Failed to save menu item");
        return;
      }

      toast.success(isCreate ? "Menu item created" : "Menu item updated");
      onSuccess();
      onOpenChange(false);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsPending(false);
    }
  }

  function addTag(field: "ingredients" | "allergens", input: string, setInput: (v: string) => void) {
    const trimmed = input.trim();
    if (!trimmed) return;
    const current = form.getValues(field) ?? [];
    if (!current.includes(trimmed)) {
      form.setValue(field, [...current, trimmed], { shouldDirty: true });
    }
    setInput("");
  }

  function removeTag(field: "ingredients" | "allergens", tag: string) {
    const current = form.getValues(field) ?? [];
    form.setValue(field, current.filter((t) => t !== tag), { shouldDirty: true });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {isCreate ? "Add Food Item" : isEdit ? "Edit Food Item" : "Item Details"}
          </SheetTitle>
          <SheetDescription>
            {isCreate
              ? "Create a standalone food item (e.g. Fried Salmon, Cheese Burger)"
              : isEdit
                ? "Update food item information"
                : "View food item details"}
          </SheetDescription>
        </SheetHeader>

        {item && !isCreate ? (
          <>
            <div className="flex items-center justify-between py-4">
              <div>
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {CATEGORY_LABELS[item.category] ?? item.category}
                </p>
              </div>
              <Badge variant={item.isActive ? "default" : "secondary"}>
                {item.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <Separator />
          </>
        ) : null}

        {isView && item ? (
          <div className="flex flex-1 flex-col gap-4 py-4 text-sm">
            <div>
              <label className="text-muted-foreground">Price</label>
              <p className="mt-1 font-medium font-mono">{item.price.toLocaleString("en-US")}₮</p>
            </div>
            <div>
              <label className="text-muted-foreground">Description</label>
              <p className="mt-1 font-medium">{item.description || "—"}</p>
            </div>
            <div>
              <label className="text-muted-foreground">Image URL</label>
              <p className="mt-1 font-medium break-all">{item.imageUrl || "—"}</p>
            </div>
            {item.ingredients.length > 0 && (
              <div>
                <label className="text-muted-foreground">Ingredients</label>
                <div className="mt-1 flex flex-wrap gap-1">
                  {item.ingredients.map((i) => (
                    <Badge key={i} variant="outline" className="text-xs">{i}</Badge>
                  ))}
                </div>
              </div>
            )}
            {item.allergens.length > 0 && (
              <div>
                <label className="text-muted-foreground">Allergens</label>
                <div className="mt-1 flex flex-wrap gap-1">
                  {item.allergens.map((a) => (
                    <Badge key={a} variant="destructive" className="text-xs">{a}</Badge>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label className="text-muted-foreground">Used in</label>
              <p className="mt-1 font-medium">{item._count.menus} menu(s)</p>
            </div>
            <Separator />
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{format(new Date(item.createdAt), "MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Updated</span>
                <span>{format(new Date(item.updatedAt), "MMM d, yyyy")}</span>
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
                      <Input placeholder="e.g. Fried Salmon" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (₮)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          {...field}
                          value={field.value ?? 0}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {menuItemCategoryValues.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {CATEGORY_LABELS[cat]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Brief description of the dish..."
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
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Ingredients */}
              <FormField
                control={form.control}
                name="ingredients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingredients</FormLabel>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add ingredient..."
                        value={ingredientInput}
                        onChange={(e) => setIngredientInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag("ingredients", ingredientInput, setIngredientInput);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => addTag("ingredients", ingredientInput, setIngredientInput)}
                      >
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    {(field.value ?? []).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {(field.value ?? []).map((tag) => (
                          <Badge key={tag} variant="outline" className="gap-1 pr-1 text-xs">
                            {tag}
                            <button type="button" onClick={() => removeTag("ingredients", tag)}>
                              <XIcon className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Allergens */}
              <FormField
                control={form.control}
                name="allergens"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allergens</FormLabel>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add allergen..."
                        value={allergenInput}
                        onChange={(e) => setAllergenInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag("allergens", allergenInput, setAllergenInput);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => addTag("allergens", allergenInput, setAllergenInput)}
                      >
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    {(field.value ?? []).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {(field.value ?? []).map((tag) => (
                          <Badge key={tag} variant="destructive" className="gap-1 pr-1 text-xs">
                            {tag}
                            <button type="button" onClick={() => removeTag("allergens", tag)}>
                              <XIcon className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <FormLabel className="m-0">Active</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <SheetFooter className="mt-auto pt-4">
                <SheetClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </SheetClose>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : isCreate ? "Create Item" : "Save Changes"}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}
