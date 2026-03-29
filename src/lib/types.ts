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

export type ModuleWithLessons = Prisma.ModuleGetPayload<{
    include: {
        lessons: {
            select: {
                id: true
                title: true
                type: true
                index: true
                slug: true
            }
            orderBy: { index: 'asc' }
        }
    }
}>

export type LessonInModule = {
    id: string
    title: string
    type: 'VIDEO' | 'SESSION'
    index: number
    slug: string
}