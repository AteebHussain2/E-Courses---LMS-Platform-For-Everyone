"use client"

import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PaginationProps = {
    total: number
    currentPage: number
    onPageChange: (page: number) => void
}

const LIMIT = 12
const MAX_VISIBLE_PAGES = 5

export default function Pagination({ total, currentPage, onPageChange }: PaginationProps) {
    const totalPages = Math.ceil(total / LIMIT)
    if (totalPages <= 1) return null

    const getVisiblePages = () => {
        const half = Math.floor(MAX_VISIBLE_PAGES / 2)
        let start = Math.max(1, currentPage - half)
        let end = Math.min(totalPages, start + MAX_VISIBLE_PAGES - 1)

        if (end - start < MAX_VISIBLE_PAGES - 1) {
            start = Math.max(1, end - MAX_VISIBLE_PAGES + 1)
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i)
    }

    const visiblePages = getVisiblePages()
    const btnBase = "text-sm! font-normal! border-border! cursor-pointer h-[34px] bg-input! text-text! hover:bg-background-secondary!"
    const iconBtnBase = "border-border! cursor-pointer h-[34px] bg-input! text-text! hover:bg-background-secondary!"

    return (
        <ButtonGroup className="flex items-center justify-center border-none">
            {/* First */}
            <Button
                variant="outline"
                size="icon-sm"
                disabled={currentPage === 1}
                className={cn(iconBtnBase, "rounded-l-sm!")}
                onClick={() => onPageChange(1)}
                aria-label="First"
            >
                <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* Previous */}
            <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                className={btnBase}
                onClick={() => onPageChange(currentPage - 1)}
            >
                Previous
            </Button>

            {/* Leading ellipsis */}
            {visiblePages[0] > 1 && (
                <Button variant="outline" size="sm" className={btnBase} disabled>
                    ...
                </Button>
            )}

            {/* Page numbers */}
            {visiblePages.map((page) => (
                <Button
                    key={page}
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(page)}
                    className={cn(
                        "transition-colors border-border! cursor-pointer h-8.5",
                        page === currentPage
                            ? "bg-primary! text-primary-foreground! hover:bg-primary!"
                            : btnBase
                    )}
                >
                    {page}
                </Button>
            ))}

            {/* Trailing ellipsis */}
            {visiblePages[visiblePages.length - 1] < totalPages && (
                <Button variant="outline" size="sm" className={btnBase} disabled>
                    ...
                </Button>
            )}

            {/* Next */}
            <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                className={btnBase}
                onClick={() => onPageChange(currentPage + 1)}
            >
                Next
            </Button>

            {/* Last */}
            <Button
                variant="outline"
                size="icon-sm"
                disabled={currentPage === totalPages}
                className={cn(iconBtnBase, "rounded-r-sm!")}
                onClick={() => onPageChange(totalPages)}
                aria-label="Last"
            >
                <ChevronsRight className="h-4 w-4" />
            </Button>
        </ButtonGroup>
    )
}