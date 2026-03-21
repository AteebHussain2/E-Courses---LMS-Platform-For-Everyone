import { z } from 'zod/v3';

export const RouteType = {
    GROUP: 'GROUP',
    MENU: 'MENU',
    COLLAPSIBLE: 'COLLAPSIBLE'
};

export const addCourseSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().max(2000).optional(),
    // isActive: z.boolean().default(false),
    imageUrl: z.string().min(1),
})

export type addCourseSchemaType = z.infer<typeof addCourseSchema>