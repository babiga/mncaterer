"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  key: "profile" | "orders" | "feedbacks";
  href?: string;
};

const navItems: NavItem[] = [
  { key: "profile", href: "/profile" },
  { key: "orders" },
  { key: "feedbacks" },
];

export function UserAccountNav() {
  const t = useTranslations("UserArea");
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function onLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <>
      <div className="md:hidden border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <nav className="mx-auto w-full max-w-6xl overflow-x-auto px-4 py-3 sm:px-6">
          <div className="flex min-w-max items-center gap-2">
            {navItems.map((item) => {
              const isActive = item.href ? pathname === item.href : false;

              if (!item.href) {
                return (
                  <span
                    key={item.key}
                    className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground"
                  >
                    {t(`nav.${item.key}`)}
                  </span>
                );
              }

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-sm transition-colors",
                    isActive
                      ? "border-foreground text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t(`nav.${item.key}`)}
                </Link>
              );
            })}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onLogout}
              disabled={isLoggingOut}
              className="ml-2"
            >
              {isLoggingOut ? t("actions.loggingOut") : t("actions.logout")}
            </Button>
          </div>
        </nav>
      </div>

      <aside className="hidden md:block md:w-64 md:shrink-0">
        <div className="sticky top-28 rounded-xl border bg-background p-3">
          <div className="px-2 pb-2 text-xs font-semibold tracking-wide text-muted-foreground">
            {t("brand")}
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = item.href ? pathname === item.href : false;

              if (!item.href) {
                return (
                  <div
                    key={item.key}
                    className="rounded-md px-3 py-2 text-sm text-muted-foreground"
                  >
                    {t(`nav.${item.key}`)}
                  </div>
                );
              }

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-muted text-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  {t(`nav.${item.key}`)}
                </Link>
              );
            })}
          </nav>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onLogout}
            disabled={isLoggingOut}
            className="mt-4 w-full justify-start"
          >
            {isLoggingOut ? t("actions.loggingOut") : t("actions.logout")}
          </Button>
        </div>
      </aside>
    </>
  );
}
