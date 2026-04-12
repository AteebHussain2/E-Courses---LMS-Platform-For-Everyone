"use client"

import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Megaphone, FileText, BarChart2, Plus, Trash2, Pin, Calendar } from "lucide-react";
import { createPostAction, PostWithDetails, updatePostAction } from "@/actions/posts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { uploadToImageKit } from "@/lib/helpers/uploadToImageKit";
import FileUpload from "@/components/inputs/FileUpload";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import { PostType } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { z } from "zod/v3";

const schema = z.object({
    title: z.string().min(3, "At least 3 characters").max(200),
    content: z.string().max(5000).optional(),
    type: z.enum(['POST', 'ANNOUNCEMENT', 'POLL']),
    isPinned: z.boolean(),
    scheduledAt: z.string().optional(),
    pollOptions: z.array(z.object({ text: z.string().min(1, "Option can't be empty") }))
        .optional()
})

type FormValues = z.infer<typeof schema>

const TYPE_META = {
    POST: { label: 'Post', icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
    ANNOUNCEMENT: { label: 'Announcement', icon: Megaphone, color: 'text-moderator-fg', bg: 'bg-moderator-bg' },
    POLL: { label: 'Poll', icon: BarChart2, color: 'text-instructor-fg', bg: 'bg-instructor-bg' },
}

type Props = {
    communitySlug: string
    authorId: string
    existingPost?: PostWithDetails | null
}

export default function PostForm({ communitySlug, authorId, existingPost }: Props) {
    const router = useRouter()
    const isEditing = !!existingPost
    const [imageFiles, setImageFiles] = useState<File[]>([])

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            title: existingPost?.title ?? '',
            content: existingPost?.content ?? '',
            type: (existingPost?.type as FormValues['type']) ?? PostType.POST,
            isPinned: existingPost?.isPinned ?? false,
            scheduledAt: existingPost?.publishedAt
                ? format(new Date(existingPost.publishedAt), "yyyy-MM-dd'T'HH:mm")
                : '',
            pollOptions: existingPost?.pollOptions?.map(o => ({ text: o.text })) ?? [
                { text: '' }, { text: '' }
            ]
        }
    })

    const { fields, append, remove } = useFieldArray({ control: form.control, name: 'pollOptions' })
    const watchType = form.watch('type')

    const mutation = useMutation({
        mutationFn: async (values: FormValues) => {
            let imageUrl = existingPost?.imageUrl ?? undefined
            if (imageFiles[0]) {
                const { imageUrls, errors } = await uploadToImageKit(imageFiles)
                if (errors.length > 0) throw new Error(`Upload failed: ${errors[0].error}`)
                imageUrl = imageUrls[0]
            }

            const payload = {
                title: values.title,
                content: values.content || undefined,
                type: values.type as PostType,
                imageUrl,
                isPinned: values.isPinned,
                publishedAt: values.scheduledAt || new Date().toISOString(),
                communitySlug,
                authorId,
                pollOptions: values.type === 'POLL'
                    ? values.pollOptions?.map(o => o.text).filter(Boolean)
                    : undefined
            }

            if (isEditing) return updatePostAction(existingPost!.id, payload)
            return createPostAction(payload)
        },
        onSuccess: () => {
            toast.success(isEditing ? "Post updated!" : "Post published!", { id: "post-form" })
            router.push(`/${communitySlug}/admin/posts`)
        },
        onError: (e) => toast.error(e.message, { id: "post-form" })
    })

    return (
        <form onSubmit={form.handleSubmit((v) => {
            toast.loading(isEditing ? "Saving..." : "Publishing...", { id: "post-form" })
            mutation.mutate(v)
        })}>
            <FieldGroup className="max-w-2xl space-y-5">
                {/* Type selector */}
                <div className="grid grid-cols-3 gap-3">
                    {(Object.entries(TYPE_META) as [FormValues['type'], typeof TYPE_META[keyof typeof TYPE_META]][]).map(([value, meta]) => {
                        const Icon = meta.icon
                        const active = watchType === value
                        return (
                            <button
                                key={value}
                                type="button"
                                onClick={() => form.setValue('type', value, { shouldDirty: true })}
                                className={cn(
                                    "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all cursor-pointer",
                                    active
                                        ? `border-current ${meta.color} ${meta.bg}`
                                        : "border-border bg-card text-muted hover:border-border/80"
                                )}
                            >
                                <Icon className="size-5" />
                                <span className="text-xs font-medium">{meta.label}</span>
                            </button>
                        )
                    })}
                </div>

                {/* Image (not for polls) */}
                {watchType !== 'POLL' && (
                    <FileUpload
                        title={watchType === 'ANNOUNCEMENT' ? "Announcement Banner" : "Post Image"}
                        files={imageFiles}
                        onFilesChange={setImageFiles}
                        existingUrls={existingPost?.imageUrl ? [existingPost.imageUrl] : []}
                        accept="image/*"
                    />
                )}

                {/* Core fields */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            {(() => { const Icon = TYPE_META[watchType].icon; return <Icon className={cn("size-4", TYPE_META[watchType].color)} /> })()}
                            {TYPE_META[watchType].label} Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <Controller name="title" control={form.control} render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel>Title</FieldLabel>
                                <Input {...field} placeholder="What's this about?" className="bg-input border-border" autoComplete="off" />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )} />

                        {watchType !== 'POLL' && (
                            <Controller name="content" control={form.control} render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Content</FieldLabel>
                                    <Textarea {...field} placeholder="Write something..." className="bg-input border-border min-h-36" />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )} />
                        )}

                        {/* Poll options */}
                        {watchType === 'POLL' && (
                            <div className="space-y-3">
                                <FieldLabel>Poll Options</FieldLabel>
                                {fields.map((field, i) => (
                                    <div key={field.id} className="flex items-center gap-2">
                                        <span className="text-xs font-mono text-muted w-5 text-right shrink-0">{i + 1}</span>
                                        <Input
                                            {...form.register(`pollOptions.${i}.text`)}
                                            placeholder={`Option ${i + 1}`}
                                            className="bg-input border-border flex-1"
                                        />
                                        {fields.length > 2 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-sm"
                                                className="cursor-pointer text-muted hover:text-destructive shrink-0"
                                                onClick={() => remove(i)}
                                            >
                                                <Trash2 className="size-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                {fields.length < 6 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="gap-1.5 text-muted cursor-pointer"
                                        onClick={() => append({ text: '' })}
                                    >
                                        <Plus className="size-3.5" />
                                        Add option
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Publishing options */}
                <Card>
                    <CardContent className="pt-5 space-y-4">
                        <Controller name="isPinned" control={form.control} render={({ field }) => (
                            <Field className="flex flex-row! items-center gap-3">
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="size-4! bg-input border-border"
                                />
                                <div>
                                    <FieldLabel className="flex items-center gap-1.5 cursor-pointer">
                                        <Pin className="size-3.5" />
                                        Pin this post
                                    </FieldLabel>
                                    <FieldDescription>Pinned posts appear at the top of the feed.</FieldDescription>
                                </div>
                            </Field>
                        )} />

                        <Controller name="scheduledAt" control={form.control} render={({ field }) => (
                            <Field>
                                <FieldLabel className="flex items-center gap-1.5">
                                    <Calendar className="size-3.5" />
                                    Schedule publish
                                    <span className="text-xs font-normal text-muted">(leave blank to publish now)</span>
                                </FieldLabel>
                                <Input
                                    type="datetime-local"
                                    className="bg-input border-border w-64"
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            </Field>
                        )} />
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex items-center gap-3 justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        className="cursor-pointer border-border"
                        onClick={() => router.push(`/${communitySlug}/admin/posts`)}
                        disabled={mutation.isPending || !form.formState.isDirty}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="cursor-pointer text-foreground w-36"
                        disabled={mutation.isPending || !form.formState.isDirty}
                    >
                        {mutation.isPending
                            ? (isEditing ? "Saving..." : "Publishing...")
                            : (isEditing ? "Save Changes" : "Publish Post")
                        }
                    </Button>
                </div>
            </FieldGroup>
        </form>
    )
}