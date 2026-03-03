"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { MenuFormSheet } from "@/components/menus/menu-form-sheet";
import { getMenusColumns, type MenuRecord } from "@/components/menus/menus-columns";
import { UsersDataTable } from "@/components/users/users-data-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function MenusPage() {
  const [menus, setMenus] = useState<MenuRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuRecord | null>(null);
  const [sheetMode, setSheetMode] = useState<"create" | "edit" | "view">("view");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState<MenuRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMenus = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch(
        "/api/menus?limit=100&sortBy=createdAt&sortOrder=desc",
      );
      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || "Failed to load menus");
        return;
      }

      setMenus(result.data || []);
    } catch {
      toast.error("Failed to load menus");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const handleCreate = useCallback(() => {
    setSelectedMenu(null);
    setSheetMode("create");
    setSheetOpen(true);
  }, []);

  const handleView = useCallback((menu: MenuRecord) => {
    setSelectedMenu(menu);
    setSheetMode("view");
    setSheetOpen(true);
  }, []);

  const handleEdit = useCallback((menu: MenuRecord) => {
    setSelectedMenu(menu);
    setSheetMode("edit");
    setSheetOpen(true);
  }, []);

  const handleDelete = useCallback((menu: MenuRecord) => {
    setMenuToDelete(menu);
    setDeleteDialogOpen(true);
  }, []);

  const handleToggleActive = useCallback(async (menu: MenuRecord) => {
    try {
      const response = await fetch(`/api/menus/${menu.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !menu.isActive }),
      });

      const result = await response.json();
      if (!result.success) {
        toast.error(result.error || "Failed to update menu status");
        return;
      }

      setMenus((prev) => prev.map((row) => (row.id === menu.id ? result.data : row)));
      toast.success(menu.isActive ? "Menu deactivated" : "Menu activated");
    } catch {
      toast.error("Failed to update menu status");
    }
  }, []);

  const onDeleteConfirmed = useCallback(async () => {
    if (!menuToDelete) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/menus/${menuToDelete.id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || "Failed to delete menu");
        return;
      }

      setMenus((prev) => prev.filter((row) => row.id !== menuToDelete.id));
      setDeleteDialogOpen(false);
      setMenuToDelete(null);
      toast.success("Menu deleted successfully");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsDeleting(false);
    }
  }, [menuToDelete]);

  const columns = useMemo(
    () =>
      getMenusColumns({
        onView: handleView,
        onEdit: handleEdit,
        onDelete: handleDelete,
        onToggleActive: handleToggleActive,
      }),
    [handleDelete, handleEdit, handleToggleActive, handleView],
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-bold">Menus Management</h1>
          <p className="text-muted-foreground">Create and manage your service menus</p>
        </div>
        <Button onClick={handleCreate}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Menu
        </Button>
      </div>

      <div className="px-4 lg:px-6">
        <UsersDataTable
          columns={columns as any}
          data={menus}
          searchPlaceholder="Search menus by name..."
          searchColumn="name"
        />
      </div>

      <MenuFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        menu={selectedMenu}
        mode={sheetMode}
        onSuccess={fetchMenus}
      />

      {menuToDelete ? (
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Menu</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{menuToDelete.name}</strong>? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDeleteConfirmed}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </div>
  );
}
