"use client"

import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { uploadToImageKit } from "@/lib/helpers/uploadToImageKit";
import FileUpload from "@/components/inputs/FileUpload";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LinkIcon, UploadCloud } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { saveVideoAction } from "@/actions/lessons";
import { Video } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod/v3";

const schema = z.object({
    videoUrl: z.string().url("Must be a valid URL (YouTube, Vimeo, etc.)").optional().or(z.literal('')),
    description: z.string().max(2000).optional(),
    duration: z.coerce.number().int().min(1, "Must be at least 1 minute").optional().or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

type Props = {
    lessonId: string
    existingVideo: Video | null
}

export default function VideoForm({ lessonId, existingVideo }: Props) {
    const [thumbnailFiles, setThumbnailFiles] = useState<File[]>([])
    const isEditing = !!existingVideo

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            videoUrl: existingVideo?.videoUrl ?? '',
            description: existingVideo?.description ?? '',
            duration: existingVideo?.duration ?? '',
        }
    })

    const mutation = useMutation({
        mutationFn: async (values: FormValues) => {
            let imageUrl = existingVideo?.imageUrl ?? undefined

            if (thumbnailFiles[0]) {
                const { imageUrls, errors } = await uploadToImageKit(thumbnailFiles)
                if (errors.length > 0) throw new Error(`Thumbnail upload failed: ${errors[0].error}`)
                imageUrl = imageUrls[0]
            }

            return saveVideoAction(lessonId, {
                videoUrl: values.videoUrl || undefined,
                description: values.description || undefined,
                duration: values.duration ? Number(values.duration) : undefined,
                imageUrl,
            })
        },
        onSuccess: () => {
            toast.success(isEditing ? "Video updated!" : "Video saved!", { id: "video-save" })
            setThumbnailFiles([])
        },
        onError: (error) => toast.error(error.message, { id: "video-save" })
    })

    return (
        <form onSubmit={form.handleSubmit((v) => {
            toast.loading(isEditing ? "Updating video..." : "Saving video...", { id: "video-save" })
            mutation.mutate(v)
        })}>
            <FieldGroup className="max-w-3xl space-y-5">

                <FileUpload
                    title="Thumbnail"
                    files={thumbnailFiles}
                    onFilesChange={setThumbnailFiles}
                    existingUrls={existingVideo?.imageUrl ? [existingVideo.imageUrl] : []}
                    accept="image/*"
                />

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <LinkIcon className="size-4 text-primary" />
                            Video Source
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <Controller
                            name="videoUrl"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Video URL</FieldLabel>
                                    <Input
                                        {...field}
                                        placeholder="https://youtube.com/watch?v=..."
                                        className="bg-input border-border"
                                        autoComplete="off"
                                    />
                                    <FieldDescription>
                                        Paste a YouTube, Vimeo, or any publicly accessible video URL.
                                    </FieldDescription>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <div className="flex items-center gap-3 rounded-lg border border-dashed border-border p-4 opacity-50">
                            <UploadCloud className="size-5 text-muted shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-foreground">Direct Upload</p>
                                <p className="text-xs text-muted mt-0.5">
                                    Upload video files directly to storage — coming soon.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="space-y-5 pt-6">
                        <Controller
                            name="description"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Description</FieldLabel>
                                    <Textarea
                                        {...field}
                                        placeholder="What will students learn in this video?"
                                        className="bg-input border-border min-h-32"
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <Controller
                            name="duration"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Duration (minutes)</FieldLabel>
                                    <Input
                                        {...field}
                                        type="number"
                                        min={1}
                                        placeholder="e.g. 15"
                                        className="bg-input border-border w-40"
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button
                        type="submit"
                        className="w-40 cursor-pointer text-foreground"
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending
                            ? (isEditing ? "Updating..." : "Saving...")
                            : (isEditing ? "Update Video" : "Save Video")
                        }
                    </Button>
                </div>
            </FieldGroup>
        </form>
    )
}