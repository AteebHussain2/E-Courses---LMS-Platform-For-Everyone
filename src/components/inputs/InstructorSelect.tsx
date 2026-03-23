"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getInstructors } from "@/actions/members";
import { Role } from "@/generated/prisma/enums";
import { useEffect, useState } from "react";
import CustomBadge from "../CustomBadge";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Instructor = {
    id: string
    name: string
    avatar: string
    role: Role
}

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
    const [instructors, setInstructors] = useState<Instructor[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getInstructors(communitySlug)
            .then(setInstructors)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [communitySlug])

    return (
        <Select
            value={value}
            onValueChange={(v) => onChange(v === 'all' ? '' : v)}
            disabled={disabled || loading}
        >
            <SelectTrigger className={cn("border-border!", className)}>
                <SelectValue placeholder={loading ? "Loading..." : placeholder} />
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