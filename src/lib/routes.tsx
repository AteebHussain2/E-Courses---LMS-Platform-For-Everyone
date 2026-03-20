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
        type: RouteType.GROUP,
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
        type: RouteType.GROUP,
        label: 'TOOLS',
        routes: [
            {
                href: `/${slug}/ai`,
                label: 'AI Tutor',
                icon: Sparkles
            },
            {
                href: `/${slug}/analytics`,
                label: 'Admin',
                icon: Lock
            },
        ],
    },
];

const ownerRoutes = (slug: string) => {
    return [
        {
            type: RouteType.GROUP,
            label: 'MENU',
            routes: [
                {
                    href: `/${slug}/home`,
                    label: 'Home',
                    icon: Home
                },
                {
                    href: `/${slug}/community/general`,
                    label: 'Community',
                    icon: MessageSquareMore
                },
                {
                    href: `/${slug}/analytics`,
                    label: 'Analytics',
                    icon: LayoutDashboard
                },
            ],
        },
        {
            type: RouteType.GROUP,
            label: 'CONTENT',
            routes: [
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
                {
                    href: `/${slug}/posts`,
                    label: 'Posts',
                    icon: IdCard
                },
            ]
        },
        {
            type: RouteType.GROUP,
            label: 'MEMBERS',
            routes: [
                {
                    href: `/${slug}/students`,
                    label: 'Students',
                    icon: GraduationCap
                },
                {
                    href: `/${slug}/team`,
                    label: 'Team',
                    icon: Users2
                },
            ],
        },
        {
            type: RouteType.GROUP,
            label: 'TOOLS',
            routes: [
                {
                    href: `/${slug}/invites`,
                    label: 'Invites',
                    icon: UserPlus2
                },
                {
                    href: `/${slug}/settings`,
                    label: 'Settings',
                    icon: Settings
                },
            ],
        },
    ];
}