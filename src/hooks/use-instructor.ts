"use client";

import { getInstructorAction } from "@/actions/members";
import { useQuery } from "@tanstack/react-query";

export function useInstructor(userId: string | undefined) {
    return useQuery({
        queryFn: () => getInstructorAction(userId!),
        queryKey: ['instructor', userId],
        enabled: !!userId,
        staleTime: 1000 * 60 * 5
    })
}