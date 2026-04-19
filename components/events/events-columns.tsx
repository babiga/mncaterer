"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontalIcon, CalendarIcon, UsersIcon } from "lucide-react";
import { format } from "date-fns";

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

export type EventItem = {
    id: string;
    title: string;
    description: string | null;
    eventType: "WEDDING" | "CORPORATE" | "PRIVATE" | "SOCIAL";
    guestCount: number;
    coverImageUrl: string | null;
    imageUrls: string[];
    videoUrl: string | null;
    location: string | null;
    eventDate: string | null;
    chefProfileId: string | null;
    companyProfileId: string | null;
    isFeatured: boolean;
    createdAt: string;
    updatedAt: string;
    chefProfile: {
        dashboardUser: { id: string; name: string };
    } | null;
    companyProfile: {
        dashboardUser: { id: string; name: string };
    } | null;
};

const eventTypeColors: Record<string, string> = {
    WEDDING: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    CORPORATE: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    PRIVATE: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    SOCIAL: "bg-amber-500/10 text-amber-500 border-amber-500/20",
};

interface EventsColumnsProps {
    onView: (event: EventItem) => void;
    onEdit: (event: EventItem) => void;
    onDelete: (event: EventItem) => void;
    onToggleFeatured: (event: EventItem) => void;
    role?: string;
}

export function getEventsColumns({
    onView,
    onEdit,
    onDelete,
    onToggleFeatured,
    role,
}: EventsColumnsProps): ColumnDef<EventItem>[] {
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
            accessorKey: "title",
            header: "Event",
            cell: ({ row }) => {
                const event = row.original;
                return (
                    <div className="flex flex-col">
                        <Button
                            variant="link"
                            className="h-auto p-0 text-left justify-start font-medium"
                            onClick={() => onView(event)}
                        >
                            {event.title}
                        </Button>
                        {event.description && (
                            <span className="text-xs text-muted-foreground line-clamp-1">
                                {event.description}
                            </span>
                        )}
                    </div>
                );
            },
            enableHiding: false,
        },
        {
            accessorKey: "eventType",
            header: "Type",
            cell: ({ row }) => {
                const type = row.original.eventType;
                return (
                    <Badge
                        variant="outline"
                        className={eventTypeColors[type] || ""}
                    >
                        {type.charAt(0) + type.slice(1).toLowerCase()}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "guestCount",
            header: "Guests",
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5">
                    <UsersIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{row.original.guestCount}</span>
                </div>
            ),
        },
        {
            accessorKey: "eventDate",
            header: "Date",
            cell: ({ row }) => {
                const date = row.original.eventDate;
                if (!date) return <span className="text-muted-foreground text-xs">Not set</span>;
                return (
                    <div className="flex items-center gap-1.5">
                        <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">
                            {format(new Date(date), "MMM d, yyyy")}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: "isFeatured",
            header: "Featured",
            cell: ({ row }) =>
                row.original.isFeatured ? (
                    <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
                        Featured
                    </Badge>
                ) : (
                    <span className="text-muted-foreground text-xs">-</span>
                ),
        },
        {
            accessorKey: "chefProfile",
            header: "Chef / Company",
            cell: ({ row }) => {
                const event = row.original;
                const linkedUser =
                    event.chefProfile?.dashboardUser ||
                    event.companyProfile?.dashboardUser;
                return linkedUser ? (
                    <Link
                        href={`/dashboard/users/dashboard/${linkedUser.id}`}
                        className="text-sm hover:underline"
                    >
                        {linkedUser.name}
                    </Link>
                ) : (
                    <span className="text-muted-foreground text-xs">-</span>
                );
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const event = row.original;

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
                            <DropdownMenuItem onClick={() => onView(event)}>
                                View Details
                            </DropdownMenuItem>
                            {isAdmin && (
                                <>
                                    <DropdownMenuItem onClick={() => onEdit(event)}>
                                        Edit Event
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => onToggleFeatured(event)}>
                                        {event.isFeatured ? "Unfeature" : "Feature"}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => onDelete(event)}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        Delete Event
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
