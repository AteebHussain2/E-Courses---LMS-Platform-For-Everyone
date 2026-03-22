"use client";

import { createCourseAction, updateCourseAction } from "@/actions/courses";
import { courseSchema, courseSchemaType } from "@/lib/schemas/course";
import { uploadToImageKit } from "@/lib/helpers/uploadToImageKit";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";

type UseCourseFormProps = {
    files?: File[]
    communitySlug: string
    defaultValues?: Partial<courseSchemaType>  // for edit page, pass existing data
    courseId?: string                           // present = edit mode, absent = create mode
}

export function useCourseForm({ communitySlug, defaultValues, courseId }: UseCourseFormProps) {
    const [files, setFiles] = useState<File[]>([])
    const router = useRouter()
    const isEditing = !!courseId

    const form = useForm<courseSchemaType>({
        resolver: zodResolver(courseSchema),
        defaultValues: defaultValues ?? {
            title: '',
            description: '',
            imageUrl: '',
            isActive: false,
            instructorId: ''
        }
    })

    const mutation = useMutation({
        mutationFn: async () => {
            const { imageUrls, errors } = await uploadToImageKit(files ?? []);
            if (!imageUrls || errors.length !== 0) {
                for (const error of errors)
                    throw new Error(`Could not upload image: ${error.fileName}\nReason: ${error.error}`);
            };
            form.setValue("imageUrl", imageUrls[0]);
            const values = form.getValues();

            isEditing
                ? await updateCourseAction(values, courseId, communitySlug)  // edit
                : await createCourseAction(values, communitySlug);            // create
        },
        onSuccess: () => {
            toast.success(isEditing ? "Course updated!" : "Course created!")
            router.push(`/${communitySlug}/admin/courses`)
        },
        onError: (error) => toast.error(error.message)
    })

    const onSubmit = () => mutation.mutate()

    return {
        form,
        onSubmit: form.handleSubmit(onSubmit),
        isLoading: mutation.isPending,
        isEditing,
        files,
        setFiles,
        onCancel: () => {
            form.reset()
            router.push(`/${communitySlug}/admin/courses`)
        }
    }
}