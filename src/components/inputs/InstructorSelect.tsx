"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getInstructors } from "@/actions/members";
import { useQuery } from "@tanstack/react-query";
import CustomBadge from "../CustomBadge";
import { cn } from "@/lib/utils";
import Image from "next/image";

type InstructorSelectProps = {
    communitySlug: string
    placeholder?: string
    className?: string
    includeUnassigned?: boolean
    value: string
    onChange: (value: string) => void
    disabled?: boolean
}

export default function InstructorSelect({
    communitySlug,
    value,
    onChange,
    disabled,
    placeholder = "Select an instructor",
    includeUnassigned = false,
    className
}: InstructorSelectProps) {
    const { data: instructors = [], isLoading } = useQuery({
        queryKey: ['instructors', communitySlug],
        queryFn: () => getInstructors(communitySlug),
        staleTime: Infinity,
    })

    return (
        <Select
            value={value}
            onValueChange={(v) => onChange(v === 'all' ? '' : v)}
            disabled={disabled || isLoading}
        >
            <SelectTrigger className={cn("border-border!", className)}>
                <SelectValue placeholder={isLoading ? "Loading..." : placeholder} />
            </SelectTrigger>
            <SelectContent>
                {includeUnassigned && (
                    <>
                        <SelectItem value="all">All Instructors</SelectItem>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                    </>
                )}

                {instructors.map((instructor) => (
                    <SelectItem key={instructor.id} value={instructor.id}>
                        <div className="flex items-center gap-2">
                            {instructor.avatar && (
                                <Image
                                    src={instructor.avatar}
                                    alt={instructor.name}
                                    width={20}
                                    height={20}
                                    className="rounded-full size-5 object-cover"
                                />
                            )}
                            <span>{instructor.name}</span>
                            <span>·</span>
                            <CustomBadge variant={instructor.role} text={instructor.role} />
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}