import { Facebook, Instagram, Twitter, Youtube, Linkedin, Github } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

interface SocialLinkType {
  id: string;
  icon: string | null;
  link: string | null;
  title: string | null;
}

export default function Footer({ socialLinks }: { socialLinks?: SocialLinkType[] }) {
  const t = useTranslations("Footer");

  // Helper to safely render lucide icons
  const renderIcon = (iconName: string | null) => {
    if (!iconName) return <Facebook className="w-5 h-5" />;

    switch (iconName.toLowerCase()) {
      case "instagram":
        return <Instagram className="w-5 h-5" />;
      case "twitter":
      case "x":
        return <Twitter className="w-5 h-5" />;
      case "youtube":
        return <Youtube className="w-5 h-5" />;
      case "linkedin":
        return <Linkedin className="w-5 h-5" />;
      case "github":
        return <Github className="w-5 h-5" />;
      case "facebook":
      default:
        return <Facebook className="w-5 h-5" />;
    }
  };

  return (
    <footer className="bg-black py-16 border-t border-white/10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <h2 className="text-3xl font-serif font-bold text-white mb-6 tracking-wide uppercase">Mongolian National Caterer</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              {t("description")}
            </p>
            <div className="flex gap-4">
              {socialLinks && socialLinks.length > 0 ? (
                socialLinks.map((social) => (
                  <a key={social.id} href={social.link || "#"} className="text-white/60 hover:text-primary transition-colors" title={social.title || ""}>
                    {renderIcon(social.icon)}
                  </a>
                ))
              ) : (
                <>
                  <a href="#" className="text-white/60 hover:text-primary transition-colors"><Instagram className="w-5 h-5" /></a>
                  <a href="#" className="text-white/60 hover:text-primary transition-colors"><Twitter className="w-5 h-5" /></a>
                  <a href="#" className="text-white/60 hover:text-primary transition-colors"><Facebook className="w-5 h-5" /></a>
                </>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-6 uppercase tracking-widest text-xs">{t("company")}</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">{t("aboutUs")}</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">{t("careers")}</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">{t("journal")}</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">{t("contact")}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-6 uppercase tracking-widest text-xs">{t("services")}</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="/services/private" className="hover:text-primary transition-colors">{t("privateChefs")}</Link></li>
              <li><Link href="/services/wedding" className="hover:text-primary transition-colors">{t("weddingCatering")}</Link></li>
              <li><Link href="/services/corporate" className="hover:text-primary transition-colors">{t("corporateEvents")}</Link></li>
              <li><Link href="/services/vip" className="hover:text-primary transition-colors">{t("culinaryMasterclasses")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-6 uppercase tracking-widest text-xs">{t("newsletter")}</h4>
            <p className="text-muted-foreground text-sm mb-4">{t("newsletterDesc")}</p>
            <div className="flex">
              <input
                type="email"
                placeholder={t("emailPlaceholder")}
                className="bg-transparent border-b border-white/20 text-white py-2 px-0 w-full focus:outline-none focus:border-primary text-sm"
              />
              <button className="text-primary text-sm uppercase tracking-wider font-medium hover:text-white transition-colors ml-4">
                {t("join")}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 text-xs text-muted-foreground">
          <p>{t("allRightsReserved")}</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white">{t("privacyPolicy")}</a>
            <a href="#" className="hover:text-white">{t("termsOfService")}</a>
            <a href="#" className="hover:text-white">{t("sitemap")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
