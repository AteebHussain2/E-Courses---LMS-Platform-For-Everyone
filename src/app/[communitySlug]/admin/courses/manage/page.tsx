import ManageCourseClient from "./_components/ManageCourseClient";
import CourseNotFound from "@/components/courses/CourseNotFound";
import { getCourseAction } from "@/actions/courses";
import { redirect } from "next/navigation";

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
    if (!courseId) redirect(`/${communitySlug}/admin/courses`);

    const course = await getCourseAction(courseId, communitySlug).catch(() => null)
    if (!course) return <CourseNotFound
        title="Course Not Found"
        showSearch={false}
        backUrl={`${communitySlug}/admin/courses`}
        communitySlug={communitySlug}
    />;

    return (
        <ManageCourseClient
            course={course}
            communitySlug={communitySlug}
        />
    )
}

export default ManageCoursePage
