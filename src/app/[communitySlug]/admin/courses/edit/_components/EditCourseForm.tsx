"use client"

import CourseForm from "@/components/courses/CourseForm";
import { useCourseForm } from "@/hooks/use-course-form";

type EditCourseFormProps = {
    communitySlug: string,
    courseId: string,
    defaultValues: {
        title: string,
        description: string,
        imageUrl: string,
        isActive: boolean,
        instructorId: string,
    }
}

const EditCourseForm = ({ communitySlug, courseId, defaultValues }: EditCourseFormProps) => {
    const { form, files, ...courseForm } = useCourseForm({ communitySlug, courseId, defaultValues })

    return (
        <CourseForm
            communitySlug={communitySlug}
            form={form}
            files={files}
            {...courseForm}
        />
    )
}

export default EditCourseForm
