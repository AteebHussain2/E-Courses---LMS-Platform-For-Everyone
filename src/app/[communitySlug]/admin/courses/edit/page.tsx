import CourseNotFound from "@/components/courses/CourseNotFound";
import EditCourseForm from "./_components/EditCourseForm";
import { getCourseAction } from "@/actions/courses";

type EditCoursePageProps = {
    params: Promise<{
        communitySlug: string,
    }>
    searchParams: Promise<{
        courseId: string
    }>
}

export default async function EditCoursePage({ params, searchParams }: EditCoursePageProps) {
    const { communitySlug } = await params
    const { courseId } = await searchParams

    const course = await getCourseAction(courseId, communitySlug).catch(() => null)
    if (!course) return <CourseNotFound
        title="Course Not Found"
        showSearch={false}
        backUrl={`${communitySlug}/admin/courses`}
        communitySlug={communitySlug}
    />

    return (
        <EditCourseForm
            communitySlug={communitySlug}
            courseId={courseId}
            defaultValues={{
                title: course.title,
                description: course.description ?? '',
                imageUrl: course.imageUrl ?? '',
                isActive: course.isActive,
                instructorId: course.instructor?.userId ?? ''
            }}
        />
    )
}