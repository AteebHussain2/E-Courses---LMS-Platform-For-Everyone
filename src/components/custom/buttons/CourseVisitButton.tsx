import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

type EnrollButtonProps = {
    courseSlug: string
    communitySlug: string
    className?: string,
    disabled?: boolean,
}

const CourseVisitButton = ({ courseSlug, communitySlug, className, disabled = false }: EnrollButtonProps) => {
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
                Visit Course
            </Link>
        </Button>
    )
}

export default CourseVisitButton
