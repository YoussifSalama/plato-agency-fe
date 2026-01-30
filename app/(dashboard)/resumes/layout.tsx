"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import LayoutTabsRouter from "@/shared/common/layout/LayoutTabsRouter";
import { resumeTabs } from "@/shared/core/layout/resume/tabs";
import clsx from "clsx";

const ResumesLayout = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const isDetailsPage =
        pathname.startsWith("/resumes/") &&
        pathname !== "/resumes" &&
        !pathname.startsWith("/resumes/analyse");
    return (
        <div className={clsx("space-y-4")}>
            {isDetailsPage ? (
                <Link
                    href="/resumes"
                    className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                    <ArrowLeft className="h-4 w-4" />
                    All resumes
                </Link>
            ) : (
                <LayoutTabsRouter tabs={resumeTabs} />
            )}
            {children}
        </div>
    );
};

export default ResumesLayout;

