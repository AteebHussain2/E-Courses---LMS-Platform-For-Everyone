import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Role } from '@/generated/prisma/enums';
import { LucideIcon } from 'lucide-react';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

type CustomBadgeProps = {
    icon?: LucideIcon,
    className?: string,
    text: string | number,
    tooltip?: string,
    variant?: Role,
    side?: 'left' | 'top' | 'bottom' | 'right',
}

const customBadgeVariant = (role: Role | 'default') => {
    switch (role) {
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
