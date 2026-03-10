"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontalIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserStatusBadge } from "./user-status-badge";

export type DashboardUser = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  role: "ADMIN" | "CHEF" | "COMPANY";
  isVerified: boolean;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

interface DashboardUsersColumnsProps {
  onView: (user: DashboardUser) => void;
  onEdit: (user: DashboardUser) => void;
  onDelete: (user: DashboardUser) => void;
  onToggleActive: (user: DashboardUser) => void;
  onToggleVerify: (user: DashboardUser) => void;
}

export function getDashboardUsersColumns({
  onView,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleVerify,
}: DashboardUsersColumnsProps): ColumnDef<DashboardUser>[] {
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
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
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
      header: "Name",
      cell: ({ row }) => {
        const user = row.original;
        const initials = user.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <Button
                variant="link"
                className="h-auto p-0 text-left justify-start font-medium"
                onClick={() => onView(user)}
              >
                {user.name}
              </Button>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
        );
      },
      enableHiding: false,
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <UserStatusBadge type="role" value={row.original.role} />
      ),
      filterFn: (row, id, value) => {
        return value === row.getValue(id);
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <UserStatusBadge type="active" value={row.original.isActive} />
      ),
    },
    {
      accessorKey: "isVerified",
      header: "Verified",
      cell: ({ row }) => (
        <UserStatusBadge type="verified" value={row.original.isVerified} />
      ),
    },
    {
      accessorKey: "lastLoginAt",
      header: "Last Login",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.lastLoginAt
            ? formatDistanceToNow(new Date(row.original.lastLoginAt), {
              addSuffix: true,
            })
            : "Never"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatDistanceToNow(new Date(row.original.createdAt), {
            addSuffix: true,
          })}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
              >
                <MoreHorizontalIcon className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onView(user)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(user)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onToggleActive(user)}>
                {user.isActive ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleVerify(user)}>
                {user.isVerified ? "Unverify" : "Verify"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(user)}
                className="text-destructive focus:text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
