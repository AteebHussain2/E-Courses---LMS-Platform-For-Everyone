"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLessonAction } from "@/actions/lessons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Video, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { redirect } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod/v3";

const schema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100),
    type: z.enum(['VIDEO', 'SESSION'])
})

type FormValues = z.infer<typeof schema>

type Props = {
    moduleId: string
    courseId: string
    communitySlug: string
}

export default function CreateLessonDialog({ moduleId, courseId, communitySlug }: Props) {
    const [open, setOpen] = useState(false)
    const queryClient = useQueryClient()

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { title: '', type: 'VIDEO' }
    })

    const mutation = useMutation({
        mutationFn: (values: FormValues) =>
            createLessonAction(values.title, values.type, moduleId, courseId, communitySlug),
        onSuccess: async (lesson) => {
            await queryClient.invalidateQueries({ queryKey: ['modules', courseId] })
            toast.success("Lesson created!")
            form.reset()
            setOpen(false)

            // redirect user to lesson page for more details
            redirect(`/${communitySlug}/admin/courses/manage/lesson?lessonId=${lesson.id}`)
        },
        onError: (error) => toast.error(error.message)
    })

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    className="w-full gap-2 border border-dashed border-border text-muted hover:text-foreground cursor-pointer mt-1"
                >
                    <Plus className="size-3.5" />
                    Add Lesson
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create Lesson</DialogTitle>
                    <DialogDescription>
                        Add a new lesson to this module.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-5"
                    onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
                >
                    <Controller
                        name="title"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel>Lesson Title</FieldLabel>
                                <Input
                                    {...field}
                                    placeholder="e.g. What is Machine Learning?"
                                    className="bg-input border-border"
                                    autoComplete="off"
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />

                    <Controller
                        name="type"
                        control={form.control}
                        render={({ field }) => (
                            <Field>
                                <FieldLabel>Lesson Type</FieldLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className="bg-input border-border">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="VIDEO">
                                            <div className="flex items-center gap-2">
                                                <Video className="size-3.5 text-primary" />
                                                Video Lesson
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="SESSION">
                                            <div className="flex items-center gap-2">
                                                <Radio className="size-3.5 text-instructor-fg" />
                                                Live Session
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                        )}
                    />

                    <div className="flex gap-3">
                        <Button
                            type="submit"
                            className="flex-1 cursor-pointer text-foreground"
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending ? "Creating..." : "Create Lesson"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="cursor-pointer border-border bg-input"
                            disabled={mutation.isPending}
                            onClick={() => { form.reset(); setOpen(false) }}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}