"use client"

import { createSessionAction, getCoursesForCommunity, getSessionLessonsForCourse, updateSessionAction } from "@/actions/sessions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { SESSION_STATUS_LABELS, SESSION_STATUS_STYLES, getSessionStatus } from "@/lib/session-status";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock, Link2, Radio, Unlink, Video } from "lucide-react";
import { uploadToImageKit } from "@/lib/helpers/uploadToImageKit";
import { format, isFuture, formatDistanceToNow } from "date-fns";
import { Controller, useForm, useWatch } from "react-hook-form";
import { SessionStatus } from "@/generated/prisma/enums";
import FileUpload from "@/components/inputs/FileUpload";
import { SessionWithDetails } from "@/actions/sessions";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";
import { z } from "zod/v3";

const schema = z.object({
    title: z.string().min(3, "At least 3 characters").max(100),
    description: z.string().max(2000).optional(),
    scheduledAt: z.string().min(1, "Date and time is required"),
    duration: z.coerce.number().int().min(1, "At least 1 minute").optional().or(z.literal('')),
    platformLink: z.string().url("Must be a valid URL").optional().or(z.literal('')),
    status: z.enum(['UPCOMING', 'LIVE', 'COMPLETED', 'CANCELLED']).default('UPCOMING') as z.ZodType<'UPCOMING' | 'LIVE' | 'COMPLETED' | 'CANCELLED'>,
    courseId: z.string().optional(),
    lessonId: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

type Props = {
    communitySlug: string
    existingSession?: SessionWithDetails | null
}

type Course = { id: string; title: string; slug: string }
type Lesson = { id: string; title: string; slug: string; sessionId: string | null; module: { title: string } }

export default function StandaloneSessionForm({ communitySlug, existingSession }: Props) {
    const router = useRouter()
    const isEditing = !!existingSession
    const [thumbnailFiles, setThumbnailFiles] = useState<File[]>([])
    const [courses, setCourses] = useState<Course[]>([])
    const [lessons, setLessons] = useState<Lesson[]>([])
    const [loadingLessons, setLoadingLessons] = useState(false)

    // Resolve default linked lesson/course
    const defaultCourseId = existingSession?.lesson?.module?.course?.id ?? ''
    const defaultLessonId = existingSession?.lesson?.id ?? ''

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            title: existingSession?.title ?? '',
            description: existingSession?.description ?? '',
            scheduledAt: existingSession?.scheduledAt
                ? format(new Date(existingSession.scheduledAt), "yyyy-MM-dd'T'HH:mm")
                : '',
            duration: existingSession?.duration ?? '',
            platformLink: existingSession?.platformLink ?? '',
            status: (existingSession?.status as FormValues['status']) ?? 'UPCOMING',
            courseId: defaultCourseId,
            lessonId: defaultLessonId,
        }
    })

    const watched = useWatch({ control: form.control })
    const previewThumbnail = thumbnailFiles[0] ? URL.createObjectURL(thumbnailFiles[0]) : existingSession?.imageUrl

    // Load courses on mount
    useEffect(() => {
        getCoursesForCommunity(communitySlug).then(setCourses)
    }, [communitySlug])

    // Load SESSION lessons when course changes
    useEffect(() => {
        const courseId = watched.courseId
        if (!courseId) { setLessons([]); return }
        setLoadingLessons(true)
        getSessionLessonsForCourse(courseId, existingSession?.id)
            .then(setLessons)
            .finally(() => setLoadingLessons(false))
    }, [watched.courseId, existingSession?.id])

    const mutation = useMutation({
        mutationFn: async (values: FormValues) => {
            let imageUrl = existingSession?.imageUrl ?? undefined
            if (thumbnailFiles[0]) {
                const { imageUrls, errors } = await uploadToImageKit(thumbnailFiles)
                if (errors.length > 0) throw new Error(`Upload failed: ${errors[0].error}`)
                imageUrl = imageUrls[0]
            }

            const payload = {
                title: values.title,
                description: values.description || undefined,
                scheduledAt: new Date(values.scheduledAt),
                duration: values.duration ? Number(values.duration) : undefined,
                platformLink: values.platformLink || undefined,
                status: values.status,
                communitySlug,
                imageUrl,
                lessonId: values.lessonId || undefined,
                // If editing and lessonId is cleared, unlink
                unlinkLesson: isEditing && !values.lessonId && !!existingSession?.lesson,
            }

            if (isEditing) {
                return updateSessionAction(existingSession!.id, payload)
            } else {
                return createSessionAction(payload)
            }
        },
        onSuccess: () => {
            toast.success(isEditing ? "Session updated!" : "Session created!", { id: "session-form" })
            router.push(`/${communitySlug}/admin/sessions`)
        },
        onError: (error) => toast.error(error.message, { id: "session-form" })
    })

    // Build live preview
    const previewStatus = getSessionStatus({
        scheduledAt: watched.scheduledAt ? new Date(watched.scheduledAt) : new Date(),
        status: (watched.status as SessionStatus) ?? SessionStatus.UPCOMING,
        duration: watched.duration ? Number(watched.duration) : null
    })
    const previewScheduledAt = watched.scheduledAt ? new Date(watched.scheduledAt) : null

    return (
        <form
            onSubmit={form.handleSubmit((v) => {
                toast.loading(isEditing ? "Updating..." : "Creating...", { id: "session-form" })
                mutation.mutate(v)
            })}
        >
            <FieldGroup className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Left: form fields */}
                <div className="lg:col-span-2 space-y-5">
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
                            <Controller name="title" control={form.control} render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Title</FieldLabel>
                                    <Input {...field} placeholder="e.g. Week 3: Building a Marketing Funnel" className="bg-input border-border" autoComplete="off" />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )} />

                            <Controller name="description" control={form.control} render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Description</FieldLabel>
                                    <Textarea {...field} placeholder="Agenda, topics, pre-reads..." className="bg-input border-border min-h-28" />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )} />

                            <Controller name="status" control={form.control} render={({ field }) => (
                                <Field>
                                    <FieldLabel>Status</FieldLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="bg-input border-border w-48">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(['UPCOMING', 'LIVE', 'COMPLETED', 'CANCELLED'] as const).map(s => (
                                                <SelectItem key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>
                            )} />
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
                                <Controller name="scheduledAt" control={form.control} render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>Date & Time</FieldLabel>
                                        <Input type="datetime-local" className="bg-input border-border" value={field.value} onChange={field.onChange} />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )} />

                                <Controller name="duration" control={form.control} render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>Duration (minutes)</FieldLabel>
                                        <Input {...field} type="number" min={1} placeholder="e.g. 90" className="bg-input border-border" />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )} />
                            </div>

                            <Controller name="platformLink" control={form.control} render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel><Link2 className="size-3.5" />Platform Link</FieldLabel>
                                    <Input {...field} placeholder="https://zoom.us/j/... or https://meet.google.com/..." className="bg-input border-border" autoComplete="off" />
                                    <FieldDescription>Zoom, Google Meet, or any join URL.</FieldDescription>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )} />
                        </CardContent>
                    </Card>

                    {/* Link to course lesson */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Video className="size-4 text-primary" />
                                Link to Course Lesson
                                <span className="text-xs font-normal text-muted ml-1">(optional)</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-xs text-muted">
                                Link this session to a SESSION-type lesson inside a course. Students will find it there.
                            </p>

                            <Controller name="courseId" control={form.control} render={({ field }) => (
                                <Field>
                                    <FieldLabel>Course</FieldLabel>
                                    <Select
                                        value={field.value}
                                        onValueChange={(v) => {
                                            field.onChange(v === 'none' ? '' : v)
                                            form.setValue('lessonId', '')
                                        }}
                                    >
                                        <SelectTrigger className="bg-input border-border">
                                            <SelectValue placeholder="Select a course..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No course</SelectItem>
                                            {courses.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>
                            )} />

                            {watched.courseId && watched.courseId !== 'none' && (
                                <Controller name="lessonId" control={form.control} render={({ field }) => (
                                    <Field>
                                        <FieldLabel>Lesson</FieldLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={(v) => field.onChange(v === 'none' ? '' : v)}
                                            disabled={loadingLessons}
                                        >
                                            <SelectTrigger className="bg-input border-border">
                                                <SelectValue placeholder={loadingLessons ? "Loading..." : "Select a lesson..."} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">No lesson</SelectItem>
                                                {lessons.map(l => (
                                                    <SelectItem key={l.id} value={l.id}>
                                                        <span className="text-muted text-xs mr-1">{l.module.title} ·</span>
                                                        {l.title}
                                                    </SelectItem>
                                                ))}
                                                {lessons.length === 0 && !loadingLessons && (
                                                    <SelectItem value="none" disabled>No available SESSION lessons</SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FieldDescription>
                                            Only SESSION-type lessons without an existing session are shown.
                                        </FieldDescription>
                                    </Field>
                                )} />
                            )}

                            {/* Show current link if editing */}
                            {isEditing && existingSession?.lesson && !watched.lessonId && (
                                <div className="flex items-center gap-2 text-xs text-muted px-3 py-2 rounded-lg bg-muted/30 border border-border">
                                    <Unlink className="size-3 shrink-0" />
                                    <span>Currently linked to: <strong className="text-foreground">{existingSession.lesson.module.course.title} · {existingSession.lesson.title}</strong></span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right: sticky preview + save */}
                <div className="space-y-5">
                    <div className="sticky top-24 space-y-5">
                        {/* Live preview card */}
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-muted uppercase tracking-wider">Preview</p>
                            <Card className="p-0! pb-4! gap-3! overflow-hidden">
                                <div className="relative w-full aspect-video bg-muted flex items-center justify-center">
                                    {previewThumbnail ? (
                                        <Image src={previewThumbnail} alt="preview" fill className="object-cover" />
                                    ) : (
                                        <Radio className="size-10 text-muted-foreground/20" strokeWidth={1} />
                                    )}
                                    <div className={cn(
                                        "absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide",
                                        SESSION_STATUS_STYLES[previewStatus],
                                        previewStatus === SessionStatus.LIVE && "animate-pulse"
                                    )}>
                                        {SESSION_STATUS_LABELS[previewStatus]}
                                    </div>
                                </div>

                                <div className="px-4 space-y-2">
                                    <p className="text-sm font-medium line-clamp-2">
                                        {watched.title || <span className="text-muted">Session title...</span>}
                                    </p>
                                    {previewScheduledAt && (
                                        <div className="flex items-center gap-1.5 text-xs text-muted">
                                            <CalendarClock className="size-3" />
                                            <span>{format(previewScheduledAt, "dd MMM yyyy · h:mm a")}</span>
                                            {watched.duration && <span className="text-muted/60">· {watched.duration}m</span>}
                                        </div>
                                    )}
                                    {previewScheduledAt && isFuture(previewScheduledAt) && previewStatus !== SessionStatus.CANCELLED && (
                                        <p className="text-xs text-primary font-medium">
                                            Starts {formatDistanceToNow(previewScheduledAt, { addSuffix: true })}
                                        </p>
                                    )}
                                    {watched.description && (
                                        <p className="text-xs text-muted line-clamp-2">{watched.description}</p>
                                    )}
                                    {watched.lessonId && watched.lessonId !== 'none' && lessons.find(l => l.id === watched.lessonId) && (
                                        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-primary/5 border border-primary/10 text-xs text-primary">
                                            <Video className="size-3 shrink-0" />
                                            <span className="truncate">
                                                {lessons.find(l => l.id === watched.lessonId)?.title}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>

                        {/* Save buttons */}
                        <div className="space-y-2">
                            {!form.formState.isDirty && isEditing && (
                                <p className="text-xs text-muted text-center">No changes to save</p>
                            )}
                            <Button
                                type="submit"
                                className="w-full cursor-pointer text-foreground"
                                disabled={mutation.isPending || (isEditing && !form.formState.isDirty)}
                            >
                                {mutation.isPending
                                    ? (isEditing ? "Updating..." : "Creating...")
                                    : (isEditing ? "Update Session" : "Create Session")
                                }
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full cursor-pointer border-border"
                                onClick={() => router.push(`/${communitySlug}/admin/sessions`)}
                                disabled={mutation.isPending}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            </FieldGroup>
        </form>
    )
}