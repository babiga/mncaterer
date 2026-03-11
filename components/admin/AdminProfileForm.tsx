"use client";

import { useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { adminProfileSchema, type AdminProfileData } from "@/lib/validations/admin";
import { updateAdminProfile } from "@/lib/actions/admin-profile";

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
import { ImageUpload } from "@/components/ui/image-upload";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface AdminProfileFormProps {
    initialData: AdminProfileData;
}

export function AdminProfileForm({ initialData }: AdminProfileFormProps) {
    const [isPending, setIsPending] = useState(false);

    const form: UseFormReturn<AdminProfileData> = useForm<AdminProfileData>({
        resolver: zodResolver(adminProfileSchema),
        defaultValues: initialData,
    });

    async function onSubmit(data: AdminProfileData) {
        setIsPending(true);
        try {
            const result = await updateAdminProfile(data);
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Admin Profile</CardTitle>
                        <CardDescription>
                            Update your admin details and avatar.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex justify-center relative z-10">
                            <FormField
                                control={form.control}
                                name="avatar"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="bg-background p-2 w-fit mx-auto overflow-hidden">
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

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Admin Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
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
