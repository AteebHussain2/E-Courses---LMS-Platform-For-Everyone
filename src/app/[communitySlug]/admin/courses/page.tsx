import CoursesGrid from "@/components/courses/CoursesGrid";

type AdminCoursePageProps = {
    params: Promise<{
        communitySlug: string,
    }>
}

const AdminCoursesPage = async ({ params }: AdminCoursePageProps) => {
    const communitySlug = (await params).communitySlug

    return <CoursesGrid communitySlug={communitySlug} />
}

export default AdminCoursesPage
