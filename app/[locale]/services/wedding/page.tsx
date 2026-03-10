import { Button } from "@/components/ui/button";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import {
  ArrowLeft,
  Clock3,
  Flower2,
  Heart,
  Sparkles,
  Utensils,
} from "lucide-react";

export default async function WeddingServicePage() {
  const t = await getTranslations("ServiceDetails.wedding");
  const s = await getTranslations("Services");
  const timeline = [
    {
      step: "01",
      title: t("timeline.0.title"),
      description: t("timeline.0.description"),
    },
    {
      step: "02",
      title: t("timeline.1.title"),
      description: t("timeline.1.description"),
    },
    {
      step: "03",
      title: t("timeline.2.title"),
      description: t("timeline.2.description"),
    },
  ];
  const signatures = t.raw("signatures") as string[];
  const serviceNav = [
    { href: "/services/corporate", label: s("corporate.title") },
    { href: "/services/private", label: s("private.title") },
    { href: "/services/vip", label: s("vip.title") },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f6ecdc_0%,#eadcc9_45%,#dbc8af_100%)] text-stone-900">
      <Navbar trimmed />
      <main className="container mx-auto px-6 pb-20 pt-28 space-y-14">
        <div className="flex items-center md:gap-4">
          <Button
            asChild
            variant="ghost"
            className="text-stone-700 hover:bg-stone-900/5"
          >
            <Link href="/#services">
              <ArrowLeft className="md:mr-2 h-4 w-4" />
              <span className="hidden md:block">{t("backToServices")}</span>
            </Link>
          </Button>
          <div className="flex items-center gap-4 text-xs uppercase tracking-[0.16em] text-[#8a5b35]/85 overflow-x-auto no-scrollbar">
            {serviceNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-[#6f4d2f] transition-colors text-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <section className="rounded-3xl border border-[#d7c2a6] bg-[#fffaf1]/90 p-8 md:p-12">
          <div className="mx-auto max-w-3xl space-y-6 text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#ccb08f] bg-[#f5e8d6] px-4 py-1 text-xs uppercase tracking-[0.2em] text-[#6f4d2f]">
              <Heart className="h-4 w-4" />
              {t("eyebrow")}
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-[#4a3221] md:text-5xl">
              {t("title")}
            </h1>
            <p className="text-[#6f4d2f] md:text-lg">{t("description")}</p>
            <Button
              asChild
              className="bg-[#8a5b35] text-amber-50 hover:bg-[#764c2d] text-lg"
            >
              <Link href="/inquiry">{t("cta")}</Link>
            </Button>
          </div>
          <div className="relative mt-8 min-h-80 overflow-hidden rounded-2xl border border-[#d7c2a6]">
            <img
              src="/service-wedding.png"
              alt={t("heroAlt")}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#4f3d2f]/65 via-[#8f765c]/30 to-transparent" />
          </div>
        </section>

        <section className="rounded-2xl border border-[#d7c2a6] bg-[#fff8ee]/95 p-7">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-semibold text-[#4a3221]">
                <Clock3 className="h-5 w-5 text-[#8a5b35]" />
                {t("timelineTitle")}
              </h2>
              <p className="mt-2 text-sm text-[#6f4d2f]">{t("description")}</p>
            </div>
          </div>

          <div className="relative grid gap-5 md:grid-cols-3 md:gap-6">
            <span className="absolute bottom-4 left-[15px] top-4 w-px bg-[#ccb08f] md:hidden" />
            <span className="absolute left-[16.666%] right-[16.666%] top-6 hidden h-px bg-[#ccb08f] md:block" />
            {timeline.map((item) => (
              <article
                key={item.title}
                className="relative pl-10 md:pl-0 md:pt-12"
              >
                <span className="absolute left-0 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-[#b99567] bg-[#f5e8d6] text-[11px] font-semibold tracking-[0.12em] text-[#6f4d2f] md:left-1/2 md:top-0 md:-translate-x-1/2">
                  {item.step}
                </span>
                <div className="h-full rounded-[1.5rem] border border-[#d7c2a6] bg-[#fffaf1]/95 p-5 shadow-[0_18px_40px_-32px_rgba(111,77,47,0.55)]">
                  <p className="mb-3 text-xs uppercase tracking-[0.18em] text-[#8a5b35]">
                    {item.step}
                  </p>
                  <h3 className="text-lg font-medium text-[#4a3221]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#6f4d2f]">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-2xl border border-[#d7c2a6] bg-[#fffaf1]/95 p-7">
            <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold text-[#4a3221]">
              <Utensils className="h-5 w-5 text-[#8a5b35]" />
              {t("menuTitle")}
            </h2>
            <p className="text-sm leading-relaxed text-[#6f4d2f]">
              {t("menuDescription")}
            </p>
          </article>

          <article className="rounded-2xl border border-[#d7c2a6] bg-[#f4eadc]/95 p-7">
            <h2 className="mb-5 flex items-center gap-2 text-2xl font-semibold text-[#4a3221]">
              <Sparkles className="h-5 w-5 text-[#8a5b35]" />
              {t("signatureTitle")}
            </h2>
            <ul className="space-y-3 text-sm text-[#6f4d2f]">
              {signatures.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Flower2 className="mt-0.5 h-4 w-4 text-[#8a5b35]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </main>
      <Footer />
    </div>
  );
}
