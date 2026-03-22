"use client";

import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import InstructorSelect from "@/components/inputs/InstructorSelect";
import { Card, CardContent } from "@/components/ui/card";
import FileUpload from "@/components/inputs/FileUpload";
import { courseSchemaType } from "@/lib/schemas/course";
import { useCourseForm } from "@/hooks/use-course-form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Controller } from "react-hook-form";
import { cn } from "@/lib/utils";

type CourseFormProps = {
    communitySlug: string
    className?: string
} & ReturnType<typeof useCourseForm>

const CourseForm = ({ form, onSubmit, isLoading, isEditing, communitySlug, className, files, setFiles, onCancel }: CourseFormProps) => {
    return (
        <form
            id={isEditing ? "edit-course-form" : "create-course-form"}
            className={cn("space-y-5", className)}
            onSubmit={onSubmit}
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
                    form={isEditing ? "edit-course-form" : "create-course-form"}
                    className="text-foreground! cursor-pointer w-34 h-10"
                    disabled={isLoading}
                >
                    {isLoading ? (isEditing ? "Saving..." : "Creating...") : (isEditing ? "Save Changes" : "Create Course")}
                </Button>
                <Button
                    type="button"
                    variant="destructive"
                    className="cursor-pointer w-34 h-10!"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
            </Field>
        </form>
    )
}

export default CourseForm