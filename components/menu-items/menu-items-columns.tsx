"use client";

import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { CheckIcon, MoreHorizontalIcon, XIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type MenuItemRecord = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  ingredients: string[];
  allergens: string[];
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count: { menus: number };
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

const CATEGORY_COLORS: Record<string, string> = {
  APPETIZER: "border-amber-500/30 text-amber-600 bg-amber-500/10",
  MAIN_COURSE: "border-blue-500/30 text-blue-600 bg-blue-500/10",
  DESSERT: "border-pink-500/30 text-pink-600 bg-pink-500/10",
  BEVERAGE: "border-cyan-500/30 text-cyan-600 bg-cyan-500/10",
  SIDE_DISH: "border-green-500/30 text-green-600 bg-green-500/10",
  SALAD: "border-lime-500/30 text-lime-600 bg-lime-500/10",
  SOUP: "border-orange-500/30 text-orange-600 bg-orange-500/10",
  OTHER: "border-muted-foreground/30 text-muted-foreground",
};

interface MenuItemsColumnsProps {
  onView: (item: MenuItemRecord) => void;
  onEdit: (item: MenuItemRecord) => void;
  onDelete: (item: MenuItemRecord) => void;
  onToggleActive: (item: MenuItemRecord) => void;
  role?: string;
}

export function getMenuItemsColumns({
  onView,
  onEdit,
  onDelete,
  onToggleActive,
  role,
}: MenuItemsColumnsProps): ColumnDef<MenuItemRecord>[] {
  const isAdmin = role === "ADMIN";

  return [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Food Item",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex flex-col">
            <Button
              variant="link"
              className="h-auto p-0 text-left justify-start font-medium"
              onClick={() => onView(item)}
            >
              {item.name}
            </Button>
            {item.description ? (
              <span className="line-clamp-1 text-xs text-muted-foreground">{item.description}</span>
            ) : null}
          </div>
        );
      },
      enableHiding: false,
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={`text-xs ${CATEGORY_COLORS[row.original.category] ?? CATEGORY_COLORS.OTHER}`}
        >
          {CATEGORY_LABELS[row.original.category] ?? row.original.category}
        </Badge>
      ),
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {row.original.price.toLocaleString("en-US")}₮
        </span>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) =>
        row.original.isActive ? (
          <Badge variant="outline" className="gap-1 border-emerald-500/30 text-emerald-600">
            <CheckIcon className="h-3 w-3" />
            Active
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1 border-muted-foreground/30 text-muted-foreground">
            <XIcon className="h-3 w-3" />
            Inactive
          </Badge>
        ),
    },
    {
      id: "menus",
      header: "Used in Menus",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original._count.menus}</span>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Updated",
      cell: ({ row }) => (
        <span className="text-sm">{format(new Date(row.original.updatedAt), "MMM d, yyyy")}</span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 data-[state=open]:bg-muted">
                <MoreHorizontalIcon className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onView(item)}>View Details</DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuItem onClick={() => onEdit(item)}>Edit Item</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onToggleActive(item)}>
                    {item.isActive ? "Deactivate" : "Activate"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(item)}
                    className="text-destructive focus:text-destructive"
                  >
                    Delete Item
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
