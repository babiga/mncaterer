import Navbar from "@/components/layout/Navbar";

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      {children}
    </div>
  );
}
