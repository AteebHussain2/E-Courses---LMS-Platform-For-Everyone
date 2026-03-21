import { Bell, Settings } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "../ui/button";

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