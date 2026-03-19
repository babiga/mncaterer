import { Button } from "@/components/ui/button";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import {
  ArrowLeft,
  CircleCheck,
  GlassWater,
  Sparkles,
  Wine,
} from "lucide-react";

export default async function PrivateServicePage() {
  const t = await getTranslations("ServiceDetails.private");
  const s = await getTranslations("Services");
  const touchpoints = t.raw("touchpoints") as string[];
  const moments = [
    { title: t("moments.0.title"), description: t("moments.0.description") },
    { title: t("moments.1.title"), description: t("moments.1.description") },
    { title: t("moments.2.title"), description: t("moments.2.description") },
  ];
  const serviceNav = [
    { href: "/services/corporate", label: s("corporate.title") },
    { href: "/services/wedding", label: s("weddings.title") },
    { href: "/services/vip", label: s("vip.title") },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#50324f_0%,#2d1830_45%,#170d1b_100%)] text-rose-50">
      <Navbar trimmed />
      <main className="container mx-auto px-6 pb-20 pt-28 space-y-14">
        <div className="flex items-center md:gap-4">
          <Button
            asChild
            variant="ghost"
            className="text-rose-100 hover:bg-white/10"
          >
            <Link href="/#services">
              <ArrowLeft className="md:mr-2 h-4 w-4" />
              <span className="hidden md:block">{t("backToServices")}</span>
            </Link>
          </Button>
          <div className="flex items-center gap-4 text-xs uppercase tracking-[0.16em] text-rose-100/80 overflow-x-auto no-scrollbar">
            {serviceNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-rose-100 transition-colors text-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <section className="grid gap-6 rounded-3xl border border-rose-200/25 bg-[#2f1932]/70 p-8 grid-cols-1 md:grid-cols-[0.95fr_1.05fr] md:p-12">
          <div className="relative min-h-80 overflow-hidden rounded-[1.75rem] border border-rose-100/20">
            <img
              src="/service-private.png"
              alt={t("heroAlt")}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#1b0d1f]/85 via-[#1b0d1f]/30 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-rose-100/20 bg-black/30 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-rose-100">
                {t("guestRangeTitle")}
              </p>
              <p className="mt-1 text-sm text-rose-50/85">
                {t("guestRangeDescription")}
              </p>
            </div>
          </div>
          <div className="space-y-6 self-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-rose-200/30 bg-rose-200/15 px-4 py-1 text-xs uppercase tracking-[0.2em] text-rose-100">
              <Sparkles className="h-4 w-4" />
              {t("eyebrow")}
            </p>
            <h1 className="text-2xl font-semibold leading-tight md:text-6xl">
              {t("title")}
            </h1>
            <p className="max-w-xl text-rose-100/85 md:text-lg">
              {t("description")}
            </p>
            <Button
              asChild
              size="lg"
              className="bg-rose-200 text-[#2b1230] hover:bg-rose-100 lg:text-lg mt-4"
            >
              <Link href="/booking">{t("cta")}</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="grid gap-4 rounded-2xl border border-rose-200/25 bg-[#2f1932]/70 p-7">
            <h2 className="text-2xl font-semibold">{t("toneTitle")}</h2>
            <p className="rounded-2xl border border-rose-200/20 bg-[#3a2040]/80 p-5 text-sm text-rose-50/85">
              {t("tone.0")}
            </p>
            <p className="rounded-2xl border border-rose-200/20 bg-[#3a2040]/70 p-5 text-sm text-rose-50/85">
              {t("tone.1")}
            </p>
            <p className="rounded-2xl border border-rose-200/20 bg-[#3a2040]/60 p-5 text-sm text-rose-50/85">
              {t("tone.2")}
            </p>
          </article>

          <article className="rounded-2xl border border-rose-200/25 bg-[#3a2040]/70 p-7">
            <h2 className="mb-5 text-2xl font-semibold">
              {t("includedTitle")}
            </h2>
            <ul className="space-y-3 text-sm text-rose-50/85">
              {touchpoints.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CircleCheck className="mt-0.5 h-4 w-4 text-rose-200" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {moments.map((item, index) => (
            <article
              key={item.title}
              className={`rounded-2xl border border-rose-200/25 p-6 bg-[#2f1932]/70`}
            >
              <Wine className="mb-4 h-5 w-5 text-rose-200" />
              <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
              <p className="text-sm text-rose-50/85">{item.description}</p>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}
