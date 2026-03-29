"use client"

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reorderModulesAction } from "@/actions/modules";
import { Skeleton } from "@/components/ui/skeleton";
import { ModuleWithLessons } from "@/lib/types";
import { useState, useEffect } from "react";
import ModuleItem from "./ModuleItem";
import { Layers } from "lucide-react";
import { toast } from "sonner";

type Props = {
    modules: ModuleWithLessons[]
    isLoading: boolean
    courseId: string
    communitySlug: string
}

export default function ModuleList({ modules, isLoading, courseId, communitySlug }: Props) {
    const queryClient = useQueryClient()
    const [optimisticModules, setOptimisticModules] = useState(modules)

    // keep in sync with server data
    useEffect(() => setOptimisticModules(modules), [modules])

    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: { distance: 8 }  // 👈 prevents accidental drags
    }))

    const reorderMutation = useMutation({
        mutationFn: (modules: ModuleWithLessons[]) =>
            reorderModulesAction(courseId, communitySlug, modules.map((m, i) => ({
                id: m.id, index: i + 1
            }))),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['modules', courseId] }),
        onError: () => {
            toast.error("Failed to reorder modules")
            setOptimisticModules(modules)  // revert on error
        }
    })

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const oldIndex = optimisticModules.findIndex(m => m.id === active.id)
        const newIndex = optimisticModules.findIndex(m => m.id === over.id)
        const reordered = arrayMove(optimisticModules, oldIndex, newIndex)

        setOptimisticModules(reordered)     // optimistic update
        reorderMutation.mutate(reordered)   // persist
    }

    if (isLoading) return (
        <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
        </div>
    )

    if (optimisticModules.length === 0) return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 space-y-3">
            <Layers className="size-8 text-muted/50" />
            <p className="text-muted text-sm">No modules yet</p>
            <p className="text-muted/60 text-xs">Click Add Module to get started</p>
        </div>
    )

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={optimisticModules.map(m => m.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                    {optimisticModules.map((module, index) => (
                        <ModuleItem
                            key={module.id}
                            module={module}
                            index={index}
                            courseId={courseId}
                            communitySlug={communitySlug}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    )
}