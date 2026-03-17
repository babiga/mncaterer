"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { format } from "date-fns";
import {
    CalendarIcon,
    ImagePlusIcon,
    Loader2Icon,
    UsersIcon,
    XIcon,
} from "lucide-react";

import {
    createEventSchema,
    updateEventSchema,
} from "@/lib/validations/events";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "@/components/ui/image-upload";
import { VideoUpload } from "@/components/ui/video-upload";
import type { EventItem } from "./events-columns";

interface EventFormSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    event: EventItem | null;
    mode: "create" | "edit" | "view";
    onSuccess: () => void;
}

const eventTypeLabels: Record<string, string> = {
    WEDDING: "Wedding",
    CORPORATE: "Corporate",
    PRIVATE: "Private",
    SOCIAL: "Social",
};

const eventTypeColors: Record<string, string> = {
    WEDDING: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    CORPORATE: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    PRIVATE: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    SOCIAL: "bg-amber-500/10 text-amber-500 border-amber-500/20",
};

async function uploadImage(file: File): Promise<string> {
    if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size must be less than 5MB");
    }

    const response = await fetch(
        `/api/upload?filename=${encodeURIComponent(file.name)}`,
        {
            method: "POST",
            body: file,
        }
    );

    if (!response.ok) {
        throw new Error("Upload failed");
    }

    const blob = await response.json();
    return blob.url as string;
}

