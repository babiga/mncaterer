"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useRouter as useBaseRouter } from "next/navigation";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BoringAvatar from "boring-avatars";

const AVATAR_COLORS = ["#080F1D", "#12294F", "#31124B", "#4E215B", "#D4AF5A"];

type NavbarUser = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  userType: "dashboard" | "customer";
};

type NavbarProps = {
  trimmed?: boolean;
};

export default function Navbar({ trimmed = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState<NavbarUser | null>(null);
  const t = useTranslations("Navbar");
  const locale = useLocale();
  const pathname = usePathname();
  const isWeddingServicePage = pathname.includes("/services/wedding");
  const router = useRouter();
  const baseRouter = useBaseRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        if (!response.ok) return;

        const result = await response.json();
        if (isMounted) {
          setCurrentUser(result?.data ?? null);
        }
      } catch {
        if (isMounted) {
          setCurrentUser(null);
        }
      }
    };

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const navLinks = [
    { name: t("services"), href: "#services" },
    { name: t("howItWorks"), href: "#how-it-works" },
    { name: t("chefs"), href: "#chefs" },
    { name: t("events"), href: "#events" },
    { name: t("international"), href: "#" },
  ];

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const handleUserAvatarClick = () => {
    if (!currentUser) return;
    if (currentUser.userType === "dashboard") {
      baseRouter.push("/dashboard");
      return;
    }
    router.push("/profile");
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/90 backdrop-blur-md py-4 border-b border-white/5"
          : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link
          href="/"
          className={`md:text-xl lg:text-2xl font-serif tracking-wider font-bold uppercase ${
            isWeddingServicePage ? "text-[#8a5b35]" : "text-foreground"
          }`}
        >
          Mongolian National Caterer
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {!trimmed &&
            navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors tracking-wide ${
                  isWeddingServicePage
                    ? "text-[#8a5b35]/85 hover:text-[#6f4d2f]"
                    : "text-foreground/80 hover:text-primary"
                }`}
              >
                {link.name}
              </a>
            ))}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center gap-2 ${
                  isWeddingServicePage
                    ? "text-[#8a5b35]/85 hover:text-[#6f4d2f]"
                    : "text-foreground/80 hover:text-primary"
                }`}
              >
                <Globe className="h-4 w-4" />
                <span className="uppercase">{locale}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-background border-white/10"
            >
              <DropdownMenuItem
                onClick={() => handleLocaleChange("en")}
                className="hover:bg-primary/10 cursor-pointer"
              >
                English
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleLocaleChange("mn")}
                className="hover:bg-primary/10 cursor-pointer"
              >
                Монгол
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {currentUser ? (
            <button
              onClick={handleUserAvatarClick}
              className="rounded-full transition-opacity hover:opacity-90 cursor-pointer"
              aria-label="Open account"
            >
              <Avatar className="h-9 w-9 border border-white/30">
                <AvatarImage
                  src={currentUser.avatar || undefined}
                  alt={currentUser.name}
                />
                <AvatarFallback className="bg-transparent p-0">
                  <BoringAvatar
                    size={36}
                    name={currentUser.name}
                    variant="beam"
                    colors={AVATAR_COLORS}
                  />
                </AvatarFallback>
              </Avatar>
            </button>
          ) : (
            <Link href={"/login"}>
              <Button
                variant="outline"
                className={
                  isWeddingServicePage
                    ? "border-[#8a5b35] text-[#8a5b35] hover:bg-[#8a5b35] hover:text-amber-50 transition-all"
                    : "border-primary text-primary hover:bg-primary hover:text-black transition-all"
                }
              >
                {t("getStarted")}
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-background border-l border-white/10 w-[80%]"
            >
              <div className="flex flex-col space-y-8 mt-12">
                {!trimmed &&
                  navLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      className={`text-2xl font-serif transition-colors ${
                        isWeddingServicePage
                          ? "text-[#8a5b35] hover:text-[#6f4d2f]"
                          : "text-foreground hover:text-primary"
                      }`}
                    >
                      {link.name}
                    </a>
                  ))}

                <div className="flex gap-4 pt-4 border-t border-white/5">
                  <button
                    onClick={() => handleLocaleChange("en")}
                    className={`text-sm uppercase tracking-widest ${
                      locale === "en"
                        ? isWeddingServicePage
                          ? "text-[#8a5b35]"
                          : "text-primary"
                        : isWeddingServicePage
                          ? "text-[#8a5b35]/55"
                          : "text-foreground/60"
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => handleLocaleChange("mn")}
                    className={`text-sm uppercase tracking-widest ${
                      locale === "mn"
                        ? isWeddingServicePage
                          ? "text-[#8a5b35]"
                          : "text-primary"
                        : isWeddingServicePage
                          ? "text-[#8a5b35]/55"
                          : "text-foreground/60"
                    }`}
                  >
                    MN
                  </button>
                </div>

                {currentUser ? (
                  <button
                    onClick={handleUserAvatarClick}
                    className="w-full flex items-center justify-center gap-3 rounded-md border border-white/10 p-3"
                    aria-label="Open account"
                  >
                    <Avatar className="h-10 w-10 border border-white/10">
                      <AvatarImage
                        src={currentUser.avatar || undefined}
                        alt={currentUser.name}
                      />
                      <AvatarFallback className="bg-transparent p-0">
                        <BoringAvatar
                          size={40}
                          name={currentUser.name}
                          variant="beam"
                          colors={AVATAR_COLORS}
                        />
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground">
                      {currentUser.name}
                    </span>
                  </button>
                ) : (
                  <Link href="/login" className="w-full">
                    <Button
                      className={
                        isWeddingServicePage
                          ? "bg-[#8a5b35] text-amber-50 hover:bg-[#764c2d] w-full"
                          : "bg-primary text-black hover:bg-primary/90 w-full"
                      }
                    >
                      {t("getStarted")}
                    </Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
