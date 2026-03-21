import { BookOpen, BookPlus, Edit, GraduationCap, Home, IdCard, LayoutDashboard, Library, Lock, MessageSquareMore, Plus, Settings, Sparkles, User2, UserPlus2, Users2, Video } from "lucide-react";
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

            },
            {
                href: `/${slug}/courses`,
                label: 'Courses',
                icon: BookOpen,

            },
            {
                href: `/${slug}/sessions`,
                label: 'Sessions',
                icon: Video,

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

            },
            {
                href: `/${slug}/library`,
                label: 'My Library',
                icon: Library,

            },
            {
                href: `/${slug}/community/general`,
                label: 'Community',
                icon: MessageSquareMore,

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

            },
            {
                href: `/${slug}/admin/analytics`,
                label: 'Admin',
                icon: Lock,

            },
        ],
    },
];

export const ownerRoutes = (slug: string) => [
    {
        type: RouteType.GROUP,
        label: 'MENU',
        routes: [
            {
                href: `/${slug}/home`,
                label: 'Home',
                icon: Home,

            },
            {
                href: `/${slug}/community/general`,
                label: 'Community',
                icon: MessageSquareMore,

            },
            {
                href: `/${slug}/admin/analytics`,
                label: 'Analytics',
                icon: LayoutDashboard,

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
            },
            {
                href: `/${slug}/admin/sessions`,
                label: 'Sessions',
                icon: Video,
            },
            {
                href: `/${slug}/admin/posts`,
                label: 'Posts',
                icon: IdCard,
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

            },
            {
                href: `/${slug}/admin/team`,
                label: 'Team',
                icon: Users2,

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

            },
            {
                href: `/${slug}/admin/settings`,
                label: 'Settings',
                icon: Settings,

            },
        ],
    },
];

export const allRoutes = (slug: string) => [
    {
        href: `/${slug}/home`,
        label: 'Home',
        icon: Home,
    },
    {
        href: `/${slug}/dashboard`,
        label: 'Dashboard',
        icon: LayoutDashboard,

    },
    {
        href: `/${slug}/library`,
        label: 'My Library',
        icon: Library,

    },
    {
        href: `/${slug}/community/general`,
        label: 'Community',
        icon: MessageSquareMore,
    },
    {
        href: `/${slug}/admin/courses`,
        label: 'Courses',
        icon: BookOpen,
    },
    {
        href: `/${slug}/admin/courses/add`,
        label: 'Add Course',
        icon: BookPlus,
    },
    {
        href: `/${slug}/admin/sessions`,
        label: 'Sessions',
        icon: Video,
    },
    {
        href: `/${slug}/admin/sessions/add`,
        label: 'Add Session',
        icon: Plus,
    },
    {
        href: `/${slug}/admin/posts`,
        label: 'Posts',
        icon: IdCard,
    },
    {
        href: `/${slug}/admin/posts/add`,
        label: 'Add Post',
        icon: Edit,
    },
    {
        href: `/${slug}/admin/analytics`,
        label: 'Analytics',
        icon: LayoutDashboard,
    },
    {
        href: `/${slug}/admin/courses`,
        label: 'Courses',
        icon: BookOpen,
    },
    {
        href: `/${slug}/admin/sessions`,
        label: 'Sessions',
        icon: Video,
    },
    {
        href: `/${slug}/admin/posts`,
        label: 'Posts',
        icon: IdCard,
    },
    {
        href: `/${slug}/admin/students`,
        label: 'Students',
        icon: GraduationCap,
    },
    {
        href: `/${slug}/admin/team`,
        label: 'Team',
        icon: Users2,
    },
    {
        href: `/${slug}/admin/invites`,
        label: 'Invites',
        icon: UserPlus2,
    },
    {
        href: `/${slug}/admin/settings`,
        label: 'Settings',
        icon: Settings,
    },
];