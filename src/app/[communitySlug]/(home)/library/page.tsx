import SavedSessionCard from "@/components/courses/cards/SavedSessionCard";
import SavedCourseCard from "@/components/courses/cards/SavedCourseCard";
import { getSavedDataAction } from "@/actions/library";
import { ArrowRight, Bookmark } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

type Props = {
    params: Promise<{ communitySlug: string }>
}

const LibraryPage = async ({ params }: Props) => {
    const { communitySlug } = await params
    const { userId } = await auth()

    if (!userId) redirect(`/sign-in`)

    const { courses: savedCourses, sessions: savedSessions } = await getSavedDataAction(userId, communitySlug).catch(() => ({ courses: [], sessions: [] }))

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
                        Browse courses <ArrowRight className="size-4" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {savedCourses.map(data => (
                        <SavedCourseCard key={data.course.id} course={data.course} />
                    ))}
                </div>
            )}

            {savedCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-24 space-y-3">
                    <Bookmark className="size-8 text-muted/40" />
                    <p className="text-sm text-muted-foreground">No saved courses yet.</p>
                    <Link
                        href={`/${communitySlug}/courses`}
                        className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                        Browse courses <ArrowRight className="size-4" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {savedSessions.map(data => (
                        <SavedSessionCard key={data.session.id} session={data.session} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default LibraryPage