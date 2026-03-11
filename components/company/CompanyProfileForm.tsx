"use client";

import { useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { companyProfileSchema, type CompanyProfileData } from "@/lib/validations/company";
import { updateCompanyProfile } from "@/lib/actions/company-profile";

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

interface CompanyProfileFormProps {
    initialData: CompanyProfileData;
}

export function CompanyProfileForm({ initialData }: CompanyProfileFormProps) {
    const [isPending, setIsPending] = useState(false);

    const form: UseFormReturn<CompanyProfileData> = useForm<CompanyProfileData>({
        resolver: zodResolver(companyProfileSchema),
        defaultValues: initialData,
    });

    async function onSubmit(data: CompanyProfileData) {
        setIsPending(true);
        try {
            const result = await updateCompanyProfile(data);
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

    const services = form.watch("services") || [];
    const portfolioImages = form.watch("portfolioImages") || [];

    const addService = () => {
        form.setValue("services", [...services, ""]);
    };

    const removeService = (index: number) => {
        form.setValue(
            "services",
            services.filter((_, i) => i !== index)
        );
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Visual Profile section */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Visuals</CardTitle>
                                <CardDescription>
                                    Update your company avatar/logo.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex justify-center relative z-10">
                                    <FormField
                                        control={form.control as any}
                                        name="avatar"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="bg-background p-2 shadow-sm">
                                                    <FormControl>
                                                        <ImageUpload
                                                            className="w-32 h-32 rounded-full"
                                                            value={field.value || ""}
                                                            disabled={isPending}
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
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control as any}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contact Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" {...field} />
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
                                                <Input placeholder="+976 99999999" {...field} value={field.value || ""} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Company details section */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Company Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control as any}
                                    name="companyName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Company Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Catering Co." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control as any}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Tell potential clients about your company..."
                                                    className="min-h-32"
                                                    {...field}
                                                    value={field.value || ""}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Services</CardTitle>
                                    <CardDescription>Add the services your company provides.</CardDescription>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addService}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {services.map((_, index) => (
                                    <div key={index} className="flex gap-2">
                                        <FormField
                                            control={form.control as any}
                                            name={`services.${index}`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl>
                                                        <Input placeholder="Service name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive"
                                            onClick={() => removeService(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {services.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No services added yet.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

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
            </form>
        </Form>
    );
}
