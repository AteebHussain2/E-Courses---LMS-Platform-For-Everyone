import { PreviewCourseCard } from "@/components/courses/CourseCard";
import { EditCourseButton } from "@/components/CustomButtons";
import { CourseWithInstructorAndCount } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ManageCourseProps = {
    course: CourseWithInstructorAndCount
}

const ManageCourse = ({ course }: ManageCourseProps) => {

    return (
        <div className="grid grid-cols-3 gap-5">
            <div className="space-y-5">
                <PreviewCourseCard course={course} showButtons={false} />
                <EditCourseButton
                    courseId={course.id}
                    text="Edit Course"
                    className={cn("text-foreground! flex-1 w-full",
                        buttonVariants({ size: "default", variant: "default" })
                    )} />
            </div>

        </div>
    )
}

export default ManageCourse
