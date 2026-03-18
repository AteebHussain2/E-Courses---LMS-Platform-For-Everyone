'use client';

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "../ui/sidebar";
import { LogIn, LucideIcon, User2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { getRoutes } from "@/lib/route";
import { cn, getUrl } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

const HomeSidebar = ({ slug, name }: { slug: string, name: string }) => {
    const routes = getRoutes(slug);
    const path = usePathname();

    return (
        <Sidebar collapsible="icon" className="border-none! py-6 px-2.5 gap-4.5 font-heading">
            <SidebarHeader>
                <h1 className="pl-3 font-semibold text-2xl text-foreground">
                    {name}
                </h1>
            </SidebarHeader>

            <SidebarContent className="p-0!">
                {routes.map(route => (
                    <SidebarGroup key={route.label} className="px-2! py-0! gap-3!">
                        <SidebarGroupLabel className="pl-3 pt-3.5 font-extrabold text-[0.625rem] text-muted">
                            {route.label}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu className="gap-3!">
                                {route.routes?.map(item => (
                                    <SidebarItem key={item.href} route={item} path={path} />
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarUser path={path} />
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>

    )
};

export default HomeSidebar

const SidebarItem = ({ route, path }: {
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

const SidebarUser = ({ path }: { path: string }) => {
    const user = useUser();
    const userData = user?.user;
    console.log(JSON.stringify(userData, null, 4))

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
                        <User2 className="size-4!" />
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
}