import { useQueryState, parseAsString, parseAsStringEnum, parseAsInteger } from "nuqs";

export type StatusFilter = 'all' | 'active' | 'inactive'
export type TimeFilter = 'today' | 'week' | 'month' | 'year' | 'all'
export type SortFilter = 'newest' | 'oldest' | 'a-z' | 'z-a' | 'most-enrolled'

export function useCourseFilters() {
    const [status, setStatus] = useQueryState(
        'status',
        parseAsStringEnum<StatusFilter>(['all', 'active', 'inactive']).withDefault('all')
    )
    const [time, setTime] = useQueryState(
        'time',
        parseAsStringEnum<TimeFilter>(['today', 'week', 'month', 'year', 'all']).withDefault('all')
    )
    const [sort, setSort] = useQueryState(
        'sort',
        parseAsStringEnum<SortFilter>(['newest', 'oldest', 'a-z', 'z-a', 'most-enrolled']).withDefault('newest')
    )
    const [instructorId, setInstructorId] = useQueryState(
        'instructorId',
        parseAsString.withDefault('')
    )
    const [page, setPage] = useQueryState(
        'page',
        parseAsInteger.withDefault(1)
    )

    const handleSetStatus = (v: StatusFilter) => { setStatus(v); setPage(1) }
    const handleSetTime = (v: TimeFilter) => { setTime(v); setPage(1) }
    const handleSetSort = (v: SortFilter) => { setSort(v); setPage(1) }
    const handleSetInstructorId = (v: string) => { setInstructorId(v); setPage(1) }

    const resetFilters = () => {
        setStatus('all')
        setTime('all')
        setSort('newest')
        setInstructorId('')
        setPage(1)
    }

    const isFiltered = status !== 'all' || time !== 'all' || sort !== 'newest' || instructorId !== ''

    return {
        filters: { status, time, sort, instructorId, page },
        setStatus: handleSetStatus,
        setTime: handleSetTime,
        setSort: handleSetSort,
        setInstructorId: handleSetInstructorId,
        setPage,
        resetFilters,
        isFiltered
    }
}