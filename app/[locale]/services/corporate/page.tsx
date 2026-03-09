import { Button } from "@/components/ui/button";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarClock,
  Presentation,
  UtensilsCrossed,
  Users,
  CircleCheck,
} from "lucide-react";

export default async function CorporateServicePage() {
  const t = await getTranslations("ServiceDetails.corporate");
  const s = await getTranslations("Services");
  const highlights = [
    {
      title: t("highlights.0.title"),
      description: t("highlights.0.description"),
      icon: UtensilsCrossed,
    },
    {
      title: t("highlights.1.title"),
      description: t("highlights.1.description"),
      icon: CalendarClock,
    },
    {
      title: t("highlights.2.title"),
      description: t("highlights.2.description"),
      icon: Presentation,
    },
  ];
  const formats = t.raw("formats") as string[];
  const process = [
    {
      step: "01",
      title: t("process.0.title"),
      description: t("process.0.description"),
    },
    {
      step: "02",
      title: t("process.1.title"),
      description: t("process.1.description"),
    },
    {
      step: "03",
      title: t("process.2.title"),
      description: t("process.2.description"),
    },
  ];
  const serviceNav = [
    { href: "/services/private", label: s("private.title") },
    { href: "/services/wedding", label: s("weddings.title") },
    { href: "/services/vip", label: s("vip.title") },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1f3b67_0%,#0f1f39_45%,#081222_100%)] text-slate-100">
      <Navbar trimmed />
      <main className="container mx-auto px-6 pb-20 pt-28 space-y-14">
        <div className="flex flex-wrap items-center gap-4">
          <Button
            asChild
            variant="ghost"
            className="text-slate-200 hover:bg-white/10"
          >
            <Link href="/#services">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("backToServices")}
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.16em] text-blue-100/80">
            {serviceNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-blue-100 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <section className="grid gap-8 rounded-3xl border border-blue-200/25 bg-[#0e213d]/75 p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-12">
          <div className="space-y-7">
            <p className="inline-flex items-center gap-2 rounded-full border border-blue-200/30 bg-blue-200/15 px-4 py-1 text-xs uppercase tracking-[0.2em] text-blue-100">
              <BriefcaseBusiness className="h-4 w-4" />
              {t("eyebrow")}
            </p>
            <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
              {t("title")}
            </h1>
            <p className="max-w-xl text-base text-slate-200/90 md:text-lg">
              {t("description")}
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-blue-200/20 bg-[#12284b]/70 p-4"
                >
                  <item.icon className="mb-2 h-5 w-5 text-blue-200" />
                  <p className="text-xs font-medium text-blue-100">
                    {item.title}
                  </p>
                </div>
              ))}
            </div>
            <Button
              asChild
              size="lg"
              className="bg-blue-200 text-[#0b1a33] hover:bg-blue-100 text-lg mt-4"
            >
              <Link href="/inquiry">{t("cta")}</Link>
            </Button>
          </div>

          <div className="grid gap-4">
            <div className="relative min-h-72 overflow-hidden rounded-2xl border border-blue-100/25">
              <img
                src="/event-corporate.png"
                alt={t("heroAlt")}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#081222]/90 via-[#081222]/35 to-transparent" />
            </div>
            {/* <div className="rounded-2xl border border-blue-200/25 bg-[#12284b]/80 p-5">
              <p className="mb-1 text-xs uppercase tracking-[0.2em] text-blue-200">{t("deliveryTitle")}</p>
              <p className="text-sm text-slate-200/90">{process[0].description}</p>
            </div> */}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <article className="rounded-2xl border border-blue-200/20 bg-[#0e213d]/70 p-7 lg:h-fit">
            <h2 className="mb-4 text-2xl font-semibold">{t("bestFitTitle")}</h2>
            <ul className="space-y-3 text-sm text-slate-200/90">
              {formats.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CircleCheck className="mt-0.5 h-4 w-4 text-blue-200" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-blue-200/20 bg-[#0e213d]/70 p-7">
            <h2 className="mb-6 text-2xl font-semibold">
              {t("deliveryTitle")}
            </h2>
            <div className="space-y-6">
              {process.map((item, index) => (
                <div key={item.step} className="relative pl-12">
                  {index < process.length - 1 ? (
                    <span className="absolute left-[14px] top-8 h-[calc(100%+0.75rem)] w-px bg-blue-200/30" />
                  ) : null}
                  <span className="absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full border border-blue-200/40 bg-[#12284b] text-xs font-semibold text-blue-100">
                    {item.step}
                  </span>
                  <h3 className="text-lg font-medium">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-200/85">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
      <Footer />
    </div>
  );
}
