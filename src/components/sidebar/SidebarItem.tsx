"use client";

import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import { LogIn, User2, LucideIcon } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { getUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export const SidebarItem = ({ route, path }: {
    route: {
        href: string,
        label: string,
        icon: LucideIcon
    },
    path: string
}) => {
    const isActiveRoute = (route: string) => {
        if (path == route)
            return true;
        return false;
    };

    return (
        <SidebarMenuItem className="w-full">
            <SidebarMenuButton
                asChild
                className="h-full py-2.5! pl-4! transition-colors rounded-sm"
                isActive={isActiveRoute(route.href)}
            >
                <Link
                    href={route.href}
                    className={cn("flex items-center gap-3 hover:text-foreground",
                        false ? "text-foreground font-medium" : "text-secondary font-normal"
                    )}
                >
                    <route.icon className="size-4!" />
                    <h4 className="text-[1rem] font-normal">
                        {route.label}
                    </h4>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem >
    )
};

export const SidebarUserItem = ({ path }: { path: string }) => {
    const user = useUser();
    const userData = user?.user;

    if (!user.isLoaded) {
        return (
            <SidebarMenuItem className="w-full">
                <SidebarMenuButton
                    asChild
                    className="h-full py-2.5! pl-4! transition-colors rounded-sm"
                    isActive={true}
                >
                    <Link
                        href="/user/me"
                        className="flex items-center gap-3 text-foreground font-normal hover:text-foreground cursor-pointer"
                    >
                        <User2 className="size-8! bg-glass-bg p-4 rounded-full" />
                        <h4 className="text-[1rem] font-normal">
                            Username
                        </h4>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        )
    }

    if (!user.isSignedIn) {
        const redirectUrl = getUrl(path)

        return (
            <SidebarMenuItem className="w-full">
                <SidebarMenuButton
                    asChild
                    className="h-full py-2.5! pl-4! transition-colors rounded-sm"
                    isActive={true}
                >
                    <Link
                        href={`/sign-in?redirect_url=${redirectUrl}`}
                        className="flex items-center gap-3 text-foreground font-normal hover:text-foreground cursor-pointer"
                    >
                        <LogIn className="size-4!" />
                        <h4 className="text-[1rem] font-normal">
                            Log In
                        </h4>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        )
    }

    return (
        <SidebarMenuItem className="w-full">
            <SidebarMenuButton
                asChild
                className="h-full py-2.5! pl-4! transition-colors rounded-sm"
            >
                <Link
                    href="/user/me"
                    className="flex items-center gap-3 text-foreground font-normal hover:text-foreground cursor-pointer"
                >
                    {userData?.imageUrl ? (
                        <Image
                            src={userData?.imageUrl}
                            width={32}
                            height={32}
                            alt={userData?.fullName || "User Image"}
                            className="rounded-full"
                        />
                    ) : (
                        <User2 className="size-4!" />
                    )}

                    <div className="flex flex-col items-start">
                        <h4 className="text-sm font-normal">
                            {userData?.fullName}
                        </h4>
                        <h4 className="text-xs font-normal text-secondary truncate max-w-[90%]">
                            {userData?.emailAddresses[0]?.emailAddress}
                        </h4>
                    </div>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    )
};