"use client"

import CourseForm from "@/components/courses/CourseForm";
import { useCourseForm } from "@/hooks/use-course-form";

type CreateCourseFormProps = {
    communitySlug: string
}

const CreateCourseForm = ({ communitySlug }: CreateCourseFormProps) => {
    const { form, files, ...courseForm } = useCourseForm({ communitySlug })

    return (
        <CourseForm
            communitySlug={communitySlug}
            files={files}
            form={form}
            {...courseForm}
        />
    )
}

export default CreateCourseForm
