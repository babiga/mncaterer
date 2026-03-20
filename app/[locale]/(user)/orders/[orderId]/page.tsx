import { getCurrentCustomer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { PaymentButton } from "@/components/booking/PaymentButton";

const bookingStatusVariant: Record<string, string> = {
    PENDING: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    CONFIRMED: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    DEPOSIT_PAID: "bg-cyan-500/10 text-cyan-700 border-cyan-500/20",
    IN_PROGRESS: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20",
    COMPLETED: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    CANCELLED: "bg-rose-500/10 text-rose-700 border-rose-500/20",
};

function formatPrice(amount: number) {
    return amount.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
}

export default async function OrderDetailsPage({
    params,
}: {
    params: Promise<{ locale: string; orderId: string }>;
}) {
    const { locale, orderId } = await params;
    const t = await getTranslations("UserOrders");
    const user = await getCurrentCustomer();

    if (!user) {
        redirect(`/${locale}/login`);
    }

    const booking = await prisma.booking.findUnique({
        where: {
            id: orderId,
            customerId: user.id
        },
        include: {
            serviceTier: true,
            menu: true,
            chefProfile: {
                include: {
                    dashboardUser: true,
                },
            },
        },
    });

    if (!booking) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/orders"
                    className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {t("list.orderNumber", { bookingNumber: booking.bookingNumber })}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {format(new Date(booking.createdAt), "PPP")}
                    </p>
                </div>
                <div className="ml-auto flex items-center gap-3">
                    {booking.status === "PENDING" && (
                        <PaymentButton
                            bookingNumber={booking.bookingNumber}
                            amount={Number(booking.totalPrice)}
                        />
                    )}
                    <Badge variant="outline" className={bookingStatusVariant[booking.status]}>
                        {t(`statuses.${booking.status}`)}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{t("summary.serviceType")}</CardTitle>
                        <CardDescription>{t("summary.assignedPackage")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{t("form.fields.eventType")}</p>
                            <p>{t(`serviceTypes.${booking.serviceType}`)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{t("form.fields.serviceTier")}</p>
                            <p>{booking.serviceTier.name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{t("form.fields.guestCount")}</p>
                            <p>{t("summary.guests")} ({booking.guestCount})</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{t("list.menu")}</p>
                            <p>{booking.menu?.name || t("list.notSelected")}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{t("list.chef")}</p>
                            <p>{booking.chefProfile?.dashboardUser.name || t("form.none.chef")}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t("form.steps.eventDetails.title")}</CardTitle>
                        <CardDescription>{t("summary.eventDateTime")} & {t("summary.venue")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{t("form.fields.eventDate")}</p>
                            <p>{format(new Date(booking.eventDate), "PPP")}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{t("form.fields.eventTime")}</p>
                            <p>{booking.eventTime}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{t("form.fields.locationName")}</p>
                            <p>{booking.venue}</p>
                        </div>
                        {booking.venueAddress && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t("form.fields.addressOptional").replace(" (Optional)", "")}</p>
                                <p>{booking.venueAddress}</p>
                            </div>
                        )}
                        {booking.specialRequests && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t("form.fields.specialRequestsOptional").replace(" (Optional)", "")}</p>
                                <p className="whitespace-pre-wrap">{booking.specialRequests}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>{t("summary.total")}</CardTitle>
                        <CardDescription>{t("paymentDetails")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-muted-foreground">{t("pricePerGuest")}</span>
                            <span>{formatPrice(Number(booking.serviceTier.pricePerGuest))}₮</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-muted-foreground">{t("totalGuests")}</span>
                            <span>x {booking.guestCount}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 font-medium text-lg">
                            <span>{t("summary.total")}</span>
                            <span>{formatPrice(Number(booking.totalPrice))}₮</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
