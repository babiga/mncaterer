"use client";

import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontalIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export type BookingRecord = {
  id: string;
  bookingNumber: string;
  serviceType: "CORPORATE" | "PRIVATE" | "WEDDING" | "VIP" | "OTHER";
  status: "PENDING" | "CONFIRMED" | "DEPOSIT_PAID" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  eventDate: string;
  eventTime: string;
  guestCount: number;
  venue: string;
  totalPrice: number;
  depositAmount: number | null;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  serviceTier: {
    id: string;
    name: string;
    pricePerGuest: number;
  };
  menu: {
    id: string;
    name: string;
  } | null;
  chefProfile: {
    id: string;
    dashboardUser: {
      id: string;
      name: string;
      email: string;
    };
  } | null;
};

const statusClassMap: Record<BookingRecord["status"], string> = {
  PENDING: "border-amber-500/30 text-amber-700",
  CONFIRMED: "border-blue-500/30 text-blue-700",
  DEPOSIT_PAID: "border-cyan-500/30 text-cyan-700",
  IN_PROGRESS: "border-indigo-500/30 text-indigo-700",
  COMPLETED: "border-emerald-500/30 text-emerald-700",
  CANCELLED: "border-rose-500/30 text-rose-700",
};

const serviceLabelMap: Record<BookingRecord["serviceType"], string> = {
  CORPORATE: "Corporate",
  PRIVATE: "Private",
  WEDDING: "Wedding",
  VIP: "VIP",
  OTHER: "Other",
};

function formatAmount(amount: number) {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

type BookingsColumnsProps = {
  onUpdateStatus: (booking: BookingRecord, status: BookingRecord["status"]) => void;
  role?: string;
};

export function getBookingsColumns({ onUpdateStatus, role }: BookingsColumnsProps): ColumnDef<BookingRecord>[] {
  const isAdmin = role === "ADMIN";
  return [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
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
      accessorKey: "bookingNumber",
      header: "Booking",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <a href={`/dashboard/bookings/${row.original.id}`} className="font-mono text-xs font-medium hover:underline">
            #{row.original.bookingNumber}
          </a>
          <span className="text-xs text-muted-foreground">{row.original.serviceTier.name}</span>
        </div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "customer.name",
      header: "Customer",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <Link
            href={`/dashboard/users/customer/${row.original.customer.id}`}
            className="w-fit font-medium hover:underline"
          >
            {row.original.customer.name}
          </Link>
          <span className="text-xs text-muted-foreground">{row.original.customer.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "serviceType",
      header: "Service",
      cell: ({ row }) => (
        <span className="text-sm">{serviceLabelMap[row.original.serviceType]}</span>
      ),
    },
    {
      accessorKey: "eventDate",
      header: "Event",
      cell: ({ row }) => (
        <div className="flex flex-col text-sm">
          <span>{format(new Date(row.original.eventDate), "MMM d, yyyy")}</span>
          <span className="text-xs text-muted-foreground">{row.original.eventTime}</span>
        </div>
      ),
    },
    {
      accessorKey: "guestCount",
      header: "Guests",
      cell: ({ row }) => <span>{row.original.guestCount}</span>,
    },
    {
      accessorKey: "totalPrice",
      header: "Total",
      cell: ({ row }) => (
        <div className="flex flex-col text-sm">
          <span>{formatAmount(row.original.totalPrice)}</span>
          <span className="text-xs text-muted-foreground">
            Deposit: {row.original.depositAmount ? formatAmount(row.original.depositAmount) : "N/A"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="outline" className={statusClassMap[row.original.status]}>
          {row.original.status.replaceAll("_", " ")}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => <span className="text-sm">{format(new Date(row.original.createdAt), "MMM d, yyyy")}</span>,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const booking = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 data-[state=open]:bg-muted">
                <MoreHorizontalIcon className="h-4 w-4" />
                <span className="sr-only">Open actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <a href={`/dashboard/bookings/${booking.id}`}>View Details</a>
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Set Status</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => onUpdateStatus(booking, "PENDING")}>Mark as Pending</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onUpdateStatus(booking, "CONFIRMED")}>Mark as Confirmed</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onUpdateStatus(booking, "DEPOSIT_PAID")}>
                    Mark as Deposit Paid
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onUpdateStatus(booking, "IN_PROGRESS")}>
                    Mark as In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onUpdateStatus(booking, "COMPLETED")}>Mark as Completed</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onUpdateStatus(booking, "CANCELLED")}
                  >
                    Mark as Cancelled
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