export function EventFormSheet({
    open,
    onOpenChange,
    event,
    mode,
    onSuccess,
}: EventFormSheetProps) {
    const [isPending, setIsPending] = useState(false);
    const [isUploadingGallery, setIsUploadingGallery] = useState(false);

    const isCreate = mode === "create";
    const isEdit = mode === "edit";
    const isView = mode === "view";

    const createForm = useForm({
        resolver: zodResolver(createEventSchema),
        defaultValues: {
            title: "",
            description: "",
            eventType: "CORPORATE",
            guestCount: 50,
            eventDate: "",
            coverImageUrl: "",
            imageUrls: [],
            videoUrl: "",
            isFeatured: false,
            chefProfileId: null,
            companyProfileId: null,
        },
    });

    const editForm = useForm({
        resolver: zodResolver(updateEventSchema),
        defaultValues: {
            title: "",
            description: "",
            eventType: "CORPORATE",
            guestCount: 50,
            eventDate: "",
            coverImageUrl: "",
            imageUrls: [],
            videoUrl: "",
            isFeatured: false,
        },
    });

    useEffect(() => {
        if (event && (isEdit || isView)) {
            editForm.reset({
                title: event.title || "",
                description: event.description || "",
                eventType: event.eventType,
                guestCount: event.guestCount,
                eventDate: event.eventDate
                    ? new Date(event.eventDate).toISOString().split("T")[0]
                    : "",
                coverImageUrl: event.coverImageUrl || "",
                imageUrls: event.imageUrls || [],
                videoUrl: event.videoUrl || "",
                isFeatured: event.isFeatured,
            });
        }
        if (isCreate) {
            createForm.reset({
                title: "",
                description: "",
                eventType: "CORPORATE",
                guestCount: 50,
                eventDate: "",
                coverImageUrl: "",
                imageUrls: [],
                videoUrl: "",
                isFeatured: false,
                chefProfileId: null,
                companyProfileId: null,
            });
        }
    }, [event, mode, createForm, editForm, isCreate, isEdit, isView]);

    async function onCreateSubmit(data: any) {
        setIsPending(true);
        try {
            const response = await fetch("/api/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!result.success) {
                toast.error(result.error || "Failed to create event");
                return;
            }

            toast.success("Event created successfully");
            onSuccess();
            onOpenChange(false);
            createForm.reset();
        } catch {
            toast.error("Something went wrong");
        } finally {
            setIsPending(false);
        }
    }

    async function onEditSubmit(data: any) {
        if (!event) return;

        setIsPending(true);
        try {
            const response = await fetch(`/api/events/${event.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!result.success) {
                toast.error(result.error || "Failed to update event");
                return;
            }

            toast.success("Event updated successfully");
            onSuccess();
            onOpenChange(false);
        } catch {
            toast.error("Something went wrong");
        } finally {
            setIsPending(false);
        }
    }

    async function handleGalleryUpload(
        files: FileList | null,
        onChange: (urls: string[]) => void,
        currentUrls: string[]
    ) {
        if (!files?.length) return;

        setIsUploadingGallery(true);
        try {
            const uploadedUrls = await Promise.all(
                Array.from(files).map((file) => uploadImage(file))
            );
            onChange([...currentUrls, ...uploadedUrls]);
            toast.success("Gallery images uploaded successfully");
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Failed to upload images";
            toast.error(message);
        } finally {
            setIsUploadingGallery(false);
        }
    }

    function renderFormFields(form: any) {
        return (
            <>
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Event title" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Describe the event..."
                                    rows={3}
                                    {...field}
                                    value={field.value ?? ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="eventType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Event Type</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="WEDDING">Wedding</SelectItem>
                                        <SelectItem value="CORPORATE">Corporate</SelectItem>
                                        <SelectItem value="PRIVATE">Private</SelectItem>
                                        <SelectItem value="SOCIAL">Social</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="guestCount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Guest Count</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={1}
                                        placeholder="50"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="eventDate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Event Date (Optional)</FormLabel>
                            <FormControl>
                                <Input
                                    type="date"
                                    {...field}
                                    value={field.value ?? ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="coverImageUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Featured Image</FormLabel>
                            <FormControl>
                                <ImageUpload
                                    value={field.value ?? null}
                                    onChange={field.onChange}
                                    onRemove={() => field.onChange("")}
                                    disabled={isPending || isUploadingGallery}
                                    aspectRatio="video"
                                />
                            </FormControl>
                            <FormDescription className="text-xs">
                                This image is used as the event cover.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="videoUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Event Video</FormLabel>
                            <FormControl>
                                <VideoUpload
                                    value={field.value ?? null}
                                    onChange={field.onChange}
                                    onRemove={() => field.onChange("")}
                                    disabled={isPending || isUploadingGallery}
                                    aspectRatio="video"
                                />
                            </FormControl>
                            <FormDescription className="text-xs">
                                Upload a video for this event.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="imageUrls"
                    render={({ field }) => {
                        const urls = (field.value as string[] | undefined) || [];
                        return (
                            <FormItem>
                                <div className="flex items-center justify-between">
                                    <FormLabel>Gallery Images</FormLabel>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={isPending || isUploadingGallery}
                                        onClick={() => {
                                            const input = document.getElementById("event-gallery-upload");
                                            input?.click();
                                        }}
                                    >
                                        {isUploadingGallery ? (
                                            <Loader2Icon className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <ImagePlusIcon className="h-4 w-4" />
                                        )}
                                        Add Images
                                    </Button>
                                </div>
                                <FormControl>
                                    <input
                                        id="event-gallery-upload"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={async (e) => {
                                            await handleGalleryUpload(
                                                e.target.files,
                                                field.onChange,
                                                urls
                                            );
                                            e.target.value = "";
                                        }}
                                        disabled={isPending || isUploadingGallery}
                                    />
                                </FormControl>
                                {urls.length > 0 ? (
                                    <div className="grid grid-cols-3 gap-2">
                                        {urls.map((url, index) => (
                                            <div
                                                key={`${url}-${index}`}
                                                className="relative aspect-square overflow-hidden rounded-md border"
                                            >
                                                <img
                                                    src={url}
                                                    alt={`Gallery image ${index + 1}`}
                                                    className="h-full w-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-white"
                                                    onClick={() =>
                                                        field.onChange(
                                                            urls.filter((_, i) => i !== index)
                                                        )
                                                    }
                                                    disabled={isPending || isUploadingGallery}
                                                >
                                                    <XIcon className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        No gallery images uploaded yet.
                                    </p>
                                )}
                                <FormMessage />
                            </FormItem>
                        );
                    }}
                />
                <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                                <FormLabel>Featured Event</FormLabel>
                                <FormDescription className="text-xs">
                                    Featured events are highlighted on the public website
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </>
        );
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col overflow-y-auto sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>
                        {isCreate ? "Add New Event" : isEdit ? "Edit Event" : "Event Details"}
                    </SheetTitle>
                    <SheetDescription>
                        {isCreate
                            ? "Create a new portfolio event"
                            : isEdit
                                ? "Update event information"
                                : "View event details"}
                    </SheetDescription>
                </SheetHeader>

                {event && !isCreate && (
                    <>
                        <div className="flex items-center gap-3 py-4">
                            <div className="flex flex-col gap-1">
                                <h3 className="font-semibold text-lg">{event.title}</h3>
                                <div className="flex gap-2 flex-wrap">
                                    <Badge
                                        variant="outline"
                                        className={eventTypeColors[event.eventType] || ""}
                                    >
                                        {eventTypeLabels[event.eventType]}
                                    </Badge>
                                    {event.isFeatured && (
                                        <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
                                            Featured
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Separator />
                    </>
                )}

                {isCreate && (
                    <Form {...createForm}>
                        <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="flex flex-1 flex-col gap-4 py-4">
                            {renderFormFields(createForm)}
                            <SheetFooter className="mt-auto pt-4">
                                <SheetClose asChild><Button type="button" variant="outline">Cancel</Button></SheetClose>
                                <Button type="submit" disabled={isPending || isUploadingGallery}>{isPending ? "Creating..." : "Create Event"}</Button>
                            </SheetFooter>
                        </form>
                    </Form>
                )}

                {isEdit && event && (
                    <Form {...editForm}>
                        <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="flex flex-1 flex-col gap-4 py-4">
                            {renderFormFields(editForm)}
                            <SheetFooter className="mt-auto pt-4">
                                <SheetClose asChild><Button type="button" variant="outline">Cancel</Button></SheetClose>
                                <Button type="submit" disabled={isPending || isUploadingGallery}>{isPending ? "Saving..." : "Save Changes"}</Button>
                            </SheetFooter>
                        </form>
                    </Form>
                )}

                {isView && event && (
                    <div className="flex flex-1 flex-col gap-4 py-4 text-sm">
                        {event.coverImageUrl && (
                            <div>
                                <label className="text-muted-foreground">Featured Image</label>
                                <div className="mt-1 overflow-hidden rounded-md border">
                                    <img
                                        src={event.coverImageUrl}
                                        alt={`${event.title} cover`}
                                        className="h-40 w-full object-cover"
                                    />
                                </div>
                            </div>
                        )}
                        {event.videoUrl && (
                            <div>
                                <label className="text-muted-foreground">Video</label>
                                <div className="mt-1 overflow-hidden rounded-md border aspect-video">
                                    <video
                                        src={event.videoUrl}
                                        className="h-full w-full object-cover"
                                        controls
                                    />
                                </div>
                            </div>
                        )}
                        {event.imageUrls?.length > 0 && (
                            <div>
                                <label className="text-muted-foreground">Gallery</label>
                                <div className="mt-1 grid grid-cols-3 gap-2">
                                    {event.imageUrls.map((url, index) => (
                                        <div
                                            key={`${url}-${index}`}
                                            className="aspect-square overflow-hidden rounded-md border"
                                        >
                                            <img
                                                src={url}
                                                alt={`Event gallery ${index + 1}`}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {event.description && (
                            <div>
                                <label className="text-muted-foreground">Description</label>
                                <p className="font-medium mt-1">{event.description}</p>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-muted-foreground">Guest Count</label>
                                <p className="font-medium flex items-center gap-1.5">
                                    <UsersIcon className="h-3.5 w-3.5" />
                                    {event.guestCount}
                                </p>
                            </div>
                            <div>
                                <label className="text-muted-foreground">Event Date</label>
                                <p className="font-medium flex items-center gap-1.5">
                                    <CalendarIcon className="h-3.5 w-3.5" />
                                    {event.eventDate
                                        ? format(new Date(event.eventDate), "MMM d, yyyy")
                                        : "Not set"}
                                </p>
                            </div>
                            <div>
                                <label className="text-muted-foreground">Chef</label>
                                <p className="font-medium">
                                    {event.chefProfile?.dashboardUser?.name || "-"}
                                </p>
                            </div>
                            <div>
                                <label className="text-muted-foreground">Company</label>
                                <p className="font-medium">
                                    {event.companyProfile?.dashboardUser?.name || "-"}
                                </p>
                            </div>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground">Created</span>
                                <span>{format(new Date(event.createdAt), "MMM d, yyyy")}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground">Updated</span>
                                <span>{format(new Date(event.updatedAt), "MMM d, yyyy")}</span>
                            </div>
                        </div>
                        <SheetFooter className="mt-auto pt-4">
                            <SheetClose asChild><Button variant="outline" className="w-full">Close</Button></SheetClose>
                        </SheetFooter>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
