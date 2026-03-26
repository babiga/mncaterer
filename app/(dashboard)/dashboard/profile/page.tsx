import { getCurrentUserWithProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChefProfileForm } from "@/components/chef/ChefProfileForm";
import { CompanyProfileForm } from "@/components/company/CompanyProfileForm";
import { AdminProfileForm } from "@/components/admin/AdminProfileForm";
import type { ChefProfileData } from "@/lib/validations/chef";
import type { CompanyProfileData } from "@/lib/validations/company";
import type { AdminProfileData } from "@/lib/validations/admin";

export default async function ProfilePage() {
    const user = await getCurrentUserWithProfile();

    if (!user) {
        redirect("/login");
    }

    if (user.role === "CHEF") {
        const chefProfile = user.chefProfile;

        if (!chefProfile) {
            return (
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                    <h1 className="text-2xl font-bold">Profile</h1>
                    <p className="text-destructive">Chef profile not found.</p>
                </div>
            );
        }

        const initialData: ChefProfileData = {
            name: user.name,
            phone: user.phone || "",
            avatar: user.avatar || "",
            coverImage: chefProfile.coverImage || "",
            specialty: chefProfile.specialty,
            specialties: chefProfile.specialties || [],
            education: chefProfile.education || [],
            experience: chefProfile.experience || [],
            events: chefProfile.events || [],
            degrees: chefProfile.degrees || [],
            awards: chefProfile.awards || [],
            bio: chefProfile.bio || "",
            yearsExperience: chefProfile.yearsExperience,
            certifications: chefProfile.certifications || [],
            taxStatus: chefProfile.taxStatus as any,
        };

        return (
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 lg:gap-8 lg:py-8">
                <div className="px-4 lg:px-6 max-w-6xl mx-auto w-full">
                    <ChefProfileForm initialData={initialData} />
                </div>
            </div>
        );
    }

    if (user.role === "COMPANY") {
        const companyProfile = user.companyProfile;

        if (!companyProfile) {
            return (
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                    <h1 className="text-2xl font-bold">Profile</h1>
                    <p className="text-destructive">Company profile not found.</p>
                </div>
            );
        }

        const initialData: CompanyProfileData = {
            name: user.name,
            phone: user.phone || "",
            avatar: user.avatar || "",
            companyName: companyProfile.companyName,
            description: companyProfile.description || "",
            services: companyProfile.services || [],
            portfolioImages: companyProfile.portfolioImages || [],
        };

        return (
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 lg:gap-8 lg:py-8">
                <div className="px-4 lg:px-6">
                    <h1 className="text-2xl font-bold lg:text-3xl">Company Profile</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your catering company details and services.
                    </p>
                </div>

                <div className="px-4 lg:px-6 max-w-6xl mx-auto w-full">
                    <CompanyProfileForm initialData={initialData} />
                </div>
            </div>
        );
    }

    if (user.role === "ADMIN") {
        const initialData: AdminProfileData = {
            name: user.name,
            phone: user.phone || "",
            avatar: user.avatar || "",
        };

        return (
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 lg:gap-8 lg:py-8">
                <div className="px-4 lg:px-6">
                    <h1 className="text-2xl font-bold lg:text-3xl">Admin Profile</h1>
                    <p className="text-muted-foreground mt-1">
                        Update your administrator account details.
                    </p>
                </div>

                <div className="px-4 lg:px-6 w-full">
                    <AdminProfileForm initialData={initialData} />
                </div>
            </div>
        );
    }

    return null;
}
