import CourseEnrollNowButton from "@/components/custom/buttons/CourseEnrollNowButton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { CourseSaveButton } from "@/components/custom/buttons/CourseSaveButton";
import { SavedSessionItem } from "@/lib/types";
import Image from "next/image";

const SavedSessionCard = ({ session }: { session: SavedSessionItem['session'] }) => {
    return (
        <Card className="w-full h-fit p-0! pb-3! gap-4!">
            <CardHeader className="p-0! relative">
                {session.imageUrl && (
                    <Image
                        src={session.imageUrl}
                        alt={session.title}
                        width={380}
                        height={300}
                        className="w-full aspect-video object-cover"
                    />
                )}
            </CardHeader>
            <CardContent className="items-start py-0! px-4! space-y-4">
                <div className="space-y-3">
                    <h4 className="text-lg font-normal line-clamp-2">
                        {session.title}
                    </h4>
                </div>
            </CardContent>

            <CardFooter className="flex flex-1 items-center gap-2">
                {/* TODO: add buttons to redirect to saved session/course page */}
                <CourseEnrollNowButton courseSlug={session.id} communitySlug={session.community.slug} />
                <CourseSaveButton courseId={session.id} communitySlug={session.community.slug} />
            </CardFooter>
        </Card>
    )
}

export default SavedSessionCard;