import SessionsPage from "@/components/sessions/SessionPage";

type AdminCoursePageProps = {
    params: Promise<{
        communitySlug: string,
    }>
}

const AdminSessionsPage = async ({ params }: AdminCoursePageProps) => {
    const communitySlug = (await params).communitySlug

    return <SessionsPage communitySlug={communitySlug} />
}

export default AdminSessionsPage
