"use client";

import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontalIcon, StarIcon } from "lucide-react";
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

export type ReviewRecord = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  chefProfile: {
    id: string;
    dashboardUser: {
      id: string;
      name: string;
      email: string;
    };
  };
  booking: {
    id: string;
    bookingNumber: string;
    status: string;
  };
};

interface ReviewsColumnsProps {
  onEdit: (review: ReviewRecord) => void;
  onDelete: (review: ReviewRecord) => void;
}

export function getReviewsColumns({
  onEdit,
  onDelete,
}: ReviewsColumnsProps): ColumnDef<ReviewRecord>[] {
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
      enableHiding: false,
    },
    {
      accessorKey: "chefProfile.dashboardUser.name",
      header: "Chef",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <Link
            href={`/dashboard/users/dashboard/${row.original.chefProfile.dashboardUser.id}`}
            className="w-fit font-medium hover:underline"
          >
            {row.original.chefProfile.dashboardUser.name}
          </Link>
          <span className="text-xs text-muted-foreground">{row.original.chefProfile.dashboardUser.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span>{row.original.rating.toFixed(1)}</span>
        </div>
      ),
    },
    {
      accessorKey: "comment",
      header: "Comment",
      cell: ({ row }) =>
        row.original.comment ? (
          <span className="line-clamp-2 text-sm">{row.original.comment}</span>
        ) : (
          <span className="text-xs text-muted-foreground">No comment</span>
        ),
    },
    {
      accessorKey: "booking.bookingNumber",
      header: "Booking",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-mono text-xs">{row.original.booking.bookingNumber}</span>
          <span className="text-xs text-muted-foreground">{row.original.booking.status}</span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Submitted",
      cell: ({ row }) => (
        <span>{format(new Date(row.original.createdAt), "MMM d, yyyy HH:mm")}</span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const review = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 data-[state=open]:bg-muted">
                <MoreHorizontalIcon className="h-4 w-4" />
                <span className="sr-only">Open actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onEdit(review)}>
                Edit Review
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(review)}
              >
                Delete Review
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
