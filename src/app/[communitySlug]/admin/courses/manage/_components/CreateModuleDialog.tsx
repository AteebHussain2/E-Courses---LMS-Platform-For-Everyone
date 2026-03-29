"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createModuleAction } from "@/actions/modules";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod/v3";

const schema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100)
})

type FormValues = z.infer<typeof schema>

type Props = {
    courseId: string
    communitySlug: string
}

export default function CreateModuleDialog({ courseId, communitySlug }: Props) {
    const [open, setOpen] = useState(false)
    const queryClient = useQueryClient()

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { title: '' }
    })

    const mutation = useMutation({
        mutationFn: (values: FormValues) => createModuleAction(values.title, courseId, communitySlug),
        onSuccess: async () => {
            toast.success("Module created!")
            await queryClient.invalidateQueries({ queryKey: ['modules', courseId] })
            form.reset()
            setOpen(false)
        },
        onError: (error) => toast.error(error.message)
    })

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button type="button" variant="outline" className="gap-2 border-border bg-input cursor-pointer">
                    <Plus className="size-4" />
                    Add Module
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create Module</DialogTitle>
                    <DialogDescription>
                        Add a new module to organize your course lessons.
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
                                <FieldLabel>Module Title</FieldLabel>
                                <Input
                                    {...field}
                                    placeholder="e.g. Introduction to the course"
                                    className="bg-input border-border"
                                    autoComplete="off"
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />

                    <div className="flex gap-3">
                        <Button
                            type="submit"
                            className="flex-1 cursor-pointer text-foreground"
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending ? "Creating..." : "Create Module"}
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            className="cursor-pointer border-border bg-input"
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