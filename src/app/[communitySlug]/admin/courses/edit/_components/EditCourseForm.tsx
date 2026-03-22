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
    const courseForm = useCourseForm({ communitySlug, courseId, defaultValues })

    return (
        <div className="grid grid-cols-3 gap-5">
            <div>
                TODO: Course Card
            </div>

            <CourseForm
                communitySlug={communitySlug}
                {...courseForm}
            />
        </div>
    )
}

export default EditCourseForm
