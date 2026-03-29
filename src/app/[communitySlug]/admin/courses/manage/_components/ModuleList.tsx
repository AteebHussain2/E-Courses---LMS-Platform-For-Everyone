"use client"

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { restrictToVerticalAxis, restrictToWindowEdges } from "@dnd-kit/modifiers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reorderModulesAction } from "@/actions/modules";
import { Skeleton } from "@/components/ui/skeleton";
import { GripVertical, Layers } from "lucide-react";
import { ModuleWithLessons } from "@/lib/types";
import { useState, useEffect } from "react";
import ModuleItem from "./ModuleItem";
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
    const [activeModule, setActiveModule] = useState<ModuleWithLessons | null>(null)

    // keep in sync with server data
    useEffect(() => setOptimisticModules(modules), [modules])

    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: { distance: 8 }  // prevents accidental drags
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

    const handleDragStart = (event: DragStartEvent) => {
        const module = optimisticModules.find(m => m.id === event.active.id)
        setActiveModule(module ?? null)   // track what's being dragged
    }

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveModule(null)
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
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={optimisticModules.map(m => m.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                    {optimisticModules.map((module, index) => (
                        <ModuleItem
                            key={module.id}
                            module={module}
                            index={index}
                            courseId={courseId}
                            communitySlug={communitySlug}
                            isDragOverlay={false}
                        />
                    ))}
                </div>
            </SortableContext>

            <DragOverlay dropAnimation={{
                duration: 200,
                easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)'
            }}>
                {activeModule && (
                    <DragOverlayModule module={activeModule} />
                )}
            </DragOverlay>
        </DndContext>
    )
}

function DragOverlayModule({ module }: { module: ModuleWithLessons }) {
    return (
        <div className="rounded-xl border border-primary/40 bg-input shadow-2xl shadow-black/40 opacity-95 cursor-grabbing">
            <div className="flex items-center gap-3 px-4 py-3.5">
                <GripVertical className="size-4 text-primary/60 shrink-0" />
                <span className="text-xs font-mono text-text-muted/60 bg-background-secondary border border-border rounded-md px-1.5 py-0.5 shrink-0">
                    {String(module.index).padStart(2, '0')}
                </span>
                <span className="text-sm font-medium text-text flex-1 truncate">
                    {module.title}
                </span>
                <span className="text-xs text-text-muted shrink-0">
                    {module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}
                </span>
            </div>
        </div>
    )
}