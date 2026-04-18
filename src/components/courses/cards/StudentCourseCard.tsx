import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import CourseEnrollButton from "@/components/custom/buttons/CourseEnrollButton";
import { CourseSaveButton } from "@/components/custom/buttons/CourseSaveButton";
import { Book, Clock, GraduationCap, Users2 } from "lucide-react";
import PriceBadge from "@/components/custom/badge/PriceBadge";
import { CourseWithInstructorAndCount } from "@/lib/types";
import CustomBadge from "@/components/CustomBadge";
import { Role } from "@/generated/prisma/enums";
import { formatDate } from "date-fns";
import Image from "next/image";

const StudentCourseCard = ({ course }: { course: CourseWithInstructorAndCount }) => {
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
                        text={formatDate(course.createdAt, 'dd MMMM, yyyy')}
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
                        icon={GraduationCap}
                        text={`${course.instructor?.firstName} ${course.instructor?.lastName}`}
                        tooltip={`${course.instructor?.firstName} ${course.instructor?.lastName} is teaching this course.`}
                        variant={Role.INSTRUCTOR}
                    />
                </div>
            </CardContent>

            <CardFooter className="flex flex-1 items-center gap-2">
                <CourseEnrollButton courseSlug={course.slug} communitySlug={course.community.slug} />
                <CourseSaveButton courseId={course.id} />
            </CardFooter>
        </Card>
    )
}

export default StudentCourseCard;