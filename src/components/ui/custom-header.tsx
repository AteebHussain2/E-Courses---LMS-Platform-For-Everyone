"use client";

import BreadcrumbHeader from './breadcrumb-header';
import { Role } from '@/generated/prisma/enums';
import { allRoutes } from '@/lib/routes';
import { usePathname } from 'next/navigation';

const CustomHeader = ({ header, slug }: { header?: string, slug: string }) => {
    const path = usePathname();
    const routes = allRoutes(slug)

    const getHeader = () => {
        for (const route of routes) {
            if (route.href === path)
                return route.label
        }

        return 'No Header Found'
    }

    return (
        <div className="flex md:flex-row flex-col items-start md:items-center justify-between">
            <h2 className="text-secondary text-lg font-semibold">{header ?? getHeader()}</h2>
            <BreadcrumbHeader />
        </div>
    )
}

export default CustomHeader
