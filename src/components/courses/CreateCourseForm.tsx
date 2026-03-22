"use client";

import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { addCourseSchema, addCourseSchemaType } from "@/lib/validation/course";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import InstructorSelect from "@/components/inputs/InstructorSelect";
import { uploadToImageKit } from "@/lib/helpers/uploadToImageKit";
import { Card, CardContent } from "@/components/ui/card";
import FileUpload from "@/components/inputs/FileUpload";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { createCourse } from "@/actions/courses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CreateCourseForm = ({ communitySlug, className }: { communitySlug: string, className?: string }) => {
    const router = useRouter()
    const queryClient = useQueryClient()
    const [files, setFiles] = useState<File[]>([])

    const form = useForm<addCourseSchemaType>({
        resolver: zodResolver(addCourseSchema),
        defaultValues: {
            title: "",
            description: "",
            imageUrl: "",
            isActive: false,
            instructorId: ""
        },
        mode: "onChange",
    })

    const mutation = useMutation({
        mutationFn: async () => {
            const { imageUrls, errors } = await uploadToImageKit(files);
            if (!imageUrls || errors.length !== 0) {
                for (const error of errors)
                    throw new Error(`Could not upload image: ${error.fileName}\nReason: ${error.error}`);
            };

            form.setValue("imageUrl", imageUrls[0]);

            const data = await createCourse(form.getValues(), communitySlug)

            return { data, communitySlug }
        },
        onSuccess: ({ data, communitySlug }) => {
            toast.success("Course created!");
            queryClient.invalidateQueries({ queryKey: [communitySlug, `${data.isActive ? 'active-courses' : 'all-courses'}`] });
            router.push(`/${communitySlug}/admin/courses`);
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const onSubmit = async () => {
        mutation.mutate();
    }

    return (
        <form
            id="create-course-form"
            className={cn("space-y-5", className)}
            onSubmit={form.handleSubmit(onSubmit)}
        >
            <FieldGroup>
                <Controller
                    name="imageUrl"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FileUpload
                                {...field}
                                title="Add Course Photo"
                                files={files}
                                onFilesChange={setFiles}
                                aria-invalid={fieldState.invalid}
                                aria-errormessage={fieldState.error?.message}
                            />
                        </Field>
                    )}
                />
                <Card>
                    <CardContent className="space-y-5">
                        <Controller
                            name="title"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Course Title</FieldLabel>
                                    <Input
                                        {...field}
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Your course title..."
                                        className="bg-input! min-h-11 border-border border appearance-none"
                                        autoComplete="off"
                                        required
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="description"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Course Description</FieldLabel>
                                    <Textarea
                                        {...field}
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Your course description..."
                                        className="bg-input! border-border border appearance-none min-h-40"
                                        autoComplete="off"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />

                        <Controller
                            name="instructorId"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Instructor</FieldLabel>
                                    <InstructorSelect
                                        communitySlug={communitySlug}
                                        value={field.value}
                                        onChange={field.onChange}
                                        disabled={form.formState.isSubmitting}
                                    />
                                    <FieldDescription>
                                        Assign a member to manage course content.
                                    </FieldDescription>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <Controller
                            name="isActive"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field
                                    data-invalid={fieldState.invalid}
                                    className="flex flex-row! items-start"
                                >
                                    <Checkbox
                                        className="size-4! bg-input border-border mt-1! text-foreground! outline-2!"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        name={field.name}
                                        ref={field.ref}
                                        disabled={false}
                                    />
                                    <div className="space-y-1 leading-none">
                                        <FieldLabel>This will make your course accessible to public through your lms.</FieldLabel>
                                        <FieldDescription>
                                            Mark this only if your course is ready-to-learn.
                                        </FieldDescription>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </div>
                                </Field>
                            )}
                        />
                    </CardContent>
                </Card>
            </FieldGroup>

            <Field
                orientation="horizontal"
                className="items-center justify-end"
            >
                <Button
                    type="submit"
                    form="create-course-form"
                    className="text-foreground! cursor-pointer w-34 h-10"
                    disabled={mutation.isPending}
                >
                    {mutation.isPending ? "Creating..." : "Create Course"}
                </Button>
                <Button
                    type="button"
                    variant="destructive"
                    className="cursor-pointer w-34 h-10!"
                    onClick={() => {
                        form.reset()
                        router.push(`/${communitySlug}/admin/courses`)
                    }}
                    disabled={mutation.isPending}
                >
                    Cancel
                </Button>
            </Field>
        </form>
    )
}

export default CreateCourseForm
