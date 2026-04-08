import { Session } from '@/generated/prisma/client';
import { AdminSessionCard } from './SessionCard';

type SessionsGridProps = {
    isLoading: boolean,
    sessions?: Session[]
}

const SessionsGrid = ({ isLoading = true, sessions }: SessionsGridProps) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 gap-5">
            {!isLoading ? sessions?.map(session => (
                <AdminSessionCard key={session.id} session={session} />
            )) : (
                <>Loading...</>
            )}
        </div>
    )
}

export default SessionsGrid