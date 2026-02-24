import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserAccountHeader } from "@/components/user/user-account-header";

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
      <UserAccountHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
