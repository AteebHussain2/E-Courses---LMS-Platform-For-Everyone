"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateModuleAction } from "@/actions/modules";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod/v3";

const schema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100)
})

type FormValues = z.infer<typeof schema>

type Props = {
    moduleId: string
    courseId: string
    communitySlug: string
    currentTitle: string
}

export default function EditModuleDialog({ moduleId, courseId, communitySlug, currentTitle }: Props) {
    const [open, setOpen] = useState(false)
    const queryClient = useQueryClient()

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { title: currentTitle }
    })

    // Sync form if currentTitle changes (e.g. optimistic update from parent)
    useEffect(() => {
        if (open) form.reset({ title: currentTitle })
    }, [open, currentTitle])

    const mutation = useMutation({
        mutationFn: (values: FormValues) =>
            updateModuleAction(moduleId, values.title, communitySlug),
        onSuccess: async () => {
            toast.success("Module updated!")
            await queryClient.invalidateQueries({ queryKey: ['modules', courseId] })
            setOpen(false)
        },
        onError: (error) => toast.error(error.message)
    })

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-7 cursor-pointer text-foreground hover:text-foreground"
                >
                    <Pencil className="size-3.5" />
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Module</DialogTitle>
                    <DialogDescription>
                        Update the module title. The slug will be regenerated automatically.
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
                                    autoFocus
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
                            {mutation.isPending ? "Saving..." : "Save Changes"}
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