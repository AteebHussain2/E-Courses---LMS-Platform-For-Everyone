"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { uploadToImageKit } from "@/lib/helpers/uploadToImageKit";
import { Controller, useForm, useWatch } from "react-hook-form";
import { CalendarClock, Link2, Radio } from "lucide-react";
import { SessionStatus } from "@/generated/prisma/enums";
import FileUpload from "@/components/inputs/FileUpload";
import PreviewSessionCard from "./PreviewSessionCard";
import { saveSessionAction } from "@/actions/lessons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Session } from "@/generated/prisma/browser";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod/v3";
import { redirect, useRouter } from "next/navigation";

const schema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100),
    description: z.string().max(2000).optional(),
    scheduledAt: z.string().min(1, "Schedule date and time is required"),
    duration: z.coerce.number().int().min(1, "Must be at least 1 minute").optional().or(z.literal('')),
    platformLink: z.string().url("Must be a valid URL").optional().or(z.literal('')),
    status: z.enum(['UPCOMING', 'LIVE', 'COMPLETED', 'CANCELLED']).default('UPCOMING') as z.ZodType<'UPCOMING' | 'LIVE' | 'COMPLETED' | 'CANCELLED'>,
})

type FormValues = z.infer<typeof schema>

type Props = {
    lessonId: string
    lessonTitle: string
    courseId: string
    communitySlug: string
    existingSession: Session | null
}

const STATUS_LABELS: Record<string, string> = {
    UPCOMING: 'Upcoming',
    LIVE: 'Live',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
}

export default function SessionForm({ lessonId, communitySlug, courseId, lessonTitle, existingSession }: Props) {
    const router = useRouter()
    const [thumbnailFiles, setThumbnailFiles] = useState<File[]>([])
    const isEditing = !!existingSession

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            title: existingSession?.title ?? lessonTitle,
            description: existingSession?.description ?? '',
            scheduledAt: existingSession?.scheduledAt
                ? format(new Date(existingSession.scheduledAt), "yyyy-MM-dd'T'HH:mm")
                : '',
            duration: existingSession?.duration ?? '',
            platformLink: existingSession?.platformLink ?? '',
            status: (existingSession?.status as FormValues['status']) ?? 'UPCOMING',
        }
    })

    // Feed live values to preview as the user types
    const watched = useWatch({ control: form.control })
    const previewThumbnail = thumbnailFiles[0]
        ? URL.createObjectURL(thumbnailFiles[0])
        : existingSession?.imageUrl

    const mutation = useMutation({
        mutationFn: async (values: FormValues) => {
            let imageUrl = existingSession?.imageUrl ?? undefined

            if (thumbnailFiles[0]) {
                const { imageUrls, errors } = await uploadToImageKit(thumbnailFiles)
                if (errors.length > 0) throw new Error(`Thumbnail upload failed: ${errors[0].error}`)
                imageUrl = imageUrls[0]
            }

            return saveSessionAction(lessonId, {
                title: values.title,
                description: values.description || undefined,
                scheduledAt: new Date(values.scheduledAt),
                duration: values.duration ? Number(values.duration) : undefined,
                platformLink: values.platformLink || undefined,
                status: values.status,
                imageUrl,
            })
        },
        onSuccess: () => {
            toast.success(isEditing ? "Session updated!" : "Session saved!", { id: "session-save" })
            setThumbnailFiles([])
            router.push(`/${communitySlug}/admin/courses/manage?courseId=${courseId}`)
        },
        onError: (error) => toast.error(error.message, { id: "session-save" })
    })

    // Build preview session object from live form values
    const previewSession = watched.scheduledAt ? {
        title: watched.title || lessonTitle,
        imageUrl: previewThumbnail,
        description: watched.description || null,
        scheduledAt: new Date(watched.scheduledAt),
        duration: watched.duration ? Number(watched.duration) : null,
        platformLink: watched.platformLink || null,
        status: watched.status === 'CANCELLED' ? SessionStatus.CANCELLED : SessionStatus.UPCOMING,
    } : null

    return (
        <form
            onSubmit={form.handleSubmit((v) => {
                toast.loading(isEditing ? "Updating session..." : "Saving session...", { id: "session-save" })
                mutation.mutate(v)
            })}
        >
            <FieldGroup className="grid grid-cols-3 gap-5">
                <div className="space-y-5 col-span-2">
                    {/* Thumbnail */}
                    <FileUpload
                        title="Session Thumbnail"
                        files={thumbnailFiles}
                        onFilesChange={setThumbnailFiles}
                        existingUrls={existingSession?.imageUrl ? [existingSession.imageUrl] : []}
                        accept="image/*"
                    />

                    {/* Core details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Radio className="size-4 text-instructor-fg" />
                                Session Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {/* Title */}
                            <Controller
                                name="title"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>Session Title</FieldLabel>
                                        <Input
                                            {...field}
                                            placeholder="e.g. Week 3: Building a Marketing Funnel"
                                            className="bg-input border-border"
                                            autoComplete="off"
                                        />
                                        <FieldDescription>
                                            Shown to students on the sessions calendar. Defaults to the lesson title.
                                        </FieldDescription>
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />

                            {/* Description */}
                            <Controller
                                name="description"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>Description</FieldLabel>
                                        <Textarea
                                            {...field}
                                            placeholder="Agenda, topics, pre-reads..."
                                            className="bg-input border-border min-h-28 max-h-full"
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />

                            {/* Status */}
                            <Controller
                                name="status"
                                control={form.control}
                                render={({ field }) => (
                                    <Field>
                                        <FieldLabel>Status</FieldLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className="bg-input border-border w-48">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Schedule */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <CalendarClock className="size-4 text-primary" />
                                Schedule
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {/* Scheduled at */}
                                <Controller
                                    name="scheduledAt"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel>Date & Time</FieldLabel>
                                            <Input
                                                type="datetime-local"
                                                className="bg-input border-border"
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />

                                {/* Duration */}
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
                                                placeholder="e.g. 90"
                                                className="bg-input border-border"
                                            />
                                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                        </Field>
                                    )}
                                />
                            </div>

                            {/* Platform link */}
                            <Controller
                                name="platformLink"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>
                                            <Link2 className="size-3.5" />
                                            Platform Link
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                                            className="bg-input border-border"
                                            autoComplete="off"
                                        />
                                        <FieldDescription>
                                            Zoom, Google Meet, or any join URL. Shown to enrolled students at session time.
                                        </FieldDescription>
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-5">
                    <div className="space-y-5 sticky top-24">
                        {/* Live preview — sticky */}
                        <div className="lg:col-span-1">
                            <PreviewSessionCard
                                communitySlug={communitySlug}
                                lessonId={lessonId}
                                lessonTitle={lessonTitle}
                                session={previewSession}
                            />
                        </div>

                        <div className="flex justify-end col-span-full">
                            {!form.formState.isDirty && (
                                <span className="text-sm text-muted mr-2 my-auto">
                                    No changes to save
                                </span>
                            )}
                            <Button
                                type="submit"
                                className="w-40 cursor-pointer text-foreground"
                                disabled={mutation.isPending || !form.formState.isDirty}
                            >
                                {mutation.isPending
                                    ? (isEditing ? "Updating..." : "Saving...")
                                    : (isEditing ? "Update Session" : "Save Session")
                                }
                            </Button>
                        </div>
                    </div>
                </div>
            </FieldGroup>
        </form>
    )
}