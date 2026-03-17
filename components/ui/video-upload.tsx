"use client";

import { useState, useCallback } from "react";
import { Upload, X, Loader2, VideoIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface VideoUploadProps {
    value?: string | null;
    onChange: (url: string) => void;
    onRemove: () => void;
    disabled?: boolean;
    className?: string;
    aspectRatio?: "square" | "video";
}

export function VideoUpload({
    value,
    onChange,
    onRemove,
    disabled,
    className,
    aspectRatio = "video",
}: VideoUploadProps) {
    const [isUploading, setIsUploading] = useState(false);

    const onUpload = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            try {
                const file = event.target.files?.[0];
                if (!file) return;

                // Increased limit for videos to 50MB
                if (file.size > 50 * 1024 * 1024) {
                    toast.error("Video size must be less than 50MB");
                    return;
                }

                setIsUploading(true);
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
                onChange(blob.url);
                toast.success("Video uploaded successfully");
            } catch (error) {
                console.error("Upload error:", error);
                toast.error("Failed to upload video");
            } finally {
                setIsUploading(false);
            }
        },
        [onChange]
    );

    return (
        <div className={cn("space-y-4 w-full", className)}>
            <div
                className={cn(
                    "relative overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-muted-foreground/50",
                    aspectRatio === "square" ? "aspect-square" : "aspect-video",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
            >
                {value ? (
                    <div className="relative h-full w-full">
                        <video
                            src={value}
                            className="h-full w-full object-cover"
                            controls
                        />
                        {!disabled && (
                            <button
                                type="button"
                                onClick={onRemove}
                                className="absolute right-2 top-2 z-10 rounded-full bg-destructive p-1 text-white shadow-sm hover:bg-destructive/90"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                ) : (
                    <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2">
                        {isUploading ? (
                            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                        ) : (
                            <>
                                <div className="rounded-full bg-secondary p-4">
                                    <VideoIcon className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium">Click to upload video</p>
                                    <p className="text-xs text-muted-foreground">
                                        Max size 50MB
                                    </p>
                                </div>
                            </>
                        )}
                        <input
                            type="file"
                            className="hidden"
                            accept="video/*"
                            onChange={onUpload}
                            disabled={disabled || isUploading}
                        />
                    </label>
                )}
            </div>
        </div>
    );
}
