"use client";

import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { CheckIcon, DownloadIcon, MoreHorizontalIcon, XIcon } from "lucide-react";

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

export type MenuRecord = {
  id: string;
  name: string;
  description: string | null;
  downloadUrl: string | null;
  imageUrl: string | null;
  serviceTierId: string | null;
  serviceTier: {
    id: string;
    name: string;
    isVIP: boolean;
  } | null;
  isActive: boolean;
  items: {
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
  }[];
  createdAt: string;
  updatedAt: string;
  _count: {
    items: number;
    bookings: number;
  };
};

interface MenusColumnsProps {
  onView: (menu: MenuRecord) => void;
  onEdit: (menu: MenuRecord) => void;
  onDelete: (menu: MenuRecord) => void;
  onToggleActive: (menu: MenuRecord) => void;
  role?: string;
}

export function getMenusColumns({
  onView,
  onEdit,
  onDelete,
  onToggleActive,
  role,
}: MenusColumnsProps): ColumnDef<MenuRecord>[] {
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
      header: "Menu",
      cell: ({ row }) => {
        const menu = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-16 shrink-0 overflow-hidden rounded-md border bg-muted">
              {menu.imageUrl ? (
                <img
                  src={menu.imageUrl}
                  alt={menu.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <span className="text-[10px]">No image</span>
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <Button
                variant="link"
                className="h-auto p-0 text-left justify-start font-medium"
                onClick={() => onView(menu)}
              >
                {menu.name}
              </Button>
              {menu.description ? (
                <span className="line-clamp-1 text-xs text-muted-foreground">{menu.description}</span>
              ) : null}
            </div>
          </div>
        );
      },
      enableHiding: false,
    },
    {
      id: "tier",
      header: "Tier",
      cell: ({ row }) => (
        row.original.serviceTier ? (
          <Badge variant="secondary">
            {row.original.serviceTier.name}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">All tiers</span>
        )
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
      id: "items",
      header: "Items",
      cell: ({ row }) => <span>{row.original._count.items}</span>,
    },
    {
      id: "bookings",
      header: "Bookings",
      cell: ({ row }) => <span>{row.original._count.bookings}</span>,
    },
    {
      id: "download",
      header: "Download",
      cell: ({ row }) =>
        row.original.downloadUrl ? (
          <a
            href={row.original.downloadUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <DownloadIcon className="h-3.5 w-3.5" />
            File
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">None</span>
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
        const menu = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 data-[state=open]:bg-muted">
                <MoreHorizontalIcon className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onView(menu)}>View Details</DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuItem onClick={() => onEdit(menu)}>Edit Menu</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onToggleActive(menu)}>
                    {menu.isActive ? "Deactivate" : "Activate"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(menu)}
                    className="text-destructive focus:text-destructive"
                  >
                    Delete Menu
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
