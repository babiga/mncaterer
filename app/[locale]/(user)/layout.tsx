import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { UserAccountNav } from "@/components/user/user-account-nav";

export default async function UserLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getSession();

  if (!session) {
    redirect(`/${locale}/login`);
  }

  if (session.userType !== "customer") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar trimmed />
      <div className="pt-24">
        <div className="mx-auto flex w-full max-w-6xl flex-col md:flex-row md:gap-8 px-4 pb-8 sm:px-6">
          <UserAccountNav />
          <main className="w-full py-6 md:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
