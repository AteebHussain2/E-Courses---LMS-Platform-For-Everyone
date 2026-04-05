import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { LessonStatus, Role } from '@/generated/prisma/enums';
import { LucideIcon } from 'lucide-react';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

type CustomBadgeProps = {
    icon?: LucideIcon,
    className?: string,
    text: string | number,
    tooltip?: string,
    variant?: Role | LessonStatus | 'default',
    side?: 'left' | 'top' | 'bottom' | 'right',
}

const customBadgeVariant = (variant: Role | LessonStatus | 'default') => {
    switch (variant) {
        case Role.STUDENT:
            return "bg-student-bg text-student-fg";
        case Role.INSTRUCTOR:
            return "bg-instructor-bg text-instructor-fg";
        case Role.MODERATOR:
            return "bg-moderator-bg text-moderator-fg";
        case Role.ADMIN:
            return "bg-admin-bg text-admin-fg";
        case Role.OWNER:
            return "bg-owner-bg text-owner-fg";
        case LessonStatus.DRAFT:
            return "bg-yellow-400 text-yellow-900";
        case LessonStatus.ARCHIVED:
            return "bg-gray-400 text-gray-900";
        case LessonStatus.PUBLISHED:
            return "bg-green-400 text-green-900";
        default:
            return "bg-glass-bg text-secondary";
    }
}

const CustomBadge = (props: CustomBadgeProps) => {
    const defaultVariant = customBadgeVariant(props.variant ?? 'default');

    return (
        props.tooltip ? (
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge className={cn("cursor-pointer flex items-center gap-2 py-2! px-3 rounded-full border-glass-border", defaultVariant, props.className)}>
                        {props.icon && <props.icon />}
                        {props.text}
                    </Badge >
                </TooltipTrigger>
                <TooltipContent side={props.side}>
                    <p>{props.tooltip}</p>
                </TooltipContent>
            </Tooltip>
        ) : (
            <Badge className={cn("cursor-pointer flex items-center gap-2 py-2! px-3 rounded-full", defaultVariant, props.className)}>
                {props.icon && <props.icon />}
                {props.text}
            </Badge >
        )
    )
}

export default CustomBadge
