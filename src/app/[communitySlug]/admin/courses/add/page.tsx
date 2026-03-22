import CreateCourseForm from "./_components/CreateCourseForm";

type PageProps = {
    params: Promise<{
        communitySlug: string
    }>
}

const AddCoursesPage = async ({ params }: PageProps) => {
    const communitySlug = (await params).communitySlug

    return (
        <CreateCourseForm
            communitySlug={communitySlug}
        />
    )
}

export default AddCoursesPage
