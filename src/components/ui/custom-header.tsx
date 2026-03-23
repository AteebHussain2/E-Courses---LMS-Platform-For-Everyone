"use client";

import BreadcrumbHeader from './breadcrumb-header';
import { Role } from '@/generated/prisma/enums';
import { usePathname } from 'next/navigation';
import { getRoutes } from '@/lib/routes';

const CustomHeader = ({ header, slug }: { header?: string, slug: string, role?: Role }) => {
    const path = usePathname();
    const groups = getRoutes(slug)

    const getHeader = () => {
        for (const group of groups) {
            for (const route of group.routes) {
                if (route.href === path)
                    return route.label
            }
        }

        return 'No Header Found'
    }

    return (
        <div className="flex md:flex-row flex-col items-start md:items-center justify-between">
            <h2 className="text-secondary text-lg font-semibold font-heading">{header ?? getHeader()}</h2>
            <BreadcrumbHeader />
        </div>
    )
}

export default CustomHeader
