"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Clock,
  Users,
  MapPin,
  ChefHat,
  Receipt,
  Utensils,
  CreditCard,
  MessageSquare,
  FileSignature,
  ArrowLeft,
  Crown,
  Info,
  Phone,
  Mail,
  User,
  Activity,
  CheckCircle2,
  XCircle,
  Building2,
  Coins
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

type BookingStatus = "PENDING" | "CONFIRMED" | "DEPOSIT_PAID" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

type BookingDetail = {
  id: string;
  bookingNumber: string;
  serviceType: "CORPORATE" | "PRIVATE" | "WEDDING" | "VIP" | "OTHER";
  status: BookingStatus;
  eventDate: string;
  eventTime: string;
  guestCount: number;
  venue: string;
  venueAddress: string | null;
  specialRequests: string | null;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    userType: "INDIVIDUAL" | "CORPORATE";
  };
  serviceTier: {
    id: string;
    name: string;
    pricePerGuest: number;
    isVIP: boolean;
  };
  menu: {
    id: string;
    name: string;
    description: string | null;
  } | null;
  chefProfile: {
    id: string;
    specialty: string;
    dashboardUser: {
      id: string;
      name: string;
      email: string;
      phone: string | null;
    };
  } | null;
  contract: {
    id: string;
    status: "DRAFT" | "SENT" | "SIGNED" | "COMPLETED" | "CANCELLED";
    signatureUrl: string | null;
    signedAt: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  payments: Array<{
    id: string;
    amount: number;
    method: "QPAY" | "BANK_TRANSFER";
    status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "REFUNDED";
    transactionId: string | null;
    paidAt: string | null;
    createdAt: string;
    updatedAt: string;
    invoice: {
      id: string;
      invoiceNumber: string;
      subtotal: number;
      tax: number;
      total: number;
      issuedAt: string;
      paidAt: string | null;
      dueDate: string | null;
    } | null;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    title: string | null;
    comment: string | null;
    createdAt: string;
    customer: {
      id: string;
      name: string;
      email: string;
    };
  }>;
};

