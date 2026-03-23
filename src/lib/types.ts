import { Prisma } from "@/generated/prisma/client";

export const RouteType = {
    GROUP: 'GROUP',
    MENU: 'MENU',
    COLLAPSIBLE: 'COLLAPSIBLE'
};

export type CourseWithInstructorAndCount = Prisma.CourseGetPayload<{
    select: {
        id: true
        title: true
        slug: true
        description: true
        imageUrl: true
        isActive: true
        createdAt: true
        updatedAt: true
        instructor: {
            select: {
                userId: true
                firstName: true
                lastName: true
                avatar: true
            }
        }
        community: {
            select: {
                id: true,
                slug: true,
            },
        }
        _count: {
            select: { enrollments: true, modules: true }
        }
    }
}>