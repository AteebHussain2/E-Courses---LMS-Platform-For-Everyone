import { BookOpen, Home, LayoutDashboard, Library, Lock, MessageSquareMore, Settings, Sparkles, Video } from "lucide-react"

export function getRoutes(slug: string) {
    return [
        {
            type: 'GROUP',
            label: 'MENU',
            routes: [
                {
                    href: `/${slug}/home`,
                    label: 'Home',
                    icon: Home
                },
                {
                    href: `/${slug}/courses`,
                    label: 'Courses',
                    icon: BookOpen
                },
                {
                    href: `/${slug}/sessions`,
                    label: 'Sessions',
                    icon: Video
                },
            ],
        },
        {
            type: 'GROUP',
            label: 'FOR YOU',
            routes: [
                {
                    href: `/${slug}/dashboard`,
                    label: 'Dashboard',
                    icon: LayoutDashboard
                },
                {
                    href: `/${slug}/library`,
                    label: 'My Library',
                    icon: Library
                },
                {
                    href: `/${slug}/community/general`,
                    label: 'Community',
                    icon: MessageSquareMore
                },
            ],
        },
        {
            type: 'GROUP',
            label: 'TOOLS',
            routes: [
                {
                    href: `/${slug}/ai`,
                    label: 'AI Tutor',
                    icon: Sparkles
                },
                {
                    href: `/${slug}/admin`,
                    label: 'Admin',
                    icon: Lock
                },
            ],
        },
    ];
};