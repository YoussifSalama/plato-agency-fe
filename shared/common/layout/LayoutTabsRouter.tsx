"use client";

import { ITab } from "@/shared/core/layout/resume/tabs";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LayoutTabsRouter = ({ tabs }: { tabs: ITab[] }) => {
    const pathname = usePathname();
    return <div
        className={clsx(
            "flex items-center gap-2 rounded-md border border-blue-200 bg-white p-4 text-xs shadow-sm shadow-blue-200/60",
            "dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none"
        )}
    >
        {
            tabs.map((tab, index) => {
                const isActive = pathname === tab.href;
                return <Link key={index} href={tab.href} className={clsx(
                    "p-2", "flex items-center gap-2 rounded-md transition-colors",
                    isActive
                        ? "text-white border border-blue-400/60 bg-linear-to-r from-[#009ad5] to-[#005ca9] dark:shadow-none"
                        : "text-blue-700/70 hover:text-blue-700 hover:bg-blue-100/80 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-slate-100"
                )}>
                    <tab.icon size={20} />
                    {tab.label}
                </Link>
            })
        }
    </div>;
};

export default LayoutTabsRouter;