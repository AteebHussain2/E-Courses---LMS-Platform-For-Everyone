import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

type EnrollButtonProps = {
    courseSlug: string
    communitySlug: string
    className?: string,
    disabled?: boolean,
}

const CourseEnrollNowButton = ({ courseSlug, communitySlug, className, disabled = false }: EnrollButtonProps) => {
    // TODO
    // className="inline-flex flex-1 items-center justify-center gap-2 bg-primary hover:bg-primary/85 transition-colors text-white px-4 py-3 rounded-full text-sm font-medium"
    return (
        <Button
            variant='default'
            className={cn("flex-1 w-full cursor-pointer rounded-full bg-primary text-foreground hover:border-border hover:bg-primary/85 hover:text-foreground", className)}
            disabled={disabled}
        >
            <Link
                href={`/${communitySlug}/courses/${courseSlug}`}
                className='w-full h-full items-center justify-center flex'
            >
                Enroll Now
            </Link>
        </Button>
    )
}

export default CourseEnrollNowButton
