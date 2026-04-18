import { Book, Clock, DollarSign, Globe2, GlobeX, GraduationCap, Users2 } from "lucide-react";
import { CourseManageButton } from "@/components/custom/buttons/CourseManageButton";
import { CourseDeleteButton } from "@/components/custom/buttons/CourseDeleteButton";
import { CourseEditButton } from "@/components/custom/buttons/CourseEditButton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { formatDate, formatDistanceToNow } from "date-fns";
import { CourseWithInstructorAndCount } from "@/lib/types";
import { Role } from "@/generated/prisma/enums";
import CustomBadge from "@/components/CustomBadge";
import Image from "next/image";
import PriceBadge from "@/components/custom/badge/PriceBadge";

const AdminCourseCard = ({ course }: { course: CourseWithInstructorAndCount }) => {
    return (
        <Card className="w-full h-fit p-0! pb-3! gap-4!">
            <CardHeader className="p-0! relative">
                <Image
                    src={course.imageUrl}
                    alt={course.title}
                    width={380}
                    height={300}
                    className="w-full aspect-video object-cover"
                />
                <PriceBadge
                    currency="USD"
                    price={course.price}
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
                    />
                    <CustomBadge
                        icon={Book}
                        text={course._count.modules}
                        tooltip={`${course._count.modules} module(s)`}
                    />
                    <CustomBadge
                        icon={Users2}
                        text={course._count.enrollments}
                        tooltip={`${course._count.enrollments} student(s)`}
                    />
                    <CustomBadge
                        icon={course.isActive ? Globe2 : GlobeX}
                        text={course.isActive ? "Public" : "Private"}
                    />
                    <CustomBadge
                        icon={GraduationCap}
                        text={`${course.instructor?.firstName} ${course.instructor?.lastName}`}
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

export default AdminCourseCard;