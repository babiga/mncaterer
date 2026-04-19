"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type BookingRow = {
  id: string;
  bookingNumber: string;
  serviceType: string;
  status: string;
  totalPrice: number;
  eventDate: string;
  customer: {
    id: string;
    name: string;
  };
};

function formatAmount(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function DashboardRecentBookings() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const response = await fetch("/api/dashboard-bookings?limit=8&sortOrder=desc", {
          cache: "no-store",
        });
        if (!response.ok) return;

        const payload = await response.json();
        if (!payload?.success || !Array.isArray(payload?.data)) return;
        setBookings(payload.data as BookingRow[]);
      } catch {
        // Keep empty state when request fails.
      }
    };

    loadBookings();
  }, []);

  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>Latest 8 bookings from live data</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Event Date</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No booking data available.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <Link href={`/dashboard/bookings/${booking.id}`} className="hover:underline">
                        {booking.bookingNumber.slice(0, 8)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/dashboard/users/customer/${booking.customer.id}`}
                        className="hover:underline"
                      >
                        {booking.customer.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{booking.status}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(booking.eventDate)}</TableCell>
                    <TableCell>{formatAmount(booking.totalPrice)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
