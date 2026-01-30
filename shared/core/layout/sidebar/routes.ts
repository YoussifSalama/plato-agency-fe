import type { LucideIcon } from "lucide-react";
import { Briefcase, FileText, Inbox, LayoutDashboard, Settings } from "lucide-react";

export interface ISidebarRoute {
    label: string;
    icon: LucideIcon;
    href: string;
}

export const sidebarRoutes: ISidebarRoute[] = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/",
    },
    {
        label: "Resumes",
        icon: FileText,
        href: "/resumes",
    },
    {
        label: "Jobs",
        icon: Briefcase,
        href: "/jobs",
    },
    {
        label: "Inbox",
        icon: Inbox,
        href: "/inbox",
    },
    {
        label: "Settings",
        icon: Settings,
        href: "/settings",
    },
];