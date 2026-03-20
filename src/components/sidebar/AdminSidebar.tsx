"use client";

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu } from "../ui/sidebar";
import { SidebarItem, SidebarUserItem } from "./SidebarItem";
import { Role } from "@/generated/prisma/enums";
import { usePathname } from "next/navigation";
import { ownerRoutes } from "@/lib/routes";
import Image from "next/image";

interface Props {
    slug: string,
    name: string,
    logo: string | null,
    role?: Role,
}

const AdminSidebar = ({ slug, name, logo, role }: Props) => {
    const routes = ownerRoutes(slug);
    const path = usePathname();

    return (
        <Sidebar collapsible="icon" className="border-none! pt-4! px-1! gap-4.5! font-heading">
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
                        <SidebarGroupLabel className="pl-6! pt-3.5! font-bold text-[0.65rem] text-muted">
                            {route.label}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu className="gap-2!">
                                {route && route.routes?.map(item =>
                                    <SidebarItem key={item.href} route={item} path={path} />
                                )}
                                {/* {route.type === RouteType.COLLAPSIBLE && route.routes?.map((item, index) => {
                                    const initialOpenAccordions = useMemo(() => {
                                        let active: string = "";
                                        if (item?.subRoutes?.length !== 0 && item.subRoutes?.some(child => child.href === path)) {
                                            active = route.label;
                                        }
                                        return active;
                                    }, [path]);

                                    const [activeAccordion, setActiveAccordion] = useState<string>(initialOpenAccordions);

                                    const getActiveAccordionName = () => {
                                        if (item?.subRoutes?.length !== 0 && item.subRoutes?.some(child => child.href === path)) {
                                            return route.label;
                                        }
                                        return null;
                                    };

                                    useEffect(() => {
                                        const name = getActiveAccordionName();
                                        setActiveAccordion(name!);
                                    }, [path]);

                                    return (
                                        <Accordion
                                            key={index}
                                            type="single"
                                            defaultValue={activeAccordion}
                                            className="py-0! gap-1!"
                                        >
                                            <SidebarCollapsibleItem key={index} activeAccordion={activeAccordion} route={item} path={path} />
                                        </Accordion>
                                    )
                                }
                                )} */}
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

export default AdminSidebar