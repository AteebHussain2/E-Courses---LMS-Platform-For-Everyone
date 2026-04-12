"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PostTypeFilter, SortFilter, TimeFilter, usePostFilters } from "@/hooks/use-post-filters";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function PostFilters() {
    const [show, setShow] = useState(false)
    const { filters, setType, setTime, setSort, resetFilters, isFiltered } = usePostFilters()

    const Selects = () => (
        <>
            <Select value={filters.type} onValueChange={(v) => setType(v as PostTypeFilter)}>
                <SelectTrigger className="w-36 bg-input border-border">
                    <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="post">Posts</SelectItem>
                    <SelectItem value="announcement">Announcements</SelectItem>
                    <SelectItem value="poll">Polls</SelectItem>
                </SelectContent>
            </Select>

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

            <Select value={filters.sort} onValueChange={(v) => setSort(v as SortFilter)}>
                <SelectTrigger className="w-36 bg-input border-border">
                    <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
            </Select>

            {isFiltered && (
                <Button type="button" variant="ghost" className="gap-1.5 text-muted cursor-pointer" onClick={resetFilters}>
                    <X className="size-3.5" /> Reset
                </Button>
            )}
        </>
    )

    return (
        <div className="flex items-center gap-3">
            <Button
                variant="outline"
                className="border-border! cursor-pointer md:flex hidden"
                onClick={() => setShow(!show)}
            >
                <SlidersHorizontal className="size-4 text-muted" />
            </Button>

            <div className={cn("items-center gap-3 flex-wrap", show ? 'flex md:hidden' : 'hidden md:flex')}>
                <Selects />
            </div>
        </div>
    )
}