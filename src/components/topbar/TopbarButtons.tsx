import { ArrowLeft, Bell, Settings } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "../ui/button";
import Link from "next/link";

export const TopbarUserButton = () => {
    return (
        <UserButton />
    )
};

export const TopbarNotificationButton = () => {
    return (
        <Button
            variant='ghost'
            size='icon'
            className="active:text-foreground focus-visible:text-foreground hover:text-foreground! text-secondary hover:cursor-pointer"
        >
            <Bell className="size-4.5!" />
        </Button>
    )
};

export const TopbarSettingsButton = () => {
    return (
        <Button
            variant='ghost'
            size='icon'
            className="active:text-foreground focus-visible:text-foreground hover:text-foreground! text-secondary hover:cursor-pointer"
        >
            <Settings className="size-4.5!" />
        </Button>
    )
};

export const TopbarBackButton = ({ href, text }: { href: string, text: string }) => {
    return (
        <Button
            variant='ghost'
            asChild
            className="py-4! px-5! transition-colors rounded-full border border-border"
        >
            <Link
                href={href}
                className="flex items-center gap-3 text-foreground font-normal hover:text-foreground cursor-pointer"
            >
                <ArrowLeft className="size-3.5" />
                <span>{text}</span>
            </Link>
        </Button>
    )
}