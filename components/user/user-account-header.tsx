"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

export function UserAccountHeader() {
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
    <header className="border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-sm font-semibold tracking-wide">
            {t("brand")}
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/profile"
              className={`text-sm transition-colors ${
                pathname === "/profile"
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("nav.profile")}
            </Link>
          </nav>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? t("actions.loggingOut") : t("actions.logout")}
        </Button>
      </div>
    </header>
  );
}
