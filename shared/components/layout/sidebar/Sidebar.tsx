"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import ThemeSwitch from "../theme/ThemeSwitch";
import { sidebarRoutes } from "@/shared/core/layout/sidebar/routes";

const Sidebar = ({
    isOpen,
    isCollapsed,
}: {
    isOpen: boolean;
    isCollapsed: boolean;
}) => {
    const pathname = usePathname();

    return (
        <aside
            className={clsx(
                "fixed inset-y-0 left-0 z-40 w-72 transition-transform duration-300",
                isOpen ? "translate-x-0" : "-translate-x-full",
                isCollapsed ? "lg:-translate-x-full" : "lg:translate-x-0",
                "lg:fixed lg:top-0",
                "border-r border-blue-200 bg-blue-50 text-blue-700 dark:border-slate-700/60 dark:bg-slate-950 dark:text-slate-200"
            )}
        >
            <div className="flex items-center justify-between px-5 py-4">
                <Link href="/" className="flex items-center gap-2">
                    <img
                        src="/brand/plato-logo.png"
                        alt="Plato logo"
                        className="h-8 w-8 object-contain"
                        width={32}
                        height={32}
                    />
                    <span className="text-sm font-semibold tracking-wide text-blue-700 dark:text-blue-300">
                        PLATO
                    </span>
                </Link>
                <ThemeSwitch />
            </div>

            <div className="px-3">
                <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-600/70 dark:text-slate-400">
                    Overview
                </p>
                <nav className="mt-3 space-y-1">
                    {sidebarRoutes.map((route) => {
                        const isActive =
                            pathname === route.href ||
                            pathname?.startsWith(`${route.href}/`) ||
                            (route.href === "/jobs" && pathname?.startsWith("/job/"));
                        const Icon = route.icon;

                        return (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={clsx(
                                    "group flex items-center gap-3 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "text-white border border-blue-400/60 bg-linear-to-r from-[#009ad5] to-[#005ca9] shadow-md shadow-blue-200/60 dark:shadow-none"
                                        : "text-blue-700/70 hover:bg-blue-100/80 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-slate-100"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                <span>{route.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;