"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Star, Edit2, Trash2, ChefHat, Calendar, MessageSquare, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export type UserReviewItem = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  chefProfile: {
    id: string;
    dashboardUser: {
      name: string;
    };
  };
  booking: {
    id: string;
    bookingNumber: string;
    eventDate: string;
  };
};

type UserFeedbacksListProps = {
  initialReviews: UserReviewItem[];
};

function ReviewStars({ value, interactive, onSelect }: { value: number; interactive?: boolean; onSelect?: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((index) => {
        const filled = index <= value;
        if (!interactive) {
          return (
            <Star
              key={index}
              className={`h-4 w-4 ${filled ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
            />
          );
        }

        return (
          <button
            key={index}
            type="button"
            onClick={() => onSelect?.(index)}
            className="rounded-sm p-0.5"
            aria-label={`Rate ${index}`}
          >
            <Star
              className={`h-5 w-5 transition-colors ${filled ? "fill-primary text-primary" : "text-muted-foreground/30 hover:text-muted-foreground/60"}`}
            />
          </button>
        );
      })}
    </div>
  );
}

export function UserFeedbacksList({ initialReviews }: UserFeedbacksListProps) {
  const t = useTranslations("UserFeedbacks");
  const commonT = useTranslations("Chefs");
  const [reviews, setReviews] = useState<UserReviewItem[]>(initialReviews);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function startEditing(review: UserReviewItem) {
    setEditingId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment ?? "");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditRating(5);
    setEditComment("");
  }

  async function saveEdit() {
    if (!editingId) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/reviews/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: editRating,
          comment: editComment.trim() || null,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        toast.error(result.error || t("messages.updateError"));
        return;
      }

      setReviews((prev) =>
        prev.map((item) => (item.id === editingId ? { ...item, rating: editRating, comment: editComment.trim() || null } : item))
      );
      cancelEditing();
      toast.success(t("messages.updateSuccess"));
    } catch {
      toast.error(t("messages.updateError"));
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteReview(reviewId: string) {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        toast.error(result.error || t("messages.deleteError"));
        return;
      }

      setReviews((prev) => prev.filter((item) => item.id !== reviewId));
      toast.success(t("messages.deleteSuccess"));
    } catch {
      toast.error(t("messages.deleteError"));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {reviews.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground">{t("list.empty")}</p>
          </CardContent>
        </Card>
      ) : (
        reviews.map((review) => (
          <Card key={review.id} className="overflow-hidden border bg-background hover:shadow-sm transition-all duration-300">
            <div className="flex flex-col md:flex-row">
              {/* Sidebar Info */}
              <div className="md:w-64 bg-muted/30 p-5 border-b md:border-b-0 md:border-r space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1.5">
                    <ChefHat className="w-3 h-3" />
                    {t("list.chef")}
                  </p>
                  <p className="text-sm font-medium">{review.chefProfile.dashboardUser.name}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {t("list.booking")}
                  </p>
                  <p className="text-xs font-medium">{t("list.bookingNumber", { number: review.booking.bookingNumber })}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {format(new Date(review.booking.eventDate), "MMM d, yyyy")}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                    {t("list.date")}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {format(new Date(review.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-6">
                {editingId === review.id ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                       <p className="text-sm font-medium">{commonT("yourRatingLabel")}</p>
                       <ReviewStars value={editRating} interactive onSelect={setEditRating} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">{commonT("yourCommentLabel")}</p>
                      <Textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        placeholder={commonT("reviewCommentPlaceholder")}
                        rows={4}
                        className="resize-none"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button onClick={saveEdit} disabled={isSaving} size="sm">
                        {isSaving ? t("actions.saving") : t("actions.save")}
                      </Button>
                      <Button variant="outline" onClick={cancelEditing} disabled={isSaving} size="sm">
                        {t("actions.cancel")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 h-full flex flex-col">
                    <div className="flex items-center justify-between">
                      <ReviewStars value={review.rating} />
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                          onClick={() => startEditing(review)}
                          disabled={isDeleting}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t("actions.confirmDeleteTitle")}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t("actions.confirmDeleteDescription") || "This action cannot be undone."}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t("actions.cancel")}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteReview(review.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {isDeleting ? t("actions.deleting") : t("actions.delete")}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    <div className="flex-1">
                      {review.comment ? (
                        <p className="text-sm text-foreground/90 leading-relaxed italic">
                          "{review.comment}"
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          (No comment provided)
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
