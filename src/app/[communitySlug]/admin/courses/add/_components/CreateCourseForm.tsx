"use client"

import { PreviewCourseCard } from "@/components/courses/CourseCard";
import CourseForm from "@/components/courses/CourseForm";
import { useCourseForm } from "@/hooks/use-course-form";
import { useInstructor } from "@/hooks/use-instructor";
import { useWatch } from "react-hook-form";

type EditCourseFormProps = {
    communitySlug: string
}

const CreateCourseForm = ({ communitySlug }: EditCourseFormProps) => {
    const { form, files, ...courseForm } = useCourseForm({ communitySlug })
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
                    imageUrl: files[0] ? URL.createObjectURL(files[0]) : imageUrl || '/placeholder-image.webp',
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
                files={files}
                form={form}
                {...courseForm}
            />
        </div>
    )
}

export default CreateCourseForm
