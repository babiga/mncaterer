"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { UsersDataTable } from "@/components/users/users-data-table";
import { getInquiriesColumns, type InquiryRecord } from "@/components/inquiries/inquiries-columns";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inquiryToDelete, setInquiryToDelete] = useState<InquiryRecord | null>(null);

  const fetchInquiries = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/inquiries?limit=200&sortOrder=desc");
      const result = await response.json();
      if (!result.success) {
        toast.error(result.error || "Failed to load inquiries");
        return;
      }
      setInquiries(result.data || []);
    } catch {
      toast.error("Failed to load inquiries");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const handleUpdateStatus = useCallback(async (inquiry: InquiryRecord, status: InquiryRecord["status"]) => {
    try {
      const response = await fetch(`/api/inquiries/${inquiry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (!result.success) {
        toast.error(result.error || "Failed to update inquiry");
        return;
      }

      setInquiries((prev) => prev.map((row) => (row.id === inquiry.id ? result.data : row)));
      toast.success("Inquiry status updated");
    } catch {
      toast.error("Failed to update inquiry");
    }
  }, []);

  const handleDeleteOpen = useCallback((inquiry: InquiryRecord) => {
    setInquiryToDelete(inquiry);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirmed = useCallback(async () => {
    if (!inquiryToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/inquiries/${inquiryToDelete.id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!result.success) {
        toast.error(result.error || "Failed to delete inquiry");
        return;
      }

      setInquiries((prev) => prev.filter((row) => row.id !== inquiryToDelete.id));
      setDeleteDialogOpen(false);
      setInquiryToDelete(null);
      toast.success("Inquiry deleted");
    } catch {
      toast.error("Failed to delete inquiry");
    } finally {
      setIsDeleting(false);
    }
  }, [inquiryToDelete]);

  const columns = useMemo(
    () =>
      getInquiriesColumns({
        onUpdateStatus: handleUpdateStatus,
        onDelete: handleDeleteOpen,
      }),
    [handleDeleteOpen, handleUpdateStatus],
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
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-bold">Consultation Inquiries</h1>
        <p className="text-muted-foreground">Review and manage guest consultation requests</p>
      </div>

      <div className="px-4 lg:px-6">
        <UsersDataTable
          columns={columns as any}
          data={inquiries}
          searchPlaceholder="Search inquiries..."
          searchColumn="name"
          filterColumn="status"
          filterOptions={[
            { label: "New", value: "NEW" },
            { label: "In Progress", value: "IN_PROGRESS" },
            { label: "Resolved", value: "RESOLVED" },
          ]}
        />
      </div>

      {inquiryToDelete ? (
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Inquiry</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete inquiry from <strong>{inquiryToDelete.name}</strong>?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirmed}
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
