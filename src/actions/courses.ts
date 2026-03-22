"use server"

import { addCourseSchemaType } from "@/lib/validation/course";
import { apiHeaders } from "@/lib/api";
import { getUrl } from "@/lib/utils";

export async function createCourse(values: addCourseSchemaType, communitySlug: string) {
    const res = await fetch(getUrl('/api/courses/add'), {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({ ...values, communitySlug })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Something went wrong")

    return data
}