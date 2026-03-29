"use client"

import { closestCenter, DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { GripVertical, Pencil, Trash2, ChevronDown, Video, Radio } from "lucide-react";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LessonInModule, ModuleWithLessons } from "@/lib/types";
import { reorderLessonsAction } from "@/actions/lessons";
import CreateLessonDialog from "./CreateLessonDialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import LessonItem from "./LessonItem";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DeleteModuleButton } from "@/components/CustomButtons";

type Props = {
    module: ModuleWithLessons
    index: number
    courseId: string
    communitySlug: string
    isDragOverlay?: boolean
}

export default function ModuleItem({ module, index, courseId, communitySlug }: Props) {
    const [open, setOpen] = useState(index == 0)
    const [optimisticLessons, setOptimisticLessons] = useState(module.lessons)
    const [activeLesson, setActiveLesson] = useState<LessonInModule | null>(null)

    useEffect(() => setOptimisticLessons(module.lessons), [module.lessons])

    const queryClient = useQueryClient()

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: module.id })

    const style = { transform: CSS.Transform.toString(transform), transition }

    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: { distance: 8 }
    }))

    const reorderMutation = useMutation({
        mutationFn: (lessons: LessonInModule[]) =>
            reorderLessonsAction(
                module.id,
                courseId,
                communitySlug,
                lessons.map((l, i) => ({ id: l.id, index: i + 1 }))
            ),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['modules', courseId] }),
        onError: () => {
            toast.error("Failed to reorder lessons")
            setOptimisticLessons(module.lessons)  // revert
        }
    })

    const handleDragStart = (event: DragStartEvent) => {
        const lesson = optimisticLessons.find(l => l.id === event.active.id)
        setActiveLesson(lesson ?? null)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveLesson(null)
        const { active, over } = event
        if (!over || active.id === over.id) return

        const oldIndex = optimisticLessons.findIndex(l => l.id === active.id)
        const newIndex = optimisticLessons.findIndex(l => l.id === over.id)
        const reordered = arrayMove(optimisticLessons, oldIndex, newIndex)

        setOptimisticLessons(reordered)
        reorderMutation.mutate(reordered)
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "rounded-xl border border-border/40 bg-transparent transition-all duration-200 overflow-hidden",
                isDragging && "opacity-30 border-dashed",
            )}
        >
            {/* Header Row — NOT inside AccordionTrigger */}
            <div className="flex items-center gap-3 px-4 py-3.5 bg-card">

                {/* Drag Handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-secondary/80 hover:text-secondary transition-colors touch-none shrink-0"
                >
                    <GripVertical className="size-4" />
                </div>

                {/* Index */}
                <span className="text-xs font-mono text-secondary/60 bg-background-secondary border border-border/80 rounded-md px-1.5 py-0.5 shrink-0 tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                </span>

                {/* Title */}
                <span className="text-sm font-medium text-foreground flex-1 truncate">
                    {module.title}
                </span>

                {/* Lesson count */}
                <span className="text-xs text-secondary shrink-0 hidden sm:block">
                    {module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}
                </span>

                {/* Action buttons — safely outside button */}
                <div className="flex items-center gap-0.5 shrink-0">
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-7 cursor-pointer text-secondary hover:text-foreground"
                    >
                        <Pencil className="size-3.5" />
                    </Button>
                    <DeleteModuleButton
                        moduleId={module.id}
                        moduleSlug={module.slug}
                        lessonCount={optimisticLessons.length}
                        courseId={courseId}
                    />
                </div>

                {/* Expand toggle — manual, not AccordionTrigger */}
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-7 cursor-pointer text-secondary hover:text-foreground shrink-0"
                    onClick={() => setOpen(prev => !prev)}
                >
                    <ChevronDown className={cn(
                        "size-4 transition-transform duration-200",
                        open && "rotate-180"
                    )} />
                </Button>
            </div>

            {/* Expandable Lessons */}
            {open && (
                <div className="px-4 pb-4 border-t border-border/40 pt-3 space-y-2">
                    {optimisticLessons.length === 0 ? (
                        <p className="text-xs text-text-muted/50 text-center py-3">
                            No lessons yet
                        </p>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={optimisticLessons.map(l => l.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-2">
                                    {optimisticLessons.map((lesson, index) => (
                                        <LessonItem
                                            key={lesson.id}
                                            index={index}
                                            lesson={lesson}
                                            moduleId={module.id}
                                            courseId={courseId}
                                            communitySlug={communitySlug}
                                        />
                                    ))}
                                </div>
                            </SortableContext>

                            {/* Lesson drag overlay */}
                            <DragOverlay dropAnimation={{
                                duration: 150,
                                easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)'
                            }}>
                                {activeLesson && (
                                    <DragOverlayLesson lesson={activeLesson} />
                                )}
                            </DragOverlay>
                        </DndContext>
                    )}

                    <CreateLessonDialog
                        moduleId={module.id}
                        courseId={courseId}
                        communitySlug={communitySlug}
                    />
                </div>
            )}
        </div>
    )
}

function DragOverlayLesson({ lesson }: { lesson: LessonInModule }) {
    return (
        <div className="flex items-center gap-3 rounded-lg border border-primary/40 bg-background-secondary px-3 py-2.5 shadow-xl shadow-black/30 cursor-grabbing opacity-95">
            <GripVertical className="size-3.5 text-primary/60 shrink-0" />
            <div className={cn(
                "size-6 rounded-md flex items-center justify-center shrink-0",
                lesson.type === 'VIDEO' ? "bg-primary/10" : "bg-instructor-bg"
            )}>
                {lesson.type === 'VIDEO'
                    ? <Video className="size-3 text-primary" />
                    : <Radio className="size-3 text-instructor-fg" />
                }
            </div>
            <span className="text-xs font-mono text-text-muted/50 shrink-0">
                {String(lesson.index).padStart(2, '0')}
            </span>
            <span className="text-sm text-text truncate flex-1">
                {lesson.title}
            </span>
        </div>
    )
}