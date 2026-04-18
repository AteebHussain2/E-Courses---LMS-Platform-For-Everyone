"use client";

import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import InstructorSelect from "@/components/inputs/InstructorSelect";
import PreviewCourseCard from "./cards/PreviewCourseCard";
import { Card, CardContent } from "@/components/ui/card";
import { useCourseForm } from "@/hooks/use-course-form";
import FileUpload from "@/components/inputs/FileUpload";
import { useInstructor } from "@/hooks/use-instructor";
import { Controller, useWatch } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

type CourseFormProps = {
    communitySlug: string
    className?: string
} & ReturnType<typeof useCourseForm>

const CourseForm = ({ form, onSubmit, isLoading, isEditing, communitySlug, className, files, setFiles, onCancel }: CourseFormProps) => {

    const { title, description, imageUrl, isActive, instructorId, price } = useWatch({ control: form.control })
    const { data: instructor } = useInstructor(instructorId)

    return (
        <form
            id={isEditing ? "edit-course-form" : "create-course-form"}
            className={cn("space-y-5", "grid grid-cols-1 md:grid-cols-3 gap-5", className)}
            onSubmit={onSubmit}
        >
            <FieldGroup
                className="col-span-1 md:col-span-2"
            >
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
                                existingUrls={isEditing ? [form.getValues('imageUrl')] : []}
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

                        <div className="grid grid-cols-2 gap-4">
                            <Controller
                                name="price"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>Price (RS)</FieldLabel>
                                        <div className="relative">
                                            <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                            <Input
                                                {...field}
                                                type="number"
                                                min={0}
                                                placeholder="Free"
                                                className="bg-input! min-h-11 border-border border appearance-none! pl-7"
                                            />
                                        </div>
                                        <FieldDescription>Leave empty for free</FieldDescription>
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
                        </div>
                    </CardContent>
                </Card>
            </FieldGroup>


            <div className="relative">
                <div className="sticky top-24 space-y-5">
                    <p className="text-xs font-medium text-muted uppercase tracking-wider">Preview</p>
                    <PreviewCourseCard
                        showButtons={true}
                        course={{
                            id: 'once-again-demo-id-which-is-incorrect',
                            slug: 'once-again-demo-slug-here',
                            description: description ?? '',
                            imageUrl: files[0] ? URL.createObjectURL(files[0]) : imageUrl || '/placeholder-image.webp',
                            price: price ?? 0,
                            title: title || '',
                            isActive: isActive ?? false,
                            createdAt: new Date,
                            updatedAt: new Date,
                            instructor: {
                                avatar: instructor?.avatar || '/placeholder-avatar.png',
                                firstName: instructor?.firstName || 'Full',
                                lastName: instructor?.lastName || 'Name',
                                userId: instructor?.userId || instructorId || 'demo-instructor-id',
                            },
                            community: { slug: communitySlug, id: 'demo-id-which-is-incorrect' },
                            _count: { modules: 0, enrollments: 0 },
                        }}
                    />
                    <Field
                        orientation="vertical"
                        className="items-center"
                    >
                        <Button
                            type="submit"
                            form={isEditing ? "edit-course-form" : "create-course-form"}
                            className="text-foreground! cursor-pointer flex-1 min-h-10!"
                            disabled={isLoading}
                        >
                            {isLoading ? (isEditing ? "Saving..." : "Creating...") : (isEditing ? "Save Changes" : "Create Course")}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full cursor-pointer border-border min-h-10! flex-1"
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                    </Field>
                </div>
            </div>
        </form>
    )
}

export default CourseForm