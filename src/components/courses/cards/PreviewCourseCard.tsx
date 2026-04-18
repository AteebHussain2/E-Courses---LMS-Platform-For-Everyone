import { Book, Clock, DollarSign, Globe2, GlobeX, GraduationCap, Users2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDate, formatDistanceToNow } from "date-fns";
import { CourseWithInstructorAndCount } from "@/lib/types";
import CustomBadge from "@/components/CustomBadge";
import { Role } from "@/generated/prisma/enums";
import Image from "next/image";

const PreviewCourseCard = ({ course, showButtons = true }: { course: CourseWithInstructorAndCount, showButtons?: boolean }) => {
    return (
        <Card className="w-full h-fit p-0! pb-3! gap-4!">
            <CardHeader className="p-0! relative">
                <Image
                    src={course.imageUrl}
                    alt={course.title || 'course hero image'}
                    width={380}
                    height={300}
                    className="w-full aspect-video object-cover flex items-center justify-center border-b border-border bg-secondary/2"
                />
                <CustomBadge
                    icon={DollarSign}
                    text={course.price > 0 ? `${course.price}` : "Free"}
                    className="absolute top-2 right-2"
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
        </Card>
    )
}

export default PreviewCourseCard;