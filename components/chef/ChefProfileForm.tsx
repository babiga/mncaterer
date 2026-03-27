"use client";

import { useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { chefProfileSchema, type ChefProfileData } from "@/lib/validations/chef";
import { updateChefProfile } from "@/lib/actions/chef-profile";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UserStatusBadge } from "@/components/users/user-status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CreditCard } from "lucide-react";
import { ChefPaymentDialog } from "./ChefPaymentDialog";
import { useLanguage } from "@/components/language-context";
import { LanguageToggler } from "@/components/language-toggler";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";

const translations = {
    en: {
        profileStatus: "Profile Status",
        profileStatusDesc: "Your current standing on the platform.",
        registrationStatus: "Registration Status",
        profileDetails: "Profile Details",
        profileDetailsDesc: "Update your profile photo and public biography.",
        profileDetailsReadonly: "Chef profile photo and bio.",
        bioLabel: "Professional Biography",
        bioPlaceholder: "Share your culinary journey, style, and philosophy...",
        basicInfo: "Basic Information",
        fullName: "Full Name",
        phone: "Phone Number",
        primarySpecialty: "Primary Specialty",
        yearsExp: "Years of Experience",
        addSpecialties: "Additional Specialties",
        profExperience: "Professional Experience",
        education: "Education",
        degrees: "Degrees",
        certifications: "Certifications",
        notableEvents: "Notable Events",
        awards: "Awards & Honors",
        saveBtn: "Save Profile",
        savingBtn: "Saving Changes...",
        successMsg: "Profile updated successfully",
        errorMsg: "Failed to update profile",
        wrongMsg: "Something went wrong",
        feePendingTitle: "Registration Fee Pending",
        feePendingDesc: "Special Offer: Pay half price today! Your registration fee payment is currently pending. Join the platform at 50% off for event attendees.",
        payNow: "Pay Now (50% Off)",
        add: "Add",
        noItems: "No {label} added yet.",
        pageTitle: "Chef Profile",
        pageDesc: "Manage your public profile information and culinary credentials.",
        news: "News",
        view: "View"
    },
    mn: {
        profileStatus: "Профайлын төлөв",
        profileStatusDesc: "Платформ дээрх таны одоогийн байдал.",
        registrationStatus: "Бүртгэлийн төлөв",
        profileDetails: "Профайлын дэлгэрэнгүй",
        profileDetailsDesc: "Профайл зураг болон намтраа шинэчилнэ үү.",
        profileDetailsReadonly: "Тогоочын профайл зураг болон намтар.",
        bioLabel: "Мэргэжлийн намтар",
        bioPlaceholder: "Хоол хийх туршлага, арга барил, философиосоо хуваалцаарай...",
        basicInfo: "Үндсэн мэдээлэл",
        fullName: "Овог нэр",
        phone: "Утасны дугаар",
        primarySpecialty: "Үндсэн мэргэжил",
        yearsExp: "Ажлын туршлага (жил)",
        addSpecialties: "Нэмэлт мэргэжил",
        profExperience: "Мэргэжлийн туршлага",
        education: "Боловсрол",
        degrees: "Зэрэг хамгаалалт",
        certifications: "Сертификат",
        notableEvents: "Онцлох үйл явдлууд",
        awards: "Шагнал урамшуулал",
        saveBtn: "Профайл хадгалах",
        savingBtn: "Өөрчлөлтийг хадгалж байна...",
        successMsg: "Профайл амжилттай шинэчлэгдлээ",
        errorMsg: "Профайл шинэчлэхэд алдаа гарлаа",
        wrongMsg: "Ямар нэг зүйл буруу боллоо",
        feePendingTitle: "Бүртгэлийн хураамж хүлээгдэж байна",
        feePendingDesc: "Онцгой урамшуулал: Арга хэмжээнд хүрэлцэн ирсэн танд зориулж тал үнээр платформд нэгдэх эрх болгож байна.",
        payNow: "Одоо төлөх (50% хөнгөлөлт)",
        add: "Нэмэх",
        noItems: "Одоогоор {label} нэмээгүй байна.",
        pageTitle: "Тогоочын профайл",
        pageDesc: "Өөрийн нээлттэй профайлын мэдээллээ энд удирдана уу.",
        news: "Мэдээ",
        view: "Үзэх"
    }
};

