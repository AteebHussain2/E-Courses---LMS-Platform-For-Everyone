import { z } from 'zod/v3';

export const courseSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().max(2000).optional(),
    isActive: z.boolean().default(false).optional(),
    imageUrl: z.string().min(1),
    instructorId: z.string().min(1)
})

export type courseSchemaType = z.infer<typeof courseSchema>