import { CourseWithInstructorAndCount, ModuleWithLessons } from "@/lib/types";
import CourseModuleList from "@/components/home/CourseModuleList";
import { GraduationCap, BookOpen, Clock } from "lucide-react";
import { formatDate } from "date-fns";
import Image from "next/image";

type CourseDetailsProps = {
    course: CourseWithInstructorAndCount
    modules: ModuleWithLessons[]
    isEnrolled?: boolean
    communitySlug: string
}

const CourseDetails = ({ course, modules, isEnrolled = false, communitySlug }: CourseDetailsProps) => {
    // Only show published lessons in the public view
    const visibleModules = modules.map(m => ({
        ...m,
        lessons: m.lessons.filter(l =>
            isEnrolled || l.status === 'PUBLISHED'
        )
    }))

    const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0)
    const publishedLessons = modules.reduce(
        (acc, m) => acc + m.lessons.filter(l => l.status === 'PUBLISHED').length, 0
    )

    return (
        <div className="px-10 py-2 space-y-5 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                {course.description && (
                    <section className="space-y-2">
                        <h2 className="text-base font-semibold text-foreground font-heading">
                            About this course
                        </h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {course.description}
                        </p>
                    </section>
                )}

                {modules.length > 0 ? (
                    <CourseModuleList
                        modules={visibleModules}
                        isEnrolled={isEnrolled}
                        communitySlug={communitySlug}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 space-y-2">
                        <BookOpen className="size-8 text-muted/40" />
                        <p className="text-sm text-muted">Curriculum coming soon</p>
                    </div>
                )}
            </div>

            {/* Right — sticky course info card */}
            <div className="space-y-4">
                <div className="sticky top-24 space-y-4">
                    {course.instructor && (
                        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">
                                Instructor
                            </h3>
                            <div className="flex items-center gap-3">
                                {course.instructor.avatar && (
                                    <Image
                                        src={course.instructor.avatar}
                                        alt={course.instructor.firstName}
                                        width={44}
                                        height={44}
                                        className="rounded-full size-11 object-cover ring-2 ring-border"
                                    />
                                )}
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        {course.instructor.firstName} {course.instructor.lastName}
                                    </p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                        <GraduationCap className="size-3" />
                                        Instructor
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">
                            Course Details
                        </h3>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <BookOpen className="size-3.5" />
                                    Modules
                                </span>
                                <span className="font-medium text-foreground">{modules.length}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Clock className="size-3.5" />
                                    Lessons
                                </span>
                                <span className="font-medium text-foreground">
                                    {publishedLessons}
                                    {publishedLessons !== totalLessons && (
                                        <span className="text-muted-foreground font-normal"> / {totalLessons}</span>
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <GraduationCap className="size-3.5" />
                                    Students
                                </span>
                                <span className="font-medium text-foreground">
                                    {course._count.enrollments}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Clock className="size-3.5" />
                                    Published
                                </span>
                                <span className="font-medium text-foreground text-xs">
                                    {formatDate(course.createdAt, 'dd MMM yyyy')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {isEnrolled && (
                        <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                            <p className="text-sm text-green-400 font-medium flex items-center gap-2">
                                ✓ You're enrolled in this course
                            </p>
                            <p className="text-xs text-green-400/60 mt-1">
                                All lessons are unlocked for you.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CourseDetails
