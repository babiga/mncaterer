import { Button } from "@/components/ui/button";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import {
  ArrowLeft,
  CircleCheck,
  Crown,
  Gem,
  ShieldCheck,
  Sparkles,
  Stars,
  Wine,
} from "lucide-react";

export default async function VipServicePage() {
  const t = await getTranslations("ServiceDetails.vip");
  const s = await getTranslations("Services");
  const pillars = [
    {
      title: t("pillars.0.title"),
      description: t("pillars.0.description"),
      icon: Gem,
    },
    {
      title: t("pillars.1.title"),
      description: t("pillars.1.description"),
      icon: ShieldCheck,
    },
    {
      title: t("pillars.2.title"),
      description: t("pillars.2.description"),
      icon: Sparkles,
    },
  ];
  const signatureMoments = t.raw("signatureMoments") as string[];
  const serviceNav = [
    { href: "/services/corporate", label: s("corporate.title") },
    { href: "/services/private", label: s("private.title") },
    { href: "/services/wedding", label: s("weddings.title") },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#40351f_0%,#1f1a11_45%,#0b0906_100%)] text-amber-50">
      <Navbar trimmed />
      <main className="container mx-auto px-6 pb-20 pt-28 space-y-12">
        <div className="flex items-center md:gap-4">
          <Button
            asChild
            variant="ghost"
            className="text-amber-100 hover:bg-amber-100/10"
          >
            <Link href="/#services">
              <ArrowLeft className="md:mr-2 h-4 w-4" />
              <span className="hidden md:block">{t("backToServices")}</span>
            </Link>
          </Button>
          <div className="flex items-center gap-4 text-xs uppercase tracking-[0.16em] text-amber-100/80 overflow-x-auto no-scrollbar">
            {serviceNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-amber-50 transition-colors text-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <section className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <aside className="space-y-6 rounded-3xl border border-amber-200/25 bg-[#17130d]/85 p-8 lg:sticky lg:top-24 lg:h-fit">
            <p className="inline-flex items-center gap-2 rounded-full border border-amber-200/30 bg-amber-200/15 px-4 py-1 text-xs uppercase tracking-[0.2em] text-amber-100">
              <Crown className="h-4 w-4" />
              {t("eyebrow")}
            </p>
            <h1 className="text-2xl font-semibold leading-tight md:text-5xl">
              {t("title")}
            </h1>
            <p className="max-w-xl text-amber-50/85">{t("description")}</p>
            <Button
              asChild
              className="bg-amber-200 text-[#1f1a11] hover:bg-amber-100 lg:text-lg"
            >
              <Link href="/inquiry">{t("cta")}</Link>
            </Button>
            <div className="rounded-2xl border border-amber-200/20 bg-[#1f1a11]/75 p-4">
              <h2 className="mb-3 text-lg font-semibold">
                {t("cadenceTitle")}
              </h2>
              <div className="space-y-2 text-sm text-amber-50/80">
                <p>{t("cadence.0")}</p>
                <p>{t("cadence.1")}</p>
                <p>{t("cadence.2")}</p>
              </div>
            </div>
          </aside>

          <div className="grid gap-6">
            <div className="relative min-h-72 overflow-hidden rounded-3xl border border-amber-100/25">
              <img
                src="/hero-food.png"
                alt={t("heroAlt")}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0906]/90 via-[#1f1a11]/40 to-transparent" />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {pillars.map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl border border-amber-200/20 bg-[#1f1a11]/75 p-6"
                >
                  <item.icon className="mb-4 h-6 w-6 text-amber-200" />
                  <h2 className="mb-2 text-xl font-semibold">{item.title}</h2>
                  <p className="text-sm text-amber-50/80">{item.description}</p>
                </article>
              ))}
            </div>

            <article className="rounded-2xl border border-amber-200/20 bg-[#17130d]/80 p-7">
              <h2 className="mb-5 flex items-center gap-2 text-2xl font-semibold">
                <Stars className="h-5 w-5 text-amber-200" />
                {t("signatureTitle")}
              </h2>
              <ul className="grid gap-3 text-sm text-amber-50/80 sm:grid-cols-2">
                {signatureMoments.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 rounded-xl border border-amber-200/15 bg-[#1f1a11]/70 p-3"
                  >
                    <CircleCheck className="mt-0.5 h-4 w-4 text-amber-200" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
