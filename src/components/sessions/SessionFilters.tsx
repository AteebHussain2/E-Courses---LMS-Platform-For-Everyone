"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SortFilter, StatusFilter, TimeFilter, useSessionFilters } from "@/hooks/use-session-filters";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

type CourseFiltersProps = {
    communitySlug: string
}

export default function CourseFilters({ communitySlug }: CourseFiltersProps) {
    const [showFilters, setShowFilters] = useState(false)
    const { filters, setStatus, setTime, setSort, resetFilters, isFiltered } = useSessionFilters()

    const statusOptions = [
        { value: 'all', label: 'All' },
        { value: 'upcoming', label: 'Upcoming' },
        { value: 'live', label: 'Live' },
        { value: 'completed', label: 'Completed' },
        { value: 'canceled', label: 'Cancelled' },
    ]

    const timeOptions = [
        { value: 'all', label: 'All Time' },
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' },
        { value: 'year', label: 'This Year' },
    ]

    const sortOptions = [
        { value: 'newest', label: 'Newest' },
        { value: 'oldest', label: 'Oldest' },
        { value: 'a-z', label: 'A - Z' },
        { value: 'z-a', label: 'Z - A' },
    ]

    return (
        <div className="flex items-center gap-3">
            <Button
                variant="outline"
                className="border-border! cursor-pointer md:flex hidden"
                onClick={() => setShowFilters(!showFilters)}
            >
                <SlidersHorizontal className="size-4 text-text-muted" />
            </Button>

            {/* Status */}
            <div className={cn("items-center gap-3 flex-wrap", showFilters ? 'flex md:hidden' : 'hidden md:flex')}>
                <Select value={filters.status} onValueChange={(v) => setStatus(v as StatusFilter)}>
                    <SelectTrigger className="w-36 bg-input border-border">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        {statusOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                </Select>

                {/* Time */}
                <Select value={filters.time} onValueChange={(v) => setTime(v as TimeFilter)}>
                    <SelectTrigger className="w-36 bg-input border-border">
                        <SelectValue placeholder="Time" />
                    </SelectTrigger>
                    <SelectContent>
                        {timeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={filters.sort} onValueChange={(v) => setSort(v as SortFilter)}>
                    <SelectTrigger className="w-40 bg-input border-border">
                        <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                        {sortOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                </Select>

                {/* Reset */}
                {isFiltered && (
                    <Button
                        type="button"
                        variant="ghost"
                        className="gap-1.5 text-text-muted hover:text-text"
                        onClick={resetFilters}
                    >
                        <X className="size-3.5" />
                        Reset
                    </Button>
                )}
            </div>

            <Dialog>
                <DialogTrigger className="md:hidden" asChild>
                    <Button
                        variant="outline"
                        className="border-border! cursor-pointer"
                    >
                        <SlidersHorizontal className="size-4 text-text-muted" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="items-center gap-3 flex-wrap">
                    <DialogHeader>
                        <DialogTitle>
                            Filters
                        </DialogTitle>
                        <DialogDescription>
                            Use filters for efficient search across time, status etc.
                        </DialogDescription>
                    </DialogHeader>
                    <Select value={filters.status} onValueChange={(v) => setStatus(v as StatusFilter)}>
                        <SelectTrigger className="w-36 bg-input border-border">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Time */}
                    <Select value={filters.time} onValueChange={(v) => setTime(v as TimeFilter)}>
                        <SelectTrigger className="w-36 bg-input border-border">
                            <SelectValue placeholder="Time" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="year">This Year</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Sort */}
                    <Select value={filters.sort} onValueChange={(v) => setSort(v as SortFilter)}>
                        <SelectTrigger className="w-40 bg-input border-border">
                            <SelectValue placeholder="Sort By" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest</SelectItem>
                            <SelectItem value="oldest">Oldest</SelectItem>
                            <SelectItem value="a-z">A - Z</SelectItem>
                            <SelectItem value="z-a">Z - A</SelectItem>
                            <SelectItem value="most-enrolled">Most Enrolled</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Reset */}
                </DialogContent>
                {isFiltered && (
                    <Button
                        type="button"
                        variant="ghost"
                        className="gap-1.5 text-text-muted hover:text-text"
                        onClick={resetFilters}
                    >
                        <X className="size-3.5" />
                        Reset
                    </Button>
                )}
            </Dialog>
        </div>
    )
}