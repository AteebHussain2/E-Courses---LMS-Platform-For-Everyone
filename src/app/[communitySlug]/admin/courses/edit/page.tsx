import EditCourseForm from "./_components/EditCourseForm";
import { getCourseAction } from "@/actions/courses";
import { notFound } from "next/navigation";

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
    if (!course) return notFound()

    return (
        <EditCourseForm
            communitySlug={communitySlug}
            courseId={courseId}
            defaultValues={{
                title: course.title,
                description: course.description ?? '',
                imageUrl: course.imageUrl ?? '',
                isActive: course.isActive,
                instructorId: course.instructorId ?? ''
            }}
        />
    )
}