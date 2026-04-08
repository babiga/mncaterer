import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import {
  ArrowRight,
  Compass,
  HeartHandshake,
  Sparkles,
  Users,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AboutPage.meta" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("AboutPage");

  const values = [
    {
      icon: Sparkles,
      title: t("values.items.0.title"),
      description: t("values.items.0.description"),
    },
    {
      icon: HeartHandshake,
      title: t("values.items.1.title"),
      description: t("values.items.1.description"),
    },
    {
      icon: Compass,
      title: t("values.items.2.title"),
      description: t("values.items.2.description"),
    },
  ];

  const stats = [
    {
      value: t("stats.items.0.value"),
      label: t("stats.items.0.label"),
    },
    {
      value: t("stats.items.1.value"),
      label: t("stats.items.1.label"),
    },
    {
      value: t("stats.items.2.value"),
      label: t("stats.items.2.label"),
    },
  ];

  return (
    <div className="min-h-screen text-foreground">
      <Navbar trimmed />

      <main className="pb-24 pt-28">
        <section
          aria-labelledby="about-hero-title"
          className="container mx-auto px-6"
        >
          <div className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_right,hsl(46_65%_52%/0.22),transparent_42%),linear-gradient(160deg,hsl(223_44%_10%/0.95),hsl(223_38%_8%/0.93))] p-8 md:p-14">
            <p className="mb-4 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs uppercase tracking-[0.18em] text-primary">
              {t("hero.eyebrow")}
            </p>
            <h1
              id="about-hero-title"
              className="max-w-7xl text-2xl sm:text-3xl leading-tight md:text-4xl lg:text-5xl"
            >
              {t("hero.title")}
            </h1>
            <p className="mt-6 max-w-6xl text-base leading-relaxed text-foreground/80 md:text-lg">
              {t("hero.description")}
            </p>
            <div className="mt-7 h-px w-24 bg-primary/45" />

            <ul className="mt-10 grid gap-4 sm:grid-cols-3">
              {stats.map((item) => (
                <li
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-black/20 p-5 transition-colors duration-200 hover:border-primary/30"
                >
                  <p className="text-2xl font-semibold text-primary md:text-3xl">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm text-foreground/70">
                    {item.label}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          aria-labelledby="about-story-title"
          className="container mx-auto mt-16 px-6"
        >
          <div className="grid gap-8 md:grid-cols-[1.15fr_0.85fr]">
            <article className="rounded-3xl border border-white/8 bg-white/3 p-8 md:p-10">
              <h2 id="about-story-title" className="text-3xl md:text-4xl">
                {t("story.title")}
              </h2>
              <p className="mt-5 text-foreground/80">{t("story.paragraph1")}</p>
              <p className="mt-4 text-foreground/80">{t("story.paragraph2")}</p>
            </article>

            <article className="rounded-3xl border border-white/8 bg-white/3 p-8 md:p-10">
              <h2 className="flex items-center gap-2 text-2xl md:text-4xl">
                <span>{t("values.title")}</span>
              </h2>
              <ul className="mt-6 space-y-5">
                {values.map((item) => (
                  <li
                    key={item.title}
                    className="rounded-2xl border border-white/10 bg-black/20 p-5 transition-colors duration-200 hover:border-primary/30"
                  >
                    <p className="flex items-center gap-2 text-lg">
                      <item.icon className="h-5 w-5 text-primary" />
                      <span>{item.title}</span>
                    </p>
                    <p className="mt-2 text-sm text-foreground/75">
                      {item.description}
                    </p>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section
          aria-labelledby="about-cta-title"
          className="container mx-auto mt-16 px-6"
        >
          <div className="rounded-3xl border border-primary/25 bg-primary/10 p-8 text-center md:p-12">
            <h2 id="about-cta-title" className="text-3xl md:text-4xl">
              {t("cta.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-foreground/80">
              {t("cta.description")}
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 bg-primary text-black transition-colors duration-200 hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Link href="/booking">
                {t("cta.button")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
