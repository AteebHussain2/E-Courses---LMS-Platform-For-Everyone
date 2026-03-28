import CreateLessonButton from "@/components/courses/CreateLesson";
import CourseNotFound from "@/components/courses/CourseNotFound";
import { getCourseAction } from "@/actions/courses";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ManageCourse from "./_components/ManageCourse";

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

    const course = await getCourseAction(courseId, communitySlug).catch(() => null)
    if (!course) return <CourseNotFound
        title="Course Not Found"
        showSearch={false}
        backUrl={`${communitySlug}/admin/courses`}
        communitySlug={communitySlug}
    />;

    return (
        <>
            <div className="flex items-center justify-between">
                <Button
                    variant='ghost'
                    className='cursor-pointer bg-transparent text-sm'
                    asChild
                >
                    <Link href={`/${communitySlug}/courses`} className="flex items-center gap-2 text-muted">
                        <ArrowLeft />
                        <span>Go Back to Courses</span>
                    </Link>
                </Button>

                <CreateLessonButton communitySlug={communitySlug} courseId={courseId} />
            </div>

            <ManageCourse course={course} />
        </>
    )
}

export default ManageCoursePage
