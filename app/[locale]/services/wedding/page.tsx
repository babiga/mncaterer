import { Button } from "@/components/ui/button";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Clock3, Flower2, Heart, Sparkles, Utensils } from "lucide-react";

export default async function WeddingServicePage() {
  const t = await getTranslations("ServiceDetails.wedding");
  const s = await getTranslations("Services");
  const timeline = [
    { title: t("timeline.0.title"), description: t("timeline.0.description") },
    { title: t("timeline.1.title"), description: t("timeline.1.description") },
    { title: t("timeline.2.title"), description: t("timeline.2.description") },
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
        <div className="flex flex-wrap items-center gap-4">
          <Button asChild variant="ghost" className="text-stone-700 hover:bg-stone-900/5">
            <Link href="/#services">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.16em] text-[#8a5b35]/85">
            {serviceNav.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-[#6f4d2f] transition-colors">
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
            <Button asChild className="bg-[#8a5b35] text-amber-50 hover:bg-[#764c2d]">
              <Link href="/inquiry">{t("cta")}</Link>
            </Button>
          </div>
          <div className="relative mt-8 min-h-80 overflow-hidden rounded-2xl border border-[#d7c2a6]">
            <img src="/service-wedding.png" alt={t("heroAlt")} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#4f3d2f]/65 via-[#8f765c]/30 to-transparent" />
          </div>
        </section>

        <section className="rounded-2xl border border-[#d7c2a6] bg-[#fff8ee]/95 p-7">
          <h2 className="mb-6 flex items-center gap-2 text-2xl font-semibold text-[#4a3221]">
            <Clock3 className="h-5 w-5 text-[#8a5b35]" />
            {t("timelineTitle")}
          </h2>
          <div className="relative space-y-5 pl-6 md:pl-10">
            <span className="absolute left-[11px] top-2 h-[calc(100%-1rem)] w-px bg-[#c8ab86]" />
            {timeline.map((item, index) => (
              <div key={item.title} className="relative rounded-xl border border-[#d7c2a6] bg-[#fffaf1]/90 p-4 md:p-5">
                <span className="absolute -left-[22px] top-4 flex h-5 w-5 items-center justify-center rounded-full border border-[#b99567] bg-[#f5e8d6] text-[10px] font-semibold text-[#6f4d2f]">
                  {index + 1}
                </span>
                <h3 className="text-lg font-medium text-[#4a3221]">{item.title}</h3>
                <p className="text-sm text-[#6f4d2f]">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-2xl border border-[#d7c2a6] bg-[#fffaf1]/95 p-7">
            <h2 className="mb-3 flex items-center gap-2 text-2xl font-semibold text-[#4a3221]">
              <Utensils className="h-5 w-5 text-[#8a5b35]" />
              {t("menuTitle")}
            </h2>
            <p className="text-sm leading-relaxed text-[#6f4d2f]">{t("menuDescription")}</p>
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
