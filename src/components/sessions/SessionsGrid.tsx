import { SessionWithDetails } from '@/actions/sessions';
import { AdminSessionCard } from './SessionCard';

type SessionsGridProps = {
    isLoading: boolean,
    sessions?: SessionWithDetails[],
    communitySlug: string,
}

const SessionsGrid = ({ isLoading = true, sessions, communitySlug }: SessionsGridProps) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 gap-5">
            {!isLoading ? sessions?.map(session => (
                <AdminSessionCard key={session.id} session={session} communitySlug={communitySlug} />
            )) : (
                <span>
                    Loading...
                </span>
                // Array.from({length: 6 }).map((_, i) => (
                //     <div key={i} className="rounded-xl bg-card animate-pulse aspect-4/3" />
                // ))
            )}
        </div>
    )
}

export default SessionsGrid