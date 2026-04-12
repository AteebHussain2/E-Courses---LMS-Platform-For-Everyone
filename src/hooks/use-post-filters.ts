import { useQueryState, parseAsStringEnum, parseAsInteger } from "nuqs";

export type PostTypeFilter = 'all' | 'post' | 'announcement' | 'poll'
export type TimeFilter = 'today' | 'week' | 'month' | 'year' | 'all'
export type SortFilter = 'newest' | 'oldest'

export function usePostFilters() {
    const [type, setType] = useQueryState(
        'type',
        parseAsStringEnum<PostTypeFilter>(['all', 'post', 'announcement', 'poll']).withDefault('all')
    )
    const [time, setTime] = useQueryState(
        'time',
        parseAsStringEnum<TimeFilter>(['today', 'week', 'month', 'year', 'all']).withDefault('all')
    )
    const [sort, setSort] = useQueryState(
        'sort',
        parseAsStringEnum<SortFilter>(['newest', 'oldest']).withDefault('newest')
    )
    const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))

    const handleSetType = (v: PostTypeFilter) => { setType(v); setPage(1) }
    const handleSetTime = (v: TimeFilter) => { setTime(v); setPage(1) }
    const handleSetSort = (v: SortFilter) => { setSort(v); setPage(1) }

    const resetFilters = () => { setType('all'); setTime('all'); setSort('newest'); setPage(1) }
    const isFiltered = type !== 'all' || time !== 'all' || sort !== 'newest'

    return {
        filters: { type, time, sort, page },
        setType: handleSetType,
        setTime: handleSetTime,
        setSort: handleSetSort,
        setPage,
        resetFilters,
        isFiltered
    }
}