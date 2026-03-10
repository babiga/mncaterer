"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontalIcon, StarIcon } from "lucide-react";
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
import { UserStatusBadge } from "@/components/users/user-status-badge";

export type ChefUser = {
    id: string;
    email: string;
    name: string;
    phone: string | null;
    avatar: string | null;
    role: "CHEF";
    isVerified: boolean;
    isActive: boolean;
    lastLoginAt: string | null;
    createdAt: string;
    updatedAt: string;
    chefProfile: {
        specialty: string;
        rating: number;
        hourlyRate: number;
    } | null;
};

interface ChefsColumnsProps {
    onView: (user: ChefUser) => void;
    onEdit: (user: ChefUser) => void;
    onDelete: (user: ChefUser) => void;
    onToggleActive: (user: ChefUser) => void;
    onToggleVerify: (user: ChefUser) => void;
}

export function getChefsColumns({
    onView,
    onEdit,
    onDelete,
    onToggleActive,
    onToggleVerify,
}: ChefsColumnsProps): ColumnDef<ChefUser>[] {
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
            header: "Chef",
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
            accessorKey: "specialty",
            header: "Specialty",
            cell: ({ row }) => {
                const specialty = row.original.chefProfile?.specialty || "Not specified";
                return <span className="font-medium">{specialty}</span>;
            },
        },
        {
            accessorKey: "rating",
            header: "Rating",
            cell: ({ row }) => {
                const rating = row.original.chefProfile?.rating || 0;
                return (
                    <div className="flex items-center gap-1">
                        <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{rating.toFixed(1)}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: "hourlyRate",
            header: "Rate",
            cell: ({ row }) => {
                const rate = row.original.chefProfile?.hourlyRate || 0;
                return <span>${Number(rate).toFixed(2)}/hr</span>;
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
            accessorKey: "createdAt",
            header: "Joined",
            cell: ({ row }) => (
                <span className="text-muted-foreground text-xs">
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
                                Edit Profile
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
                                Delete Chef
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
}
