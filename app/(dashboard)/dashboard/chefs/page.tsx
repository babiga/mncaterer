"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { PlusIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UsersDataTable } from "@/components/users/users-data-table";
import { DeleteUserDialog } from "@/components/users/delete-user-dialog";
import { getChefsColumns, type ChefUser } from "@/components/chefs/chefs-columns";
import { ChefFormSheet } from "@/components/chefs/chef-form-sheet";

export default function ChefsManagementPage() {
    const [user, setUser] = useState<any>(null);
    const [chefs, setChefs] = useState<ChefUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Sheet state
    const [sheetOpen, setSheetOpen] = useState(false);
    const [selectedChef, setSelectedChef] = useState<ChefUser | null>(null);
    const [sheetMode, setSheetMode] = useState<"create" | "edit" | "view">("view");

    // Delete dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<ChefUser | null>(null);

    const isAdmin = user?.role === "ADMIN";

    const fetchSession = useCallback(async () => {
        try {
            const response = await fetch("/api/auth/me");
            const result = await response.json();
            if (result.success) {
                setUser(result.data);
            }
        } catch (error) {
            console.error("Failed to fetch session:", error);
        }
    }, []);

    const fetchChefs = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/dashboard-users?role=CHEF&limit=100");
            const result = await response.json();
            if (result.success) {
                setChefs(result.data);
            }
        } catch {
            toast.error("Failed to load chefs");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSession();
        fetchChefs();
    }, [fetchSession, fetchChefs]);

    const handleCreate = () => {
        setSelectedChef(null);
        setSheetMode("create");
        setSheetOpen(true);
    };

    const handleView = (chef: ChefUser) => {
        setSelectedChef(chef);
        setSheetMode("view");
        setSheetOpen(true);
    };

    const handleEdit = (chef: ChefUser) => {
        setSelectedChef(chef);
        setSheetMode("edit");
        setSheetOpen(true);
    };

    const handleDelete = (chef: ChefUser) => {
        setUserToDelete(chef);
        setDeleteDialogOpen(true);
    };

    const handleToggleActive = async (chef: ChefUser) => {
        try {
            const response = await fetch(`/api/dashboard-users/${chef.id}/activate`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !chef.isActive }),
            });
            const result = await response.json();
            if (result.success) {
                setChefs((prev) =>
                    prev.map((c) => (c.id === chef.id ? { ...c, isActive: !c.isActive } : c))
                );
                toast.success(chef.isActive ? "Chef deactivated" : "Chef activated");
            }
        } catch {
            toast.error("Failed to toggle status");
        }
    };

    const handleToggleVerify = async (chef: ChefUser) => {
        try {
            const response = await fetch(`/api/dashboard-users/${chef.id}/verify`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isVerified: !chef.isVerified }),
            });
            const result = await response.json();
            if (result.success) {
                setChefs((prev) =>
                    prev.map((c) => (c.id === chef.id ? { ...c, isVerified: !c.isVerified } : c))
                );
                toast.success(chef.isVerified ? "Chef unverified" : "Chef verified");
            }
        } catch {
            toast.error("Failed to toggle verification");
        }
    };

    const handleToggleTaxStatus = async (chef: ChefUser, taxStatus: "PENDING" | "PAID" | "WAIVED") => {
        try {
            const response = await fetch(`/api/dashboard-users/chefs/${chef.id}/tax-status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ taxStatus }),
            });
            const result = await response.json();
            if (result.success) {
                setChefs((prev) =>
                    prev.map((c) =>
                        c.id === chef.id
                            ? {
                                  ...c,
                                  chefProfile: c.chefProfile
                                      ? { ...c.chefProfile, taxStatus }
                                      : null,
                              }
                            : c
                    )
                );
                toast.success(`Registration status updated to ${taxStatus}`);
            }
        } catch {
            toast.error("Failed to update registration status");
        }
    };

    const onDeleteConfirmed = () => {
        if (!userToDelete) return;
        setChefs((prev) => prev.filter((c) => c.id !== userToDelete.id));
        setUserToDelete(null);
    };

    const columns = useMemo(
        () =>
            getChefsColumns({
                onView: handleView,
                onEdit: handleEdit,
                onDelete: handleDelete,
                onToggleActive: handleToggleActive,
                onToggleVerify: handleToggleVerify,
                onToggleTaxStatus: handleToggleTaxStatus,
                role: user?.role,
            }),
        [handleDelete, handleEdit, handleToggleActive, handleToggleVerify, handleToggleTaxStatus, handleView, user?.role]
    );

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 lg:px-6 px-4">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="flex items-center justify-between px-4 lg:px-6">
                <div>
                    <h1 className="text-2xl font-bold">Chefs Management</h1>
                    <p className="text-muted-foreground">List and manage your platform's culinary talent</p>
                </div>
                {isAdmin && (
                    <Button onClick={handleCreate}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Add Chef
                    </Button>
                )}
            </div>

            <div className="px-4 lg:px-6">
                <UsersDataTable
                    columns={columns as any}
                    data={chefs}
                    searchPlaceholder="Search chefs by name or email..."
                />
            </div>

            <ChefFormSheet
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                user={selectedChef}
                mode={sheetMode}
                onSuccess={fetchChefs}
            />

            {userToDelete && (
                <DeleteUserDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    user={{
                        id: userToDelete.id,
                        name: userToDelete.name,
                        email: userToDelete.email,
                    }}
                    userType="dashboard"
                    onDeleted={onDeleteConfirmed}
                />
            )}
        </div>
    );
}