const statusClasses: Record<BookingStatus, string> = {
  PENDING: "border-amber-500/30 text-amber-500 bg-amber-500/10",
  CONFIRMED: "border-blue-500/30 text-blue-400 bg-blue-500/10",
  DEPOSIT_PAID: "border-cyan-500/30 text-cyan-400 bg-cyan-500/10",
  IN_PROGRESS: "border-indigo-500/30 text-indigo-400 bg-indigo-500/10",
  COMPLETED: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
  CANCELLED: "border-rose-500/30 text-rose-400 bg-rose-500/10",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 100, damping: 15 },
  },
};

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "MNT",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function SectionCard({ children, title, icon: Icon, className = "" }: any) {
  return (
    <motion.div variants={itemVariants} className={`rounded-2xl border border-primary/20 bg-card/60 p-6 backdrop-blur-xl shadow-lg shadow-black/20 ${className}`}>
      {title && (
        <div className="flex items-center gap-3 mb-6">
          {Icon && (
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
        </div>
      )}
      {children}
    </motion.div>
  );
}

function InfoBlock({ icon: Icon, label, value, subValue, highlight = false }: any) {
  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 ${highlight ? 'border-primary/40 bg-primary/5 hover:border-primary/60' : 'border-border/50 bg-background/50 hover:border-border hover:bg-background/80'}`}>
      <div className={`rounded-lg p-3 ${highlight ? 'bg-primary/20 text-primary shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'bg-muted text-muted-foreground'}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
        <p className="font-medium text-foreground">{value}</p>
        {subValue && <p className="text-sm text-muted-foreground mt-0.5">{subValue}</p>}
      </div>
    </div>
  );
}

export default function BookingDetailPage() {
  const params = useParams<{ id: string }>();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus>("PENDING");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const bookingId = params.id;

  const fetchBooking = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/dashboard-bookings/${bookingId}`);
      const result = await response.json();
      if (!result.success) {
        toast.error(result.error || "Failed to load booking details");
        return;
      }

      setBooking(result.data);
      setSelectedStatus(result.data.status);
    } catch {
      toast.error("Failed to load booking details");
    } finally {
      setIsLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const statusOptions = useMemo(
    () => ["PENDING", "CONFIRMED", "DEPOSIT_PAID", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const,
    [],
  );

  const handleSaveStatus = useCallback(async () => {
    if (!booking) return;
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/dashboard-bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedStatus }),
      });
      const result = await response.json();
      if (!result.success) {
        toast.error(result.error || "Failed to update booking status");
        return;
      }

      setBooking((prev) => (prev ? { ...prev, ...result.data } : prev));
      toast.success("Booking status updated successfully");
    } catch {
      toast.error("Failed to update booking status");
    } finally {
      setIsUpdating(false);
    }
  }, [booking, selectedStatus]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 px-4 py-8 max-w-7xl mx-auto w-full">
        <Skeleton className="h-12 w-64 rounded-xl bg-primary/10" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-[400px] w-full rounded-2xl bg-primary/5 lg:col-span-2" />
          <Skeleton className="h-[400px] w-full rounded-2xl bg-primary/5" />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <XCircle className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-2xl font-bold mb-2">Booking Not Found</h2>
        <p className="text-muted-foreground mb-6 max-w-md">The requested booking detail could not be loaded or doesn't exist.</p>
        <Button asChild variant="outline" className="gap-2 rounded-full px-6">
          <a href="/dashboard/bookings"><ArrowLeft className="w-4 h-4" /> Return to Bookings</a>
        </Button>
      </div>
    );
  }

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
      className="flex flex-col gap-6 py-8 px-4 md:px-8 max-w-[1400px] mx-auto w-full"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/50">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
              <a href="/dashboard/bookings"><ArrowLeft className="w-5 h-5" /></a>
            </Button>
            <Badge variant="outline" className={`px-3 py-1 text-xs font-semibold tracking-wider ${statusClasses[booking.status]} border rounded-full`}>
              {booking.status.replaceAll("_", " ")}
            </Badge>
            <Badge variant="secondary" className="px-3 py-1 text-xs font-medium tracking-wider uppercase bg-primary/10 text-primary border-transparent rounded-full">
              {booking.serviceType}
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mt-2 text-foreground">
            Booking <span className="text-primary/80">#{booking.bookingNumber}</span>
          </h1>
          <p className="text-muted-foreground flex items-center gap-2 text-sm mt-2">
            <Clock className="w-4 h-4" /> Created on {format(new Date(booking.createdAt), "MMMM d, yyyy 'at' HH:mm")}
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-full px-6 border-primary/20 hover:bg-primary/10 hover:border-primary/50 transition-colors">
            <Receipt className="w-4 h-4 mr-2" /> View Invoice
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Main Event Details */}
        <div className="space-y-6 lg:col-span-8">
          <SectionCard title="Event Configuration" icon={Crown}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoBlock 
                highlight 
                icon={CalendarDays} 
                label="Date & Time" 
                value={format(new Date(booking.eventDate), "EEEE, MMMM do, yyyy")} 
                subValue={`at ${booking.eventTime}`} 
              />
              <InfoBlock 
                icon={Users} 
                label="Guest Count" 
                value={`${booking.guestCount} Guests`} 
                subValue={`${formatAmount(booking.serviceTier.pricePerGuest)} per person`} 
              />
              <InfoBlock 
                icon={MapPin} 
                label="Venue" 
                value={booking.venue} 
                subValue={booking.venueAddress || "Address not provided"} 
              />
              <InfoBlock 
                icon={Building2} 
                label="Service Tier" 
                value={booking.serviceTier.name} 
                subValue={booking.serviceTier.isVIP ? "VIP Experience" : "Standard Experience"} 
              />
              <InfoBlock 
                icon={ChefHat} 
                label="Assigned Chef" 
                value={booking.chefProfile?.dashboardUser.name || "Pending Assignment"} 
                subValue={booking.chefProfile?.specialty || "General"} 
              />
              <InfoBlock 
                icon={Utensils} 
                label="Selected Menu" 
                value={booking.menu?.name || "TBD"} 
                subValue={booking.menu?.description || "Menu details pending"} 
              />
            </div>

            {booking.specialRequests && (
              <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center gap-2 mb-2 text-amber-500">
                  <Info className="w-4 h-4" />
                  <h3 className="font-semibold text-sm uppercase tracking-wider">Special Requests</h3>
                </div>
                <p className="text-foreground/90 italic leading-relaxed text-sm">"{booking.specialRequests}"</p>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Payment History" icon={CreditCard}>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/20 backdrop-blur-sm">
                <div>
                  <p className="text-sm font-medium text-primary uppercase tracking-wider mb-1">Total Contract Value</p>
                  <p className="text-3xl font-bold text-foreground">{formatAmount(booking.totalPrice)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Coins className="w-6 h-6" />
                </div>
              </div>

              {booking.payments.length === 0 ? (
                <div className="text-center py-8 rounded-xl border border-dashed border-border/50">
                  <p className="text-muted-foreground">No payments recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {booking.payments.map((payment) => (
                    <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border/50 bg-background/50 p-4 transition-colors hover:bg-muted/50">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-bold text-lg">{formatAmount(payment.amount)}</p>
                          <Badge variant="outline" className="uppercase text-[10px] tracking-wider">{payment.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <CreditCard className="w-3.5 h-3.5" />
                          {payment.method.replace('_', ' ')}
                          {payment.invoice && ` • Invoice #${payment.invoice.invoiceNumber}`}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground text-left sm:text-right">
                        <p>Initiated: {format(new Date(payment.createdAt), "MMM d, yyyy")}</p>
                        {payment.paidAt && <p className="text-foreground font-medium mt-0.5">Paid: {format(new Date(payment.paidAt), "MMM d")}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SectionCard>

          {booking.reviews.length > 0 && (
            <SectionCard title="Client Feedback" icon={MessageSquare}>
              <div className="grid gap-4">
                {booking.reviews.map((review) => (
                  <div key={review.id} className="rounded-xl border border-border/50 bg-background/50 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {review.customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold">{review.customer.name}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(review.createdAt), "MMMM d, yyyy")}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-primary/20 text-primary border-none">
                        {review.rating}.0 / 5.0
                      </Badge>
                    </div>
                    {review.title && <h4 className="font-medium text-foreground mb-1">{review.title}</h4>}
                    {review.comment && <p className="text-muted-foreground text-sm italic">"{review.comment}"</p>}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6 lg:col-span-4">
          <SectionCard title="Lifecycle Management" icon={Activity} className="border-primary/40 shadow-[0_0_30px_rgba(234,179,8,0.05)]">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Current Status</Label>
                <Select value={selectedStatus} onValueChange={(value: BookingStatus) => setSelectedStatus(value)}>
                  <SelectTrigger className="h-12 bg-background/50 border-primary/30 focus:ring-primary">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status} className="py-3">
                        <span className="font-medium">{status.replaceAll("_", " ")}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleSaveStatus} 
                disabled={isUpdating || selectedStatus === booking.status} 
                className="w-full h-12 text-base font-semibold transition-all hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] shadow-md"
              >
                {isUpdating ? "Processing..." : "Update Status"}
              </Button>
            </div>
          </SectionCard>

          <SectionCard title="Client Profile" icon={User}>
            <div className="space-y-5 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <User className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="font-bold text-base text-foreground">{booking.customer.name}</p>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">{booking.customer.userType}</p>
                </div>
              </div>
              <Separator className="bg-border/50" />
              <div className="space-y-3">
                <div className="flex items-center gap-3 group">
                  <Mail className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <a href={`mailto:${booking.customer.email}`} className="hover:text-primary hover:underline transition-colors">{booking.customer.email}</a>
                </div>
                {booking.customer.phone && (
                  <div className="flex items-center gap-3 group">
                    <Phone className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <a href={`tel:${booking.customer.phone}`} className="hover:text-primary hover:underline transition-colors">{booking.customer.phone}</a>
                  </div>
                )}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Legal & Contract" icon={FileSignature}>
            {booking.contract ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center rounded-lg bg-background/50 p-3 border border-border/50">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="outline" className="uppercase font-semibold tracking-wider text-[10px]">
                    {booking.contract.status}
                  </Badge>
                </div>
                <div className="flex justify-between items-center rounded-lg bg-background/50 p-3 border border-border/50">
                  <span className="text-sm text-muted-foreground">Executed On</span>
                  <span className="text-sm font-medium">
                    {booking.contract.signedAt ? format(new Date(booking.contract.signedAt), "MMM d, yyyy") : "Pending execution"}
                  </span>
                </div>
                {booking.contract.signatureUrl && (
                  <Button variant="outline" className="w-full mt-2 group border-primary/20 hover:border-primary/50">
                    <FileSignature className="w-4 h-4 mr-2 text-muted-foreground group-hover:text-primary transition-colors" />
                    Download Executed Copy
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <FileSignature className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground mb-4">No formal agreement has been generated for this booking.</p>
                <Button variant="outline" className="w-full">Generate Draft Contract</Button>
              </div>
            )}
          </SectionCard>

        </div>
      </div>
    </motion.div>
  );
}

