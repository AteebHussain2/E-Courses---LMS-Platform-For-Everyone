"use client"

import { PreviewCourseCard } from "@/components/courses/CourseCard";
import CourseForm from "@/components/courses/CourseForm";
import { useCourseForm } from "@/hooks/use-course-form";
import { useInstructor } from "@/hooks/use-instructor";
import { useWatch } from "react-hook-form";

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
    const { title, description, imageUrl, isActive, instructorId } = useWatch({
        control: form.control
    })
    const { data: instructor } = useInstructor(instructorId)

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <PreviewCourseCard
                course={{
                    id: 'once-again-demo-id-which-is-incorrect',
                    slug: 'once-again-demo-slug-here',
                    description: description ?? '',
                    imageUrl: files[0] ? URL.createObjectURL(files[0]) : imageUrl || '',
                    title: title || '',
                    isActive: isActive ?? false,
                    createdAt: new Date,
                    updatedAt: new Date,
                    instructor: {
                        avatar: instructor?.avatar || '',
                        firstName: instructor?.firstName || 'Full',
                        lastName: instructor?.lastName || 'Name',
                        userId: instructor?.userId || instructorId || 'demo-instructor-id',
                    },
                    community: { slug: communitySlug, id: 'demo-id-which-is-incorrect' },
                    _count: { modules: 0, enrollments: 0 },
                }}
            />

            <CourseForm
                className="col-span-1 md:col-span-2"
                communitySlug={communitySlug}
                form={form}
                files={files}
                {...courseForm}
            />
        </div>
    )
}

export default EditCourseForm
