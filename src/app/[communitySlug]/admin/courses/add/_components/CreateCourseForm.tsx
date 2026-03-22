import CourseForm from "@/components/courses/CourseForm";
import { useCourseForm } from "@/hooks/use-course-form";

type EditCourseFormProps = {
    communitySlug: string
}

const CreateCourseForm = ({ communitySlug }: EditCourseFormProps) => {
    const courseForm = useCourseForm({ communitySlug })

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

export default CreateCourseForm
