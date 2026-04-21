import StudentCourseCard from "@/components/courses/cards/StudentCourseCard";
import { getSavedCoursesAction } from "@/actions/library";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Bookmark } from "lucide-react";
import Link from "next/link";

type Props = {
    params: Promise<{ communitySlug: string }>
}

const LibraryPage = async ({ params }: Props) => {
    const { communitySlug } = await params
    const { userId } = await auth()

    if (!userId) redirect(`/sign-in`)

    const savedCourses = await getSavedCoursesAction(userId, communitySlug).catch(() => [])

    return (
        <div className="space-y-5 px-10 py-8">
            <div>
                <h1 className="text-2xl font-semibold text-foreground font-heading flex items-center gap-2.5">
                    <Bookmark className="size-5 text-primary" />
                    My Library
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    {savedCourses.length} saved course{savedCourses.length !== 1 ? 's' : ''}
                </p>
            </div>

            {savedCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-24 space-y-3">
                    <Bookmark className="size-8 text-muted/40" />
                    <p className="text-sm text-muted-foreground">No saved courses yet.</p>
                    <Link
                        href={`/${communitySlug}/courses`}
                        className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                        Browse courses →
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {savedCourses.map(course => (
                        <StudentCourseCard key={course.id} course={course} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default LibraryPage