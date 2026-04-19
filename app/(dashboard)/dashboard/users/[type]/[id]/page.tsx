"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { ArrowUpRight, CalendarDays, CircleDollarSign, ClipboardList, Clock3 } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { UserStatusBadge } from "@/components/users/user-status-badge";

type CustomerDetail = {
  id: string;
  email: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  address: string | null;
  userType: "INDIVIDUAL" | "CORPORATE";
  organizationName: string | null;
  companyLegalNo: string | null;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    bookings?: number;
    reviews?: number;
  };
  bookingInsights?: {
    totalOrders: number;
    totalSpent: number;
    completedOrders: number;
    cancelledOrders: number;
    upcomingOrders: number;
  };
  recentBookings?: CustomerRecentBooking[];
};

type CustomerRecentBooking = {
  id: string;
  bookingNumber: string;
  serviceType: "CORPORATE" | "PRIVATE" | "WEDDING" | "VIP" | "OTHER";
  status: "PENDING" | "CONFIRMED" | "DEPOSIT_PAID" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  eventDate: string;
  eventTime: string;
  guestCount: number;
  venue: string;
  totalPrice: number;
  depositAmount: number | null;
  createdAt: string;
  serviceTier: {
    id: string;
    name: string;
  };
  menu: {
    id: string;
    name: string;
  } | null;
  chefProfile: {
    id: string;
    dashboardUser: {
      id: string;
      name: string;
    };
  } | null;
};

type DashboardUserDetail = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  role: "ADMIN" | "CHEF" | "COMPANY";
  isVerified: boolean;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  chefProfile?: {
    id: string;
    specialty: string | null;
    bio: string | null;
    yearsExperience: number | null;
    rating: number | null;
    reviewCount: number | null;
    taxStatus: string | null;
  } | null;
  companyProfile?: {
    id: string;
    companyName: string | null;
    description: string | null;
    approvalStatus: string | null;
  } | null;
  _count?: {
    jobPostings?: number;
    jobInvitations?: number;
  };
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const bookingStatusClasses: Record<CustomerRecentBooking["status"], string> = {
  PENDING: "border-amber-500/30 text-amber-700",
  CONFIRMED: "border-blue-500/30 text-blue-700",
  DEPOSIT_PAID: "border-cyan-500/30 text-cyan-700",
  IN_PROGRESS: "border-indigo-500/30 text-indigo-700",
  COMPLETED: "border-emerald-500/30 text-emerald-700",
  CANCELLED: "border-rose-500/30 text-rose-700",
};

