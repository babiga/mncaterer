import { getTranslations } from "next-intl/server";
import { getCurrentCustomer } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserProfileForm } from "@/components/user/user-profile-form";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("UserProfile.page");
  const user = await getCurrentCustomer();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-serif tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mt-1 text-lg">{t("description")}</p>
      </div>

      <UserProfileForm
        initialData={{
          email: user.email,
          userType: user.userType,
          organizationName: user.organizationName,
          companyLegalNo: user.companyLegalNo,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          address: user.address,
        }}
      />
    </div>
  );
}
