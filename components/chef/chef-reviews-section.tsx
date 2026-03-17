"use client";

import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type ChefReviewItem = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    avatar: string | null;
  } | null;
};

type ChefReviewsSectionProps = {
  chefId: string | null;
  initialReviews: ChefReviewItem[];
  initialAverageRating: number;
  initialReviewCount: number;
  isCustomerLoggedIn: boolean;
  currentCustomerId: string | null;
  canReview: boolean;
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
              className={`h-4 w-4 ${filled ? "fill-primary text-primary" : "text-white/30"}`}
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
              className={`h-5 w-5 transition-colors ${filled ? "fill-primary text-primary" : "text-white/30 hover:text-white/60"}`}
            />
          </button>
        );
      })}
    </div>
  );
}

export function ChefReviewsSection({
  chefId,
  initialReviews,
  initialAverageRating,
  initialReviewCount,
  isCustomerLoggedIn,
  currentCustomerId,
  canReview,
}: ChefReviewsSectionProps) {
  const t = useTranslations("Chefs");
  const [reviews, setReviews] = useState<ChefReviewItem[]>(initialReviews);
  const [averageRating, setAverageRating] = useState(initialAverageRating);
  const [reviewCount, setReviewCount] = useState(initialReviewCount);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [isMutatingReview, setIsMutatingReview] = useState(false);

  const displayedAverage = useMemo(
    () => (reviewCount > 0 ? averageRating : 0),
    [averageRating, reviewCount],
  );

  async function submitReview() {
    if (!chefId || !canReview) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/chefs/${chefId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || null,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        toast.error(result.error || t("reviewSubmitError"));
        return;
      }

      const newReview = result.data?.review as ChefReviewItem | undefined;
      if (newReview) {
        setReviews((prev) => [newReview, ...prev]);
      }

      setAverageRating(result.data?.averageRating ?? averageRating);
      setReviewCount(result.data?.totalReviews ?? reviewCount);
      setComment("");
      setRating(5);
      toast.success(t("reviewSubmitSuccess"));
    } catch {
      toast.error(t("reviewSubmitError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  function startEditing(review: ChefReviewItem) {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment ?? "");
  }

  function cancelEditing() {
    setEditingReviewId(null);
    setEditRating(5);
    setEditComment("");
  }

  async function saveEditedReview() {
    if (!chefId || !editingReviewId) return;
    setIsMutatingReview(true);
    try {
      const response = await fetch(`/api/chefs/${chefId}/reviews`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId: editingReviewId,
          rating: editRating,
          comment: editComment.trim() || null,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        toast.error(result.error || t("reviewUpdateError"));
        return;
      }

      const updated = result.data?.review as ChefReviewItem | undefined;
      if (updated) {
        setReviews((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      }
      setAverageRating(result.data?.averageRating ?? averageRating);
      setReviewCount(result.data?.totalReviews ?? reviewCount);
      cancelEditing();
      toast.success(t("reviewUpdateSuccess"));
    } catch {
      toast.error(t("reviewUpdateError"));
    } finally {
      setIsMutatingReview(false);
    }
  }

  async function deleteReview(reviewId: string) {
    if (!chefId) return;
    setIsMutatingReview(true);
    try {
      const response = await fetch(`/api/chefs/${chefId}/reviews?reviewId=${encodeURIComponent(reviewId)}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        toast.error(result.error || t("reviewDeleteError"));
        return;
      }

      setReviews((prev) => prev.filter((item) => item.id !== reviewId));
      setAverageRating(result.data?.averageRating ?? averageRating);
      setReviewCount(result.data?.totalReviews ?? Math.max(0, reviewCount - 1));
      setEditingReviewId((prev) => (prev === reviewId ? null : prev));
      toast.success(t("reviewDeleteSuccess"));
    } catch {
      toast.error(t("reviewDeleteError"));
    } finally {
      setIsMutatingReview(false);
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-card/80 p-6 md:p-8 text-white space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl">{t("reviewsSectionTitle")}</h2>
        <div className="flex items-center gap-3">
          <ReviewStars value={Math.round(displayedAverage)} />
          <span className="text-sm text-white/80">
            {displayedAverage.toFixed(1)} ({reviewCount} {t("reviews")})
          </span>
        </div>
      </div>

      {!isCustomerLoggedIn ? (
        <p className="text-sm text-white/70">
          {t("loginToReview")}{" "}
          <Link href="/login" className="text-primary hover:text-white underline">
            {t("loginAction")}
          </Link>
        </p>
      ) : canReview ? (
        <div className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="space-y-2">
            <p className="text-sm text-white/80">{t("yourRatingLabel")}</p>
            <ReviewStars value={rating} interactive onSelect={setRating} />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-white/80">{t("yourCommentLabel")}</p>
            <Textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              maxLength={2000}
              rows={4}
              placeholder={t("reviewCommentPlaceholder")}
              className="bg-black/20 border-white/10"
            />
          </div>
          <Button type="button" onClick={submitReview} disabled={isSubmitting}>
            {isSubmitting ? t("reviewSubmitting") : t("reviewSubmit")}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-white/70">{t("reviewEligibilityHint")}</p>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-sm text-white/70">{t("noReviewsYet")}</p>
        ) : (
          reviews.map((review) => (
            <article key={review.id} className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-white/5">
                    <AvatarImage src={review.customer?.avatar || undefined} />
                    <AvatarFallback className="text-xs bg-white/5">
                      {review.customer?.name ? review.customer.name.charAt(0).toUpperCase() : "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{review.customer?.name ?? "Anonymous"}</p>
                    <p className="text-xs text-white/60">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <ReviewStars value={review.rating} />
              </div>
              {editingReviewId === review.id ? (
                <div className="space-y-3">
                  <ReviewStars value={editRating} interactive onSelect={setEditRating} />
                  <Textarea
                    value={editComment}
                    onChange={(event) => setEditComment(event.target.value)}
                    maxLength={2000}
                    rows={3}
                    className="bg-black/20 border-white/10"
                  />
                  <div className="flex items-center gap-2">
                    <Button type="button" size="sm" onClick={saveEditedReview} disabled={isMutatingReview}>
                      {t("saveReview")}
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={cancelEditing} disabled={isMutatingReview}>
                      {t("cancelReviewEdit")}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {review.comment ? <p className="text-sm text-white/80">{review.comment}</p> : null}
                  {currentCustomerId && review.customer?.id === currentCustomerId ? (
                    <div className="flex items-center gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => startEditing(review)} disabled={isMutatingReview}>
                        {t("editReview")}
                      </Button>
                      <Button type="button" size="sm" variant="destructive" onClick={() => deleteReview(review.id)} disabled={isMutatingReview}>
                        {t("deleteReview")}
                      </Button>
                    </div>
                  ) : null}
                </>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
