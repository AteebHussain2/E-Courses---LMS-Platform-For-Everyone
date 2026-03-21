"use client";

import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { addCourseSchema, addCourseSchemaType } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import FileUpload from "@/components/inputs/FileUpload";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const AddCoursesPage = () => {
    const form = useForm<addCourseSchemaType>({
        resolver: zodResolver(addCourseSchema),
        defaultValues: {
            title: "",
            description: "",
            imageUrl: "",
            // isActive: false,
        },
        mode: "onChange",
    })

    const onSubmit = (data: addCourseSchemaType) => {
        console.log(data)
    }

    return (
        <div className="grid grid-cols-3 gap-5">
            <div>
                Course Card
            </div>
            <form
                id="create-course-form"
                className="col-span-2 space-y-5"
                onSubmit={form.handleSubmit(onSubmit)}
            >
                <FieldGroup>
                    <Controller
                        name="imageUrl"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FileUpload
                                    aria-invalid={fieldState.invalid}
                                    aria-errormessage={fieldState.error?.message}
                                    title="Add Course Photo"
                                    multiple
                                    {...field}
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
                    >
                        Create Course
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        className="cursor-pointer w-34 h-10!"
                        onClick={() => form.reset()}
                    >
                        Cancel
                    </Button>
                </Field>
            </form>
        </div >
    )
}

export default AddCoursesPage
