import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

type ManageButtonProps = {
    courseId: string
    className?: string,
    disabled?: boolean,
}

export const CourseManageButton = ({ courseId, className, disabled = false }: ManageButtonProps) => {
    return (
        <Button
            size='lg'
            className={cn("w-full cursor-pointer rounded-full bg-[#0C1321] text-foreground hover:border-border hover:bg-[#0F1A2E] hover:text-foreground", className)}
            disabled={disabled}
        >
            <Link href={!disabled ? `courses/manage?courseId=${courseId}` : '#'} className='w-full h-full items-center justify-center flex'>
                Manage Course
            </Link>
        </Button>
    )
}