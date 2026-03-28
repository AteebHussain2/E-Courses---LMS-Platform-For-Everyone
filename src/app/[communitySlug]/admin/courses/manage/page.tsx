import CourseNotFound from "@/components/courses/CourseNotFound"
import CreateLessonButton from "@/components/courses/CreateLesson"
import { redirect } from "next/navigation"

type ManageCoursePageProps = {
    params: Promise<{
        communitySlug: string,
    }>,
    searchParams: Promise<{
        courseId: string
    }>
}

const ManageCoursePage = async ({ params, searchParams }: ManageCoursePageProps) => {
    const communitySlug = (await params).communitySlug;
    const courseId = (await searchParams).courseId;

    if (!communitySlug) redirect('/');
    if (!courseId) redirect(`'${communitySlug}/admin/courses`);

    const course: string[] | undefined = undefined;
    if (!course) return <CourseNotFound
        title="Course Not Found"
        showSearch={false}
        backUrl={`${communitySlug}/admin/courses`}
        communitySlug={communitySlug}
    />;

    return (
        <div className="flex items-center justify-between">
            <CreateLessonButton communitySlug={communitySlug} courseId={courseId} />
        </div>
    )
}

export default ManageCoursePage
