import { useQueryState, parseAsString, parseAsStringEnum } from "nuqs";

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

    const resetFilters = () => {
        setStatus('all')
        setTime('all')
        setSort('newest')
        setInstructorId('')
    }

    const isFiltered = status !== 'all' || time !== 'all' || sort !== 'newest' || instructorId !== ''

    return {
        filters: { status, time, sort, instructorId },
        setStatus, setTime, setSort, setInstructorId,
        resetFilters,
        isFiltered
    }
}