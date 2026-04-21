import CourseEnrollNowButton from "@/components/custom/buttons/CourseEnrollNowButton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { CourseSaveButton } from "@/components/custom/buttons/CourseSaveButton";
import { SavedCourseItem } from "@/lib/types";
import Image from "next/image";

const SavedCourseCard = ({ course }: { course: SavedCourseItem['course'] }) => {
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
            </CardHeader>
            <CardContent className="items-start py-0! px-4! space-y-4">
                <div className="space-y-3">
                    <h4 className="text-lg font-normal line-clamp-2">
                        {course.title}
                    </h4>
                </div>
            </CardContent>

            <CardFooter className="flex flex-1 items-center gap-2">
                {/* TODO: add buttons to redirect to saved session/course page */}
                <CourseEnrollNowButton courseSlug={course.slug} communitySlug={course.community.slug} />
                <CourseSaveButton courseId={course.id} communitySlug={course.community.slug} />
            </CardFooter>
        </Card>
    )
}

export default SavedCourseCard;