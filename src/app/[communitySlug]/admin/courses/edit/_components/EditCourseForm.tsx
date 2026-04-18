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
        price: number,
    }
}

const EditCourseForm = ({ communitySlug, courseId, defaultValues }: EditCourseFormProps) => {
    const courseForm = useCourseForm({ communitySlug, courseId, defaultValues })

    return (
        <CourseForm
            communitySlug={communitySlug}
            {...courseForm}
        />
    )
}

export default EditCourseForm
