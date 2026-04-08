"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import BoringAvatar from "boring-avatars";
import { Globe, Menu } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter as useBaseRouter } from "next/navigation";
import { useEffect, useState } from "react";

const AVATAR_COLORS = ["#080F1D", "#12294F", "#31124B", "#4E215B", "#D4AF5A"];

import { useUserStore } from "@/lib/store/use-user-store";

type NavbarProps = {
  trimmed?: boolean;
};

export default function Navbar({ trimmed = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const { user: currentUser } = useUserStore();
  const t = useTranslations("Navbar");
  const locale = useLocale();
  const pathname = usePathname();
  const isWeddingServicePage = pathname.includes("/services/wedding");
  const router = useRouter();
  const baseRouter = useBaseRouter();

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: t("services"), href: "/#services" },
    { name: t("menus"), href: "/menus" },
    { name: t("howItWorks"), href: "/#how-it-works" },
    { name: t("chefs"), href: "/chefs" },
    { name: t("events"), href: "/events" },
    { name: t("international"), href: "/#international" },
  ];

  const mobileLinks = [{ name: t("home"), href: "/" }, ...navLinks];

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const handleUserAvatarClick = () => {
    setIsOpen(false);
    if (!currentUser) return;
    if (currentUser.userType === "dashboard") {
      baseRouter.push("/dashboard");
      return;
    }
    router.push("/profile");
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50  ${
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
              <Link
                key={link.name}
                href={link.href}
                className={`hidden xl:block text-sm font-medium transition-colors tracking-wide ${
                  isWeddingServicePage
                    ? "text-[#8a5b35]/85 hover:text-[#6f4d2f]"
                    : "text-foreground/80 hover:text-primary"
                }`}
              >
                {link.name}
              </Link>
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
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={
                  isWeddingServicePage ? "text-[#8a5b35]" : "text-foreground"
                }
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-background border-l border-white/10 w-[85%] p-0 flex flex-col"
            >
              <div className="flex flex-col h-full">
                {/* User Info Header */}
                <div className="p-6 pt-16 border-b border-white/5 bg-white/2">
                  {currentUser ? (
                    <button
                      onClick={handleUserAvatarClick}
                      className="flex items-center gap-4 text-left w-full hover:opacity-80 transition-opacity"
                    >
                      <Avatar className="h-14 w-14 border-2 border-primary/20">
                        <AvatarImage
                          src={currentUser.avatar || undefined}
                          alt={currentUser.name}
                        />
                        <AvatarFallback className="bg-transparent p-0">
                          <BoringAvatar
                            size={56}
                            name={currentUser.name}
                            variant="beam"
                            colors={AVATAR_COLORS}
                          />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-xl font-serif font-bold text-foreground truncate max-w-[180px]">
                          {currentUser.name}
                        </span>
                        <span className="text-xs text-primary font-medium tracking-wide border-b border-primary/30 w-fit">
                          {currentUser.userType === "dashboard"
                            ? t("goDashboard")
                            : t("viewProfile")}
                        </span>
                      </div>
                    </button>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <h2 className="text-2xl font-serif font-bold text-foreground">
                        {t("home")}
                      </h2>
                      <p className="text-xs text-foreground/40 tracking-wider uppercase">
                        Mongolian National Caterer
                      </p>
                    </div>
                  )}
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto px-6 py-8">
                  <div className="flex flex-col space-y-6">
                    {mobileLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`text-2xl font-serif transition-colors ${
                          isWeddingServicePage
                            ? "text-[#8a5b35] hover:text-[#6f4d2f]"
                            : "text-foreground hover:text-primary"
                        }`}
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="p-6 border-t border-white/5 bg-white/1 flex flex-col gap-8 mt-auto">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => {
                          handleLocaleChange("en");
                          setIsOpen(false);
                        }}
                        className={`text-lg font-serif transition-colors ${
                          locale === "en"
                            ? isWeddingServicePage
                              ? "text-[#8a5b35] font-bold"
                              : "text-primary font-bold"
                            : "text-foreground/40 hover:text-foreground/70"
                        }`}
                      >
                        English
                      </button>
                      <span className="text-white/10">|</span>
                      <button
                        onClick={() => {
                          handleLocaleChange("mn");
                          setIsOpen(false);
                        }}
                        className={`text-lg font-serif transition-colors ${
                          locale === "mn"
                            ? isWeddingServicePage
                              ? "text-[#8a5b35] font-bold"
                              : "text-primary font-bold"
                            : "text-foreground/40 hover:text-foreground/70"
                        }`}
                      >
                        Монгол
                      </button>
                    </div>

                    {!currentUser && (
                      <Link href="/login" onClick={() => setIsOpen(false)}>
                        <button
                          className={`text-lg font-serif transition-colors ${
                            isWeddingServicePage
                              ? "text-[#8a5b35]"
                              : "text-foreground/60"
                          }`}
                        >
                          Log In
                        </button>
                      </Link>
                    )}
                  </div>

                  {!currentUser && (
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="w-full"
                    >
                      <Button
                        className={`w-full font-serif text-xl py-7 rounded-none ${
                          isWeddingServicePage
                            ? "bg-[#8a5b35] text-white hover:bg-[#6f4d2f]"
                            : "bg-primary text-black hover:bg-primary/90"
                        }`}
                      >
                        {t("getStarted")}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
