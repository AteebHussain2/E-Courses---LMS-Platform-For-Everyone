"use client";

import { getInstructorAction } from "@/actions/members";
import { useQuery } from "@tanstack/react-query";

export function useInstructor(userId: string | undefined) {
    return useQuery({
        queryFn: () => getInstructorAction(userId!),
        queryKey: ['instructor', userId],
        refetchOnReconnect: false,
        enabled: !!userId,
        staleTime: 1000 * 3600 * 24
    })
}