import CreateCourseForm from "@/components/courses/CreateCourseForm"

type PageProps = {
    params: Promise<{
        communitySlug: string
    }>
}

const AddCoursesPage = async ({ params }: PageProps) => {
    const communitySlug = (await params).communitySlug

    return (
        <div className="grid grid-cols-3 gap-5">
            <div>
                Course Card
            </div>

            <CreateCourseForm
                communitySlug={communitySlug}
                className="col-span-2"
            />
        </div>
    )
}

export default AddCoursesPage
