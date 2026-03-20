"use client";

import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import { LogIn, User2, LucideIcon } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
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
    path: string,
}) => {
    const isActiveRoute = (route: string) => {
        console.log(path.split('/')[3], route.split('/')[3])
        if (path.split('/')[3] == route.split('/')[3])
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
                    className={cn("flex items-center gap-4! hover:text-foreground",
                        false ? "text-foreground font-medium" : "text-secondary font-normal"
                    )}
                >
                    <route.icon className="size-4!" />
                    <h4 className="text-[0.9rem] font-medium">
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
                >
                    <Link
                        href="/user/me"
                        className="flex items-center gap-3 text-foreground font-normal hover:text-foreground cursor-pointer"
                    >
                        <Skeleton className="size-8! p-2 rounded-full" />
                        <div className="flex flex-col items-start w-full gap-1">
                            <Skeleton className="w-1/2 h-3 rounded-xs!" />
                            <Skeleton className="w-3/4 h-2 rounded-xs!" />
                        </div>
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

// export const SidebarCollapsibleItem = ({ activeAccordion, route, path }: {
//     activeAccordion: string,
//     route: {
//         href: string,
//         label: string,
//         icon: LucideIcon,
//         subRoutes?: {
//             href: string,
//             label: string
//         }[],
//     },
//     path: string,
// }) => {
//     const activeRoute = (route: string) => {
//         return route === path
//     }

//     return (
//         <AccordionItem
//             value={route.href}
//         >
//             <SidebarMenuItem className="w-full">
//                 <SidebarMenuButton
//                     asChild
//                     className="h-full py-2.5! pl-4! transition-colors rounded-sm"
//                     isActive={activeAccordion === route.label}
//                 >
//                     <AccordionTrigger
//                         className="m-0! flex items-center gap-4! hover:text-foreground text-secondary font-normal"
//                     >
//                         <route.icon className="size-4!" />
//                         <h4 className={cn("text-[0.9rem]",
//                             activeAccordion === route.label ? "font-semibold" : "font-medium"
//                         )}>
//                             {route.label}
//                         </h4>
//                     </AccordionTrigger>
//                 </SidebarMenuButton>
//                 {route?.subRoutes?.length !== 0 && route?.subRoutes?.map(subRoute => (
//                     <SidebarMenuSub
//                         key={subRoute.href}
//                         className="border-none!"
//                     >
//                         <SidebarMenuSubButton
//                             asChild
//                             className={cn("h-full py-1.5! pl-6! transition-all bg-transparent! hover:text-foreground! hover:pl-7!",
//                                 activeRoute(subRoute.href) ? "text-foreground!" : "text-secondary!"
//                             )}
//                             isActive={activeRoute(subRoute.href)}
//                             size="md"
//                         >
//                             <Link
//                                 href={subRoute.href}
//                             >
//                                 {subRoute.label}
//                             </Link>
//                         </SidebarMenuSubButton>
//                     </SidebarMenuSub>
//                 ))}
//             </SidebarMenuItem >
//         </AccordionItem>
//     )
// };