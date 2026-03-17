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
                        Add
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
                        No {label.toLowerCase()} added yet.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

interface ChefProfileFormProps {
    initialData: ChefProfileData;
    readonly?: boolean;
}

export function ChefProfileForm({ initialData, readonly = false }: ChefProfileFormProps) {
    const [isPending, setIsPending] = useState(false);

    const form: UseFormReturn<ChefProfileData> = useForm<ChefProfileData>({
        resolver: zodResolver(chefProfileSchema),
        defaultValues: initialData,
    });

    async function onSubmit(data: ChefProfileData) {
        if (readonly) return;
        setIsPending(true);
        try {
            const result = await updateChefProfile(data);
            if (result.success) {
                toast.success("Profile updated successfully");
            } else {
                toast.error(result.error || "Failed to update profile");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8">
                <div className="flex flex-col gap-8 max-w-4xl mx-auto">
                    {/* Profile Details (Avatar + Bio) */}
                    <Card className="shadow-lg border-white/5 bg-white/2">
                        <CardHeader>
                            <CardTitle>Profile Details</CardTitle>
                            <CardDescription>
                                {readonly ? "Chef profile photo and bio." : "Update your profile photo and public biography."}
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
                                        <FormLabel className="text-sm font-medium text-white/70">Professional Biography</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Share your culinary journey, style, and philosophy..."
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
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control as any}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Chef Name" {...field} disabled={readonly} className="bg-white/2 border-white/10" />
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
                                        <FormLabel>Phone Number</FormLabel>
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
                                            <FormLabel>Primary Specialty</FormLabel>
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
                                            <FormLabel>Years of Experience</FormLabel>
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
                        label="Additional Specialties"
                        placeholder="e.g. French Pastry"
                        form={form}
                        readonly={readonly}
                        isPending={isPending}
                    />

                    <DynamicList
                        name="experience"
                        label="Professional Experience"
                        placeholder="e.g. Head Chef at X Restaurant (2020-2023)"
                        form={form}
                        readonly={readonly}
                        isPending={isPending}
                    />

                    <DynamicList
                        name="education"
                        label="Education"
                        placeholder="e.g. Culinary Institute of America"
                        form={form}
                        readonly={readonly}
                        isPending={isPending}
                    />

                    <DynamicList
                        name="degrees"
                        label="Degrees"
                        placeholder="e.g. Bachelor of Culinary Arts"
                        form={form}
                        readonly={readonly}
                        isPending={isPending}
                    />

                    <DynamicList
                        name="certifications"
                        label="Certifications"
                        placeholder="Certification name"
                        form={form}
                        readonly={readonly}
                        isPending={isPending}
                    />

                    <DynamicList
                        name="events"
                        label="Notable Events"
                        placeholder="e.g. Asian Culinary Forum 2023"
                        form={form}
                        readonly={readonly}
                        isPending={isPending}
                    />

                    <DynamicList
                        name="awards"
                        label="Awards & Honors"
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
                                    Saving Changes...
                                </>
                            ) : (
                                "Save Profile"
                            )}
                        </Button>
                    </div>
                )}
            </form>
        </Form>
    );
}
