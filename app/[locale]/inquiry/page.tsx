"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type InquiryFormData = {
  type: "INDIVIDUAL" | "ORG";
  name: string;
  phone: string;
  email: string;
  serviceType: "CORPORATE" | "PRIVATE" | "WEDDING" | "VIP" | "OTHER";
  message: string;
};

const initialForm: InquiryFormData = {
  type: "INDIVIDUAL",
  name: "",
  phone: "",
  email: "",
  serviceType: "CORPORATE",
  message: "",
};

export default function InquiryPage() {
  const [formData, setFormData] = useState<InquiryFormData>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!result.success) {
        toast.error(result.error || "Failed to submit inquiry");
        return;
      }

      toast.success("Consultation inquiry sent successfully");
      setFormData(initialForm);
    } catch {
      toast.error("Failed to submit inquiry");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar trimmed />
      <main className="container mx-auto px-6 pb-20 pt-28">
        <div className="mx-auto max-w-3xl space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Consultation</p>
            <h1 className="mt-2 text-4xl font-semibold">Inquiry Request</h1>
            <p className="mt-3 text-muted-foreground">
              Tell us about your event and our team will contact you shortly.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Request Consultation</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={onSubmit}>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="inquiry-type">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: "INDIVIDUAL" | "ORG") =>
                        setFormData((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger id="inquiry-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                        <SelectItem value="ORG">Organization</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service-type">Service Type</Label>
                    <Select
                      value={formData.serviceType}
                      onValueChange={(
                        value: "CORPORATE" | "PRIVATE" | "WEDDING" | "VIP" | "OTHER",
                      ) => setFormData((prev) => ({ ...prev, serviceType: value }))}
                    >
                      <SelectTrigger id="service-type">
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CORPORATE">Corporate</SelectItem>
                        <SelectItem value="PRIVATE">Private</SelectItem>
                        <SelectItem value="WEDDING">Wedding</SelectItem>
                        <SelectItem value="VIP">VIP</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      required
                      value={formData.phone}
                      onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message (Optional)</Label>
                  <Textarea
                    id="message"
                    rows={5}
                    placeholder="Share any details about your event..."
                    value={formData.message}
                    onChange={(event) => setFormData((prev) => ({ ...prev, message: event.target.value }))}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Inquiry"}
                  </Button>
                  <Button asChild type="button" variant="outline">
                    <Link href="/">Back to Home</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
