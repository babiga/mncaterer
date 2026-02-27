"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { UsersDataTable } from "@/components/users/users-data-table";
import { getReviewsColumns, type ReviewRecord } from "@/components/reviews/reviews-columns";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((index) => (
        <button
          key={index}
          type="button"
          onClick={() => onChange(index)}
          className="rounded-sm p-0.5"
          aria-label={`Rate ${index}`}
        >
          <Star
            className={`h-5 w-5 ${index <= value ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewsManagementPage() {
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [reviewToEdit, setReviewToEdit] = useState<ReviewRecord | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<ReviewRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/reviews?limit=200&sortOrder=desc");
      const result = await response.json();
      if (!result.success) {
        toast.error(result.error || "Failed to load reviews");
        return;
      }
      setReviews(result.data || []);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleEditOpen = useCallback((review: ReviewRecord) => {
    setReviewToEdit(review);
    setEditRating(review.rating);
    setEditComment(review.comment || "");
    setEditDialogOpen(true);
  }, []);

  const handleUpdateReview = useCallback(async () => {
    if (!reviewToEdit) return;
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/reviews/${reviewToEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: editRating,
          comment: editComment.trim() || null,
        }),
      });
      const result = await response.json();
      if (!result.success) {
        toast.error(result.error || "Failed to update review");
        return;
      }

      setReviews((prev) => prev.map((row) => (row.id === reviewToEdit.id ? result.data : row)));
      setEditDialogOpen(false);
      setReviewToEdit(null);
      toast.success("Review updated");
    } catch {
      toast.error("Failed to update review");
    } finally {
      setIsUpdating(false);
    }
  }, [editComment, editRating, reviewToEdit]);

  const handleDeleteOpen = useCallback((review: ReviewRecord) => {
    setReviewToDelete(review);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirmed = useCallback(async () => {
    if (!reviewToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/reviews/${reviewToDelete.id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!result.success) {
        toast.error(result.error || "Failed to delete review");
        return;
      }

      setReviews((prev) => prev.filter((row) => row.id !== reviewToDelete.id));
      setDeleteDialogOpen(false);
      setReviewToDelete(null);
      toast.success("Review deleted");
    } catch {
      toast.error("Failed to delete review");
    } finally {
      setIsDeleting(false);
    }
  }, [reviewToDelete]);

  const columns = useMemo(
    () =>
      getReviewsColumns({
        onEdit: handleEditOpen,
        onDelete: handleDeleteOpen,
      }),
    [handleDeleteOpen, handleEditOpen],
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
        <h1 className="text-2xl font-bold">Reviews Management</h1>
        <p className="text-muted-foreground">Moderate chef reviews and update ratings/comments</p>
      </div>

      <div className="px-4 lg:px-6">
        <UsersDataTable
          columns={columns as any}
          data={reviews}
          searchPlaceholder="Search by customer or chef..."
          searchColumn="customer.name"
          filterColumn="rating"
          filterOptions={[
            { label: "5 stars", value: "5" },
            { label: "4 stars", value: "4" },
            { label: "3 stars", value: "3" },
            { label: "2 stars", value: "2" },
            { label: "1 star", value: "1" },
          ]}
        />
      </div>

      {reviewToEdit ? (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Review</DialogTitle>
              <DialogDescription>
                Update rating and comment for review by <strong>{reviewToEdit.customer.name}</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Rating</Label>
                <StarRatingInput value={editRating} onChange={setEditRating} />
              </div>
              <div className="space-y-2">
                <Label>Comment</Label>
                <Textarea
                  rows={5}
                  maxLength={2000}
                  value={editComment}
                  onChange={(event) => setEditComment(event.target.value)}
                  placeholder="No comment"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isUpdating}>
                Cancel
              </Button>
              <Button onClick={handleUpdateReview} disabled={isUpdating}>
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}

      {reviewToDelete ? (
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Review</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this review from <strong>{reviewToDelete.customer.name}</strong>?
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
