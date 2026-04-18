import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

type EnrollButtonProps = {
    courseSlug: string
    communitySlug: string
    className?: string,
    disabled?: boolean,
}

const CourseEnrollButton = ({ courseSlug, communitySlug, className, disabled = false }: EnrollButtonProps) => {
    // TODO
    // className="inline-flex flex-1 items-center justify-center gap-2 bg-primary hover:bg-primary/85 transition-colors text-white px-4 py-3 rounded-full text-sm font-medium"
    return (
        <Button
            variant='default'
            asChild
            className={cn("p-0!", className)}
            disabled={disabled}
        >
            <Link
                href={`/${communitySlug}/courses/${courseSlug}`}
                className="w-full h-full"
            >
                Enroll Now
            </Link>
        </Button>
    )
}

export default CourseEnrollButton