interface DynamicListProps {
    name: keyof ChefProfileData;
    label: string;
    description?: string;
    placeholder: string;
    form: UseFormReturn<ChefProfileData>;
    readonly?: boolean;
    isPending?: boolean;
}

function DynamicList({ name, label, description, placeholder, form, readonly, isPending }: DynamicListProps) {
    const { language } = useLanguage();
    const t = translations[language];
    const items = (form.watch(name as any) || []) as string[];

    const addItem = () => {
        if (readonly) return;
        form.setValue(name as any, [...items, ""] as any);
    };

    const removeItem = (index: number) => {
        if (readonly) return;
        form.setValue(
            name as any,
            items.filter((_, i) => i !== index) as any
        );
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>{label}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </div>
                {!readonly && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addItem}
                        disabled={isPending}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        {t.add}
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {items.map((_, index) => (
                    <div key={index} className="flex gap-2">
                        <FormField
                            control={form.control as any}
                            name={`${name}.${index}`}
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <Input placeholder={placeholder} {...field} disabled={readonly || isPending} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {!readonly && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => removeItem(index)}
                                disabled={isPending}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                ))}
                {items.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        {t.noItems.replace("{label}", label.toLowerCase())}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

interface ChefProfileFormProps {
    initialData: ChefProfileData;
    readonly?: boolean;
    posters?: { id: string; title: string | null; imageUrl: string | null }[];
}

export function ChefProfileForm({ initialData, readonly = false, posters }: ChefProfileFormProps) {
    const { language } = useLanguage();
    const t = translations[language];
    const [isPending, setIsPending] = useState(false);

    const form: UseFormReturn<ChefProfileData> = useForm<ChefProfileData>({
        resolver: zodResolver(chefProfileSchema),
        defaultValues: initialData,
    });

    const [showPaymentDialog, setShowPaymentDialog] = useState(false);

    async function onSubmit(data: ChefProfileData) {
        if (readonly) return;
        setIsPending(true);
        try {
            const result = await updateChefProfile(data);
            if (result.success) {
                toast.success(t.successMsg);
            } else {
                toast.error(result.error || t.errorMsg);
            }
        } catch (error) {
            console.error(error);
            toast.error(t.wrongMsg);
        } finally {
            setIsPending(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8">
                <ChefPaymentDialog
                    isOpen={showPaymentDialog}
                    onOpenChange={setShowPaymentDialog}
                    chefName={form.watch("name")}
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 max-w-4xl mx-auto">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold lg:text-3xl">{t.pageTitle}</h1>
                        <p className="text-muted-foreground">
                            {t.pageDesc}
                        </p>
                    </div>
                    <LanguageToggler />
                </div>

                <div className="flex flex-col gap-8 max-w-4xl mx-auto">
                    {/* Registration Fee Alert */}
                    {form.watch("taxStatus") === "PENDING" && !readonly && (
                        <Alert variant="destructive" className="border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex gap-4">
                                <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                                <div>
                                    <AlertTitle className="font-serif text-lg">{t.feePendingTitle}</AlertTitle>
                                    <AlertDescription className="text-sm opacity-90">
                                        {t.feePendingDesc}
                                    </AlertDescription>
                                </div>
                            </div>
                            <Button
                                type="button"
                                size="sm"
                                className="bg-amber-600 hover:bg-amber-700 text-white border-none shadow-lg shrink-0"
                                onClick={() => setShowPaymentDialog(true)}
                            >
                                <CreditCard className="mr-2 h-4 w-4" />
                                {t.payNow}
                            </Button>
                        </Alert>
                    )}

                    {/* Profile Status Card */}
                    <Card className="border-white/5 bg-white/2 shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle>{t.profileStatus}</CardTitle>
                                <CardDescription>{t.profileStatusDesc}</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">{t.registrationStatus}</span>
                                    <UserStatusBadge type="taxStatus" value={form.watch("taxStatus") || "PENDING"} />
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Posters Gallery */}
                    {posters && posters.length > 0 && (
                        <div className="space-y-4 pt-4 pb-4">
                            <h2 className="text-xl font-medium tracking-wide uppercase">
                                {t.news || "News"}
                            </h2>
                            <div className="h-px w-full bg-border" />
                            <PhotoProvider>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {posters.map((poster) =>
                                        poster.imageUrl ? (
                                            <PhotoView key={poster.id} src={poster.imageUrl}>
                                                <div className="relative aspect-3/4 cursor-pointer group overflow-hidden rounded-xl border border-border">
                                                    <img
                                                        src={poster.imageUrl}
                                                        alt={poster.title || "Poster"}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                                        <span className="text-white text-sm font-medium drop-shadow-md line-clamp-2">
                                                            {poster.title}
                                                        </span>
                                                        <span className="text-primary text-xs mt-1 uppercase tracking-wider font-semibold">
                                                            {t.view || "View"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </PhotoView>
                                        ) : null
                                    )}
                                </div>
                            </PhotoProvider>
                        </div>
                    )}

                    {/* Profile Details (Avatar + Bio) */}
                    <Card className="shadow-lg border-white/5 bg-white/2">
                        <CardHeader>
                            <CardTitle>{t.profileDetails}</CardTitle>
                            <CardDescription>
                                {readonly ? t.profileDetailsReadonly : t.profileDetailsDesc}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex justify-center pb-2">
                                <FormField
                                    control={form.control as any}
                                    name="avatar"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="bg-background/50 p-3 shadow-xl rounded-full border border-white/5">
                                                <FormControl>
                                                    <ImageUpload
                                                        className="w-40 h-40 rounded-full"
                                                        value={field.value}
                                                        disabled={isPending || readonly}
                                                        onChange={field.onChange}
                                                        onRemove={() => field.onChange("")}
                                                    />
                                                </FormControl>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Separator className="bg-white/5" />

                            <FormField
                                control={form.control as any}
                                name="bio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-white/70">{t.bioLabel}</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder={t.bioPlaceholder}
                                                className="min-h-[200px] bg-white/1 border-white/10 focus:border-primary/50 transition-all resize-none leading-relaxed"
                                                {...field}
                                                value={field.value || ""}
                                                disabled={readonly}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Basic Information */}
                    <Card className="border-white/5 bg-white/2 shadow-md">
                        <CardHeader>
                            <CardTitle>{t.basicInfo}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control as any}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t.fullName}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t.fullName} {...field} disabled={readonly} className="bg-white/2 border-white/10" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control as any}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t.phone}</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+976 99999999" {...field} value={field.value || ""} disabled={readonly} className="bg-white/2 border-white/10" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <FormField
                                    control={form.control as any}
                                    name="specialty"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t.primarySpecialty}</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Italian" {...field} disabled={readonly} className="bg-white/2 border-white/10" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control as any}
                                    name="yearsExperience"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t.yearsExp}</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} disabled={readonly} className="bg-white/2 border-white/10" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dynamic Lists - All Vertical */}
                    <DynamicList
                        name="specialties"
                        label={t.addSpecialties}
                        placeholder="e.g. French Pastry"
                        form={form}
                        readonly={readonly}
                        isPending={isPending}
                    />

                    <DynamicList
                        name="experience"
                        label={t.profExperience}
                        placeholder="e.g. Head Chef at X Restaurant (2020-2023)"
                        form={form}
                        readonly={readonly}
                        isPending={isPending}
                    />

                    <DynamicList
                        name="education"
                        label={t.education}
                        placeholder="e.g. Culinary Institute of America"
                        form={form}
                        readonly={readonly}
                        isPending={isPending}
                    />

                    <DynamicList
                        name="degrees"
                        label={t.degrees}
                        placeholder="e.g. Bachelor of Culinary Arts"
                        form={form}
                        readonly={readonly}
                        isPending={isPending}
                    />

                    <DynamicList
                        name="certifications"
                        label={t.certifications}
                        placeholder="Certification name"
                        form={form}
                        readonly={readonly}
                        isPending={isPending}
                    />

                    <DynamicList
                        name="events"
                        label={t.notableEvents}
                        placeholder="e.g. Asian Culinary Forum 2023"
                        form={form}
                        readonly={readonly}
                        isPending={isPending}
                    />

                    <DynamicList
                        name="awards"
                        label={t.awards}
                        placeholder="e.g. Best Chef Award 2022"
                        form={form}
                        readonly={readonly}
                        isPending={isPending}
                    />
                </div>

                {!readonly && (
                    <div className="flex justify-end">
                        <Button type="submit" size="lg" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t.savingBtn}
                                </>
                            ) : (
                                t.saveBtn
                            )}
                        </Button>
                    </div>
                )}
            </form>
        </Form>
    );
}
