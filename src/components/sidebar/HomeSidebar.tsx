"use client"

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu } from "../ui/sidebar";
import { SidebarItem, SidebarUserItem } from "./SidebarItem";
import { Role } from "@/generated/prisma/enums";
import { usePathname } from "next/navigation";
import { getRoutes } from "@/lib/routes";
import Image from "next/image";

interface Props {
    slug: string,
    name: string,
    logo: string | null,
    role?: Role,
}

const HomeSidebar = ({ slug, name, logo, role }: Props) => {
    const routes = getRoutes(slug, role);
    const path = usePathname();

    return (
        <Sidebar collapsible="icon" className="border-none! pt-6! px-2.5! gap-4.5 font-heading">
            <SidebarHeader className="flex! flex-row! items-center gap-0!">
                {logo && <Image
                    width={28}
                    height={28}
                    alt={name}
                    src={logo}
                    className="ml-3 rounded-xs"
                />}
                <h1 className="pl-3 font-semibold text-2xl text-foreground">
                    {name}
                </h1>
            </SidebarHeader>

            <SidebarContent className="p-0! gap-4.5!">
                {routes.map(route => (
                    <SidebarGroup key={route.label} className="px-2! py-0! gap-1!">
                        <SidebarGroupLabel className="pl-3 pt-3.5 font-extrabold text-[0.625rem] text-muted">
                            {route.label}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu className="gap-2!">
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
                    <SidebarUserItem path={path} />
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>

    )
};

export default HomeSidebar