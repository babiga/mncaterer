"use client";

import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontalIcon } from "lucide-react";

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
import Link from "next/link";

export type InquiryRecord = {
  id: string;
  userId: string | null;
  type: "INDIVIDUAL" | "ORG";
  name: string;
  phone: string;
  email: string;
  serviceType: "CORPORATE" | "PRIVATE" | "WEDDING" | "VIP" | "OTHER";
  message: string | null;
  status: "NEW" | "IN_PROGRESS" | "RESOLVED";
  createdAt: string;
  updatedAt: string;
};

const statusClasses: Record<InquiryRecord["status"], string> = {
  NEW: "border-blue-500/30 text-blue-600",
  IN_PROGRESS: "border-amber-500/30 text-amber-600",
  RESOLVED: "border-emerald-500/30 text-emerald-600",
};

const statusLabel: Record<InquiryRecord["status"], string> = {
  NEW: "New",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
};

const typeLabel: Record<InquiryRecord["type"], string> = {
  INDIVIDUAL: "Individual",
  ORG: "Organization",
};

const serviceLabel: Record<InquiryRecord["serviceType"], string> = {
  CORPORATE: "Corporate",
  PRIVATE: "Private",
  WEDDING: "Wedding",
  VIP: "VIP",
  OTHER: "Other",
};

interface InquiriesColumnsProps {
  onUpdateStatus: (inquiry: InquiryRecord, status: InquiryRecord["status"]) => void;
  onDelete: (inquiry: InquiryRecord) => void;
  role?: string;
}

export function getInquiriesColumns({
  onUpdateStatus,
  onDelete,
  role,
}: InquiriesColumnsProps): ColumnDef<InquiryRecord>[] {
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
      header: "Contact",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-xs text-muted-foreground">{row.original.email}</span>
          <span className="text-xs text-muted-foreground">{row.original.phone}</span>
        </div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => <span>{typeLabel[row.original.type]}</span>,
    },
    {
      accessorKey: "userId",
      header: "Linked User",
      cell: ({ row }) =>
        row.original.userId ? (
          <Link
            href={`/dashboard/users/customer/${row.original.userId}`}
            className="font-mono text-xs hover:underline"
          >
            {row.original.userId}
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground">Guest</span>
        ),
    },
    {
      accessorKey: "serviceType",
      header: "Service",
      cell: ({ row }) => <span>{serviceLabel[row.original.serviceType]}</span>,
    },
    {
      accessorKey: "message",
      header: "Message",
      cell: ({ row }) =>
        row.original.message ? (
          <span className="line-clamp-2 text-sm">{row.original.message}</span>
        ) : (
          <span className="text-xs text-muted-foreground">No message</span>
        ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="outline" className={statusClasses[row.original.status]}>
          {statusLabel[row.original.status]}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Received",
      cell: ({ row }) => <span>{format(new Date(row.original.createdAt), "MMM d, yyyy HH:mm")}</span>,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const inquiry = row.original;
        if (!isAdmin) return null;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 data-[state=open]:bg-muted">
                <MoreHorizontalIcon className="h-4 w-4" />
                <span className="sr-only">Open actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onUpdateStatus(inquiry, "NEW")}>
                Mark as New
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateStatus(inquiry, "IN_PROGRESS")}>
                Mark as In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateStatus(inquiry, "RESOLVED")}>
                Mark as Resolved
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(inquiry)}
              >
                Delete Inquiry
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
