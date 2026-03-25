import CoursesPage from "@/components/courses/CoursesPage";

type AdminCoursePageProps = {
    params: Promise<{
        communitySlug: string,
    }>
}

const AdminCoursesPage = async ({ params }: AdminCoursePageProps) => {
    const communitySlug = (await params).communitySlug

    return <CoursesPage communitySlug={communitySlug} />
}

export default AdminCoursesPage
