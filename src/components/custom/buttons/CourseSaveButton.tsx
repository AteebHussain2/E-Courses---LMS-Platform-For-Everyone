import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

type SaveButtonProps = {
    text?: string
    courseId: string
    className?: string,
    side?: 'left' | 'top' | 'bottom' | 'right',
    disabled?: boolean,
    tooltip?: boolean
}

export const CourseSaveButton = ({ courseId, className, side, disabled = false, text, tooltip }: SaveButtonProps) => {
    // TODO: Implement the save functionality using courseId
    return (
        <Tooltip disableHoverableContent={!tooltip}>
            <TooltipTrigger asChild>
                <Button
                    size='icon'
                    className={cn("cursor-pointer rounded-full bg-glass-bg text-secondary hover:bg-[#ffffff]/10 transition-colors", className)}
                    asChild
                    disabled={disabled}
                >
                    <Bookmark className="size-4" />{text}
                </Button>
            </TooltipTrigger>
            <TooltipContent side={side}>
                <p>Save to Library</p>
            </TooltipContent>
        </Tooltip>
    )
}