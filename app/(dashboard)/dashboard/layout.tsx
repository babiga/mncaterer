import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { getCurrentUserWithProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { LanguageProvider } from "@/components/language-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserWithProfile();

  if (!user) {
    const cookieStore = await cookies();
    const lastLocale = cookieStore.get("lastLocale")?.value;
    const locale = lastLocale && ["en", "mn"].includes(lastLocale) ? lastLocale : "en";
    redirect(`/${locale}/login`);
  }

  return (
    <LanguageProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="floating" user={user} />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
    </LanguageProvider>
  );
}
