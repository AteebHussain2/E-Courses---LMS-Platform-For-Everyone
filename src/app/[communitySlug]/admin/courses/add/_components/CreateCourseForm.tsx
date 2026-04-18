"use client"

import CourseForm from "@/components/courses/CourseForm";
import { useCourseForm } from "@/hooks/use-course-form";

type CreateCourseFormProps = {
    communitySlug: string
}

const CreateCourseForm = ({ communitySlug }: CreateCourseFormProps) => {
    const courseForm = useCourseForm({ communitySlug })

    return (
        <CourseForm
            communitySlug={communitySlug}
            {...courseForm}
        />
    )
}

export default CreateCourseForm
