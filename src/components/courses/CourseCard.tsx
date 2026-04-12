import { CourseManageButton } from "@/components/custom/buttons/CourseManageButton";
import { CourseDeleteButton } from "@/components/custom/buttons/CourseDeleteButton";
import { Book, Clock, Globe2, GlobeX, GraduationCap, Users2 } from "lucide-react";
import { CourseEditButton } from "@/components/custom/buttons/CourseEditButton";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { formatDate, formatDistanceToNow } from "date-fns";
import { CourseWithInstructorAndCount } from "@/lib/types";
import { Role } from "@/generated/prisma/enums";
import CustomBadge from "../CustomBadge";
import Image from "next/image";

export const AdminCourseCard = ({ course }: { course: CourseWithInstructorAndCount }) => {
    return (
        <Card className="w-full h-fit p-0! pb-3! gap-4!">
            <CardHeader className="p-0!">
                <Image
                    src={course.imageUrl}
                    alt={course.title}
                    width={380}
                    height={300}
                    className="w-full aspect-video object-cover"
                />
            </CardHeader>
            <CardContent className="items-start py-0! px-4! space-y-4">
                <div className="space-y-3">
                    <h4 className="text-lg font-normal line-clamp-2">
                        {course.title}
                    </h4>
                </div>

                <div className="w-full flex items-center flex-wrap gap-2">
                    <CustomBadge
                        icon={Clock}
                        text={formatDate(course.updatedAt ?? course.createdAt, 'dd MMMM, yyyy')}
                        tooltip={`Updated ${formatDistanceToNow(course.updatedAt ?? course.createdAt, { addSuffix: true })}`}
                    />
                    <CustomBadge
                        icon={Book}
                        text={course._count.modules}
                        tooltip={`${course._count.modules} modules in total.`}
                    />
                    <CustomBadge
                        icon={Users2}
                        text={course._count.enrollments}
                        tooltip={`${course._count.enrollments} students enrolled.`}
                    />
                    <CustomBadge
                        icon={course.isActive ? Globe2 : GlobeX}
                        text={course.isActive ? "Public" : "Private"}
                    />
                    <CustomBadge
                        icon={GraduationCap}
                        text={`${course.instructor?.firstName} ${course.instructor?.lastName}`}
                        tooltip={`${course.instructor?.firstName} ${course.instructor?.lastName} is teaching this course.`}
                        variant={Role.INSTRUCTOR}
                    />
                </div>
            </CardContent>

            <CardFooter className="flex flex-1 items-center gap-2">
                <CourseManageButton className="flex-1" courseId={course.id} />
                <CourseEditButton courseId={course.id} />
                <CourseDeleteButton courseSlug={course.slug} courseId={course.id} communitySlug={course.community.slug} />
            </CardFooter>
        </Card>
    )
}

export const PreviewCourseCard = ({ course, showButtons = true }: { course: CourseWithInstructorAndCount, showButtons?: boolean }) => {
    return (
        <Card className="w-full h-fit p-0! pb-3! gap-4!">
            <CardHeader className="p-0!">
                <Image
                    src={course.imageUrl}
                    alt={course.title || 'course hero image'}
                    width={380}
                    height={300}
                    className="w-full aspect-video object-cover flex items-center justify-center border-b border-border bg-secondary/2"
                />
            </CardHeader>
            <CardContent className="items-start py-0! px-4! space-y-4">
                <div className="space-y-3">
                    <h4 className="text-lg font-normal line-clamp-2">
                        {course.title}
                    </h4>
                </div>

                <div className="w-full flex items-center flex-wrap gap-2">
                    <CustomBadge
                        icon={Clock}
                        text={formatDate(course.updatedAt ?? course.createdAt, 'dd MMMM, yyyy')}
                        tooltip={`Updated ${formatDistanceToNow(course.updatedAt ?? course.createdAt, { addSuffix: true })}`}
                    />
                    <CustomBadge
                        icon={Book}
                        text={course._count.modules}
                        tooltip={`${course._count.modules} modules in total.`}
                    />
                    <CustomBadge
                        icon={Users2}
                        text={course._count.enrollments}
                        tooltip={`${course._count.modules} students enrolled.`}
                    />
                    <CustomBadge
                        icon={course.isActive ? Globe2 : GlobeX}
                        text={course.isActive ? "Public" : "Private"}
                    />
                    <CustomBadge
                        icon={GraduationCap}
                        text={`${course.instructor?.firstName} ${course.instructor?.lastName}`}
                        tooltip={`${course.instructor?.firstName} ${course.instructor?.lastName} is teaching this course.`}
                        variant={Role.INSTRUCTOR}
                    />
                </div>
            </CardContent>

            {showButtons && <CardFooter className="max-w-inherit flex items-center gap-2">
                <CourseManageButton className="flex-1" courseId={course.id} disabled />
                <CourseDeleteButton courseSlug={course.slug} courseId={course.id} communitySlug={course.community.slug} disabled />
            </CardFooter>}
        </Card>
    )
}