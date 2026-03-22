'use client';

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import Link from "next/link";
import React from "react";

const BreadcrumbHeader = () => {
    const path = usePathname();
    const pathArray = path.split('/');

    return (
        <div>
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink
                            href={pathArray.slice(0, 2).join('/')}
                            className="hover:cursor-pointer capitalize"
                        >
                            {pathArray[1].replace(/[^a-zA-z0-9+]/, ' ')}
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    {pathArray.slice(2, -1).map((item, index) => (
                        <React.Fragment key={item}>
                            <BreadcrumbSeparator className="pt-0.5" />
                            <BreadcrumbItem>
                                <BreadcrumbLink
                                    href={pathArray.slice(0, index + 3).join('/')}
                                    className="hover:cursor-pointer capitalize"
                                >
                                    {item}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </React.Fragment>
                    ))}
                    <BreadcrumbSeparator className="pt-0.5" />
                    <BreadcrumbPage className="hover:cursor-pointer capitalize">
                        <Link
                            href={path}
                        >
                            {pathArray[pathArray.length - 1]}
                        </Link>
                    </BreadcrumbPage>
                </BreadcrumbList>
            </Breadcrumb>
        </div >
    )
}

export default BreadcrumbHeader
