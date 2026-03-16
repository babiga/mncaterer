"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { UtensilsCrossedIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import {
  getMenuItemsColumns,
  type MenuItemRecord,
} from "@/components/menu-items/menu-items-columns";
import { MenuItemFormSheet } from "@/components/menu-items/menu-item-form-sheet";
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

export default function MenuItemsPage() {
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<MenuItemRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItemRecord | null>(null);
  const [sheetMode, setSheetMode] = useState<"create" | "edit" | "view">("view");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MenuItemRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin = user?.role === "ADMIN";

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const result = await res.json();
      if (result.success) setUser(result.data);
    } catch (error) {
      console.error("Failed to fetch session:", error);
    }
  }, []);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/menu-items?limit=100&sortBy=createdAt&sortOrder=desc");
      const result = await res.json();
      if (!result.success) {
        toast.error(result.error || "Failed to load menu items");
        return;
      }
      setItems(result.data || []);
    } catch {
      toast.error("Failed to load menu items");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
    fetchItems();
  }, [fetchSession, fetchItems]);

  const handleCreate = useCallback(() => {
    setSelectedItem(null);
    setSheetMode("create");
    setSheetOpen(true);
  }, []);

  const handleView = useCallback((item: MenuItemRecord) => {
    setSelectedItem(item);
    setSheetMode("view");
    setSheetOpen(true);
  }, []);

  const handleEdit = useCallback((item: MenuItemRecord) => {
    setSelectedItem(item);
    setSheetMode("edit");
    setSheetOpen(true);
  }, []);

  const handleDelete = useCallback((item: MenuItemRecord) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  }, []);

  const handleToggleActive = useCallback(async (item: MenuItemRecord) => {
    try {
      const res = await fetch(`/api/menu-items/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      const result = await res.json();
      if (!result.success) {
        toast.error(result.error || "Failed to update status");
        return;
      }
      setItems((prev) => prev.map((row) => (row.id === item.id ? result.data : row)));
      toast.success(item.isActive ? "Item deactivated" : "Item activated");
    } catch {
      toast.error("Failed to update status");
    }
  }, []);

  const onDeleteConfirmed = useCallback(async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/menu-items/${itemToDelete.id}`, { method: "DELETE" });
      const result = await res.json();
      if (!result.success) {
        toast.error(result.error || "Failed to delete item");
        return;
      }
      setItems((prev) => prev.filter((row) => row.id !== itemToDelete.id));
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      toast.success("Menu item deleted");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsDeleting(false);
    }
  }, [itemToDelete]);

  const columns = useMemo(
    () =>
      getMenuItemsColumns({
        onView: handleView,
        onEdit: handleEdit,
        onDelete: handleDelete,
        onToggleActive: handleToggleActive,
        role: user?.role,
      }),
    [handleView, handleEdit, handleDelete, handleToggleActive, user?.role],
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-bold">Food Items</h1>
          <p className="text-muted-foreground">
            Manage individual food items — add them to menus afterwards
          </p>
        </div>
        {isAdmin && (
          <Button onClick={handleCreate}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Food Item
          </Button>
        )}
      </div>

      <div className="px-4 lg:px-6">
        <UsersDataTable
          columns={columns as any}
          data={items}
          searchPlaceholder="Search food items by name..."
          searchColumn="name"
        />
      </div>

      <MenuItemFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        item={selectedItem}
        mode={sheetMode}
        onSuccess={fetchItems}
      />

      {itemToDelete ? (
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Food Item</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{" "}
                <strong>{itemToDelete.name}</strong>? It will also be removed from any menus that
                include it.
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