function formatAmount(amount: number) {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export default function UserDetailPage() {
  const params = useParams<{ type: string; id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [dashboardUser, setDashboardUser] = useState<DashboardUserDetail | null>(null);

  const userType = params.type;
  const userId = params.id;
  const isCustomer = userType === "customer";
  const isDashboardUser = userType === "dashboard";

  const detailLabel = useMemo(() => {
    if (isCustomer) return "Customer";
    if (isDashboardUser) return "Dashboard User";
    return "User";
  }, [isCustomer, isDashboardUser]);

  const fetchDetail = useCallback(async () => {
    if (!userId || (!isCustomer && !isDashboardUser)) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = isCustomer ? `/api/users/${userId}` : `/api/dashboard-users/${userId}`;
      const response = await fetch(endpoint);
      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || "Failed to load user detail");
        return;
      }

      if (isCustomer) {
        setCustomer(result.data);
      } else {
        setDashboardUser(result.data);
      }
    } catch {
      toast.error("Failed to load user detail");
    } finally {
      setIsLoading(false);
    }
  }, [userId, isCustomer, isDashboardUser]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  if (!isCustomer && !isDashboardUser) {
    return (
      <div className="px-4 py-6 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Invalid User Type</CardTitle>
            <CardDescription>The requested user type is not supported.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <a href="/dashboard/users">Back to users</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeUser = isCustomer ? customer : dashboardUser;

  if (!activeUser) {
    return (
      <div className="px-4 py-6 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>{detailLabel} Not Found</CardTitle>
            <CardDescription>The requested user could not be loaded.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <a href="/dashboard/users">Back to users</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials = getInitials(activeUser.name);

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex items-start justify-between gap-4 px-4 lg:px-6">
        <div>
          <p className="text-xs text-muted-foreground">{detailLabel} ID: {activeUser.id}</p>
          <h1 className="text-2xl font-bold">{detailLabel} Detail</h1>
          <p className="text-muted-foreground">
            Joined {formatDistanceToNow(new Date(activeUser.createdAt), { addSuffix: true })}
          </p>
        </div>
        <Button asChild variant="outline">
          <a href="/dashboard/users">Back to list</a>
        </Button>
      </div>

      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={activeUser.avatar || undefined} />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-semibold">{activeUser.name}</p>
                <p className="text-sm text-muted-foreground">{activeUser.email}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {isCustomer && customer ? (
                    <UserStatusBadge type="userType" value={customer.userType} />
                  ) : null}
                  {isDashboardUser && dashboardUser ? (
                    <>
                      <UserStatusBadge type="role" value={dashboardUser.role} />
                      <UserStatusBadge type="active" value={dashboardUser.isActive} />
                      <UserStatusBadge type="verified" value={dashboardUser.isVerified} />
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            <Separator />

            {isCustomer && customer ? (
              <div className="space-y-6 text-sm">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-muted-foreground">First Name</p>
                    <p>{customer.firstName || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Name</p>
                    <p>{customer.lastName || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p>{customer.phone || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Address</p>
                    <p>{customer.address || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Bookings</p>
                    <p>{customer._count?.bookings ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Reviews</p>
                    <p>{customer._count?.reviews ?? 0}</p>
                  </div>
                  {customer.userType === "CORPORATE" ? (
                    <>
                      <div>
                        <p className="text-muted-foreground">Organization</p>
                        <p>{customer.organizationName || "-"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Company Legal No</p>
                        <p>{customer.companyLegalNo || "-"}</p>
                      </div>
                    </>
                  ) : null}
                </div>

                <Separator />

                <div>
                  <p className="mb-3 text-base font-semibold">Order Insights</p>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
                    <div className="rounded-lg border bg-muted/20 p-3">
                      <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <ClipboardList className="h-3.5 w-3.5" />
                        <span>Total Orders</span>
                      </div>
                      <p className="text-lg font-semibold">{customer.bookingInsights?.totalOrders ?? 0}</p>
                    </div>
                    <div className="rounded-lg border bg-muted/20 p-3">
                      <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CircleDollarSign className="h-3.5 w-3.5" />
                        <span>Total Spent</span>
                      </div>
                      <p className="text-lg font-semibold">
                        {formatAmount(customer.bookingInsights?.totalSpent ?? 0)}₮
                      </p>
                    </div>
                    <div className="rounded-lg border bg-muted/20 p-3">
                      <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span>Upcoming</span>
                      </div>
                      <p className="text-lg font-semibold">{customer.bookingInsights?.upcomingOrders ?? 0}</p>
                    </div>
                    <div className="rounded-lg border bg-muted/20 p-3">
                      <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock3 className="h-3.5 w-3.5" />
                        <span>Completed</span>
                      </div>
                      <p className="text-lg font-semibold">{customer.bookingInsights?.completedOrders ?? 0}</p>
                    </div>
                    <div className="rounded-lg border bg-muted/20 p-3">
                      <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock3 className="h-3.5 w-3.5" />
                        <span>Cancelled</span>
                      </div>
                      <p className="text-lg font-semibold">{customer.bookingInsights?.cancelledOrders ?? 0}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-base font-semibold">Recent Orders</p>
                    <p className="text-xs text-muted-foreground">
                      Latest {customer.recentBookings?.length ?? 0} bookings
                    </p>
                  </div>
                  {!customer.recentBookings || customer.recentBookings.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                      No bookings found for this customer.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {customer.recentBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="rounded-lg border p-3 transition-colors hover:bg-muted/30 md:p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                Order #{booking.bookingNumber}
                              </p>
                              <div className="mt-1 flex items-center gap-2">
                                <p className="font-medium">{booking.serviceTier.name}</p>
                                <Badge variant="outline" className={bookingStatusClasses[booking.status]}>
                                  {booking.status.replaceAll("_", " ")}
                                </Badge>
                              </div>
                            </div>
                            <a
                              href={`/dashboard/bookings/${booking.id}`}
                              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                            >
                              View booking
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </a>
                          </div>

                          <div className="mt-3 grid grid-cols-1 gap-3 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                              <p>Event</p>
                              <p className="text-sm text-foreground">
                                {format(new Date(booking.eventDate), "MMM d, yyyy")} at {booking.eventTime}
                              </p>
                            </div>
                            <div>
                              <p>Guests & Venue</p>
                              <p className="text-sm text-foreground">
                                {booking.guestCount} guests, {booking.venue}
                              </p>
                            </div>
                            <div>
                              <p>Chef</p>
                              <p className="text-sm text-foreground">
                                {booking.chefProfile?.dashboardUser.name || "No preference"}
                              </p>
                            </div>
                            <div>
                              <p>Total</p>
                              <p className="text-sm font-medium text-foreground">
                                {formatAmount(booking.totalPrice)}₮
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {isDashboardUser && dashboardUser ? (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p>{dashboardUser.phone || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Login</p>
                    <p>
                      {dashboardUser.lastLoginAt
                        ? formatDistanceToNow(new Date(dashboardUser.lastLoginAt), {
                            addSuffix: true,
                          })
                        : "Never"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Job Postings</p>
                    <p>{dashboardUser._count?.jobPostings ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Job Invitations</p>
                    <p>{dashboardUser._count?.jobInvitations ?? 0}</p>
                  </div>
                </div>

                {dashboardUser.chefProfile ? (
                  <>
                    <Separator />
                    <div>
                      <p className="mb-2 font-medium">Chef Profile</p>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-muted-foreground">Specialty</p>
                          <p>{dashboardUser.chefProfile.specialty || "-"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Years Experience</p>
                          <p>{dashboardUser.chefProfile.yearsExperience ?? 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Rating</p>
                          <p>{dashboardUser.chefProfile.rating ?? 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Review Count</p>
                          <p>{dashboardUser.chefProfile.reviewCount ?? 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Tax Status</p>
                          <p>{dashboardUser.chefProfile.taxStatus || "-"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Bio</p>
                          <p>{dashboardUser.chefProfile.bio || "-"}</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}

                {dashboardUser.companyProfile ? (
                  <>
                    <Separator />
                    <div>
                      <p className="mb-2 font-medium">Company Profile</p>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-muted-foreground">Company Name</p>
                          <p>{dashboardUser.companyProfile.companyName || "-"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Approval Status</p>
                          <Badge variant="outline">
                            {dashboardUser.companyProfile.approvalStatus || "-"}
                          </Badge>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-muted-foreground">Description</p>
                          <p>{dashboardUser.companyProfile.description || "-"}</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
