"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getInstructors } from "@/actions/members";
import { useEffect, useState } from "react";
import Image from "next/image";

type Instructor = {
    id: string
    name: string
    avatar: string
    role: string
}

type InstructorSelectProps = {
    communitySlug: string
    value: string
    onChange: (value: string) => void
    disabled?: boolean
}

export default function InstructorSelect({ communitySlug, value, onChange, disabled }: InstructorSelectProps) {
    const [instructors, setInstructors] = useState<Instructor[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getInstructors(communitySlug)
            .then(setInstructors)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [communitySlug])

    return (
        <Select value={value} onValueChange={onChange} disabled={disabled || loading}>
            <SelectTrigger className="border-border!">
                <SelectValue placeholder={loading ? "Loading..." : "Select an instructor"} />
            </SelectTrigger>
            <SelectContent>
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
                            <span className="text-xs text-text-muted">{instructor.role}</span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}