import { BookOpen, GraduationCap, Home, IdCard, LayoutDashboard, Library, Lock, MessageSquareMore, Settings, Sparkles, User2, UserPlus2, Users2, Video } from "lucide-react";
import { Role } from "@/generated/prisma/enums";
import { RouteType } from "./types";

export function getRoutes(slug: string, role?: Role) {
    switch (role) {
        case Role.STUDENT:
            return studentRoutes(slug);
        case Role.OWNER:
            return ownerRoutes(slug);
        default:
            return studentRoutes(slug);
    }
};

const studentRoutes = (slug: string) => [
    {
        type: RouteType.GROUP,
        label: 'MENU',
        routes: [
            {
                href: `/${slug}/home`,
                label: 'Home',
                icon: Home,
                subRoutes: []
            },
            {
                href: `/${slug}/courses`,
                label: 'Courses',
                icon: BookOpen,
                subRoutes: []
            },
            {
                href: `/${slug}/sessions`,
                label: 'Sessions',
                icon: Video,
                subRoutes: []
            },
        ],
    },
    {
        type: RouteType.GROUP,
        label: 'FOR YOU',
        routes: [
            {
                href: `/${slug}/dashboard`,
                label: 'Dashboard',
                icon: LayoutDashboard,
                subRoutes: []
            },
            {
                href: `/${slug}/library`,
                label: 'My Library',
                icon: Library,
                subRoutes: []
            },
            {
                href: `/${slug}/community/general`,
                label: 'Community',
                icon: MessageSquareMore,
                subRoutes: []
            },
        ],
    },
    {
        type: RouteType.GROUP,
        label: 'TOOLS',
        routes: [
            {
                href: `/${slug}/ai`,
                label: 'AI Tutor',
                icon: Sparkles,
                subRoutes: []
            },
            {
                href: `/${slug}/analytics`,
                label: 'Admin',
                icon: Lock,
                subRoutes: []
            },
        ],
    },
];

export const ownerRoutes = (slug: string) => {
    return [
        {
            type: RouteType.GROUP,
            label: 'MENU',
            routes: [
                {
                    href: `/${slug}/home`,
                    label: 'Home',
                    icon: Home,
                    subRoutes: []
                },
                {
                    href: `/${slug}/community/general`,
                    label: 'Community',
                    icon: MessageSquareMore,
                    subRoutes: []
                },
                {
                    href: `/${slug}/admin/analytics`,
                    label: 'Analytics',
                    icon: LayoutDashboard,
                    subRoutes: []
                },
            ],
        },
        {
            type: RouteType.COLLAPSIBLE,
            label: 'CONTENT',
            routes: [
                {
                    href: `/${slug}/admin/courses`,
                    label: 'Courses',
                    icon: BookOpen,
                    subRoutes: [
                        {
                            href: `/${slug}/admin/courses`,
                            label: 'View Courses'
                        },
                        {
                            href: `/${slug}/admin/courses/add`,
                            label: 'New Course'
                        }
                    ]
                },
                {
                    href: `/${slug}/admin/sessions`,
                    label: 'Sessions',
                    icon: Video,
                    subRoutes: [
                        {
                            href: `/${slug}/admin/sessions`,
                            label: 'View Sessions'
                        },
                        {
                            href: `/${slug}/admin/sessions/add`,
                            label: 'New Session'
                        }
                    ]
                },
                {
                    href: `/${slug}/admin/posts`,
                    label: 'Posts',
                    icon: IdCard,
                    subRoutes: [
                        {
                            href: `/${slug}/posts`,
                            label: 'View Posts'
                        },
                        {
                            href: `/${slug}/posts/add`,
                            label: 'Add Post'
                        },
                    ],
                },
            ]
        },
        {
            type: RouteType.GROUP,
            label: 'MEMBERS',
            routes: [
                {
                    href: `/${slug}/admin/students`,
                    label: 'Students',
                    icon: GraduationCap,
                    subRoutes: []
                },
                {
                    href: `/${slug}/admin/team`,
                    label: 'Team',
                    icon: Users2,
                    subRoutes: []
                },
            ],
        },
        {
            type: RouteType.GROUP,
            label: 'TOOLS',
            routes: [
                {
                    href: `/${slug}/admin/invites`,
                    label: 'Invites',
                    icon: UserPlus2,
                    subRoutes: []
                },
                {
                    href: `/${slug}/admin/settings`,
                    label: 'Settings',
                    icon: Settings,
                    subRoutes: []
                },
            ],
        },
    ];
}