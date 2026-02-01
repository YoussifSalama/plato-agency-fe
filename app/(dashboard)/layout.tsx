"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/shared/components/layout/sidebar/Sidebar";
import Navbar from "@/shared/components/layout/navbar/Navbar";
import clsx from "clsx";
import useAgency from "@/shared/store/useAgency";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const {
        account,
        agencyStatus,
        loadingAgencyStatus,
        getMyAgencyAccountData,
        getAgencyStatus,
    } = useAgency();

    useEffect(() => {
        if (!account) {
            getMyAgencyAccountData();
        }
    }, [account, getMyAgencyAccountData]);

    useEffect(() => {
        getAgencyStatus();
    }, [getAgencyStatus]);

    const shouldBlock = useMemo(() => {
        if (!agencyStatus || loadingAgencyStatus) return false;
        return !agencyStatus.hasAgency;
    }, [agencyStatus, loadingAgencyStatus]);

    useEffect(() => {
        if (!shouldBlock) return;
        if (pathname.startsWith("/settings")) return;
        router.push("/settings");
    }, [pathname, router, shouldBlock]);

    return (
        <div
            className={clsx(
                "flex min-h-dvh bg-background text-foreground light-neutral-scope",
                "dark:bg-linear-to-br dark:from-slate-950 dark:to-slate-900"
            )}
        >
            <Sidebar isOpen={sidebarOpen} isCollapsed={sidebarCollapsed} />
            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Close sidebar"
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-30 bg-black/40 lg:hidden"
                />
            )}
            <main
                className={clsx(
                    "flex-1 min-w-0 overflow-x-hidden px-6 py-6 transition-[margin] duration-300",
                    sidebarCollapsed ? "lg:ml-0" : "lg:ml-72"
                )}
            >
                <Navbar
                    onMenuClick={() => setSidebarOpen(true)}
                    onToggleSidebar={() =>
                        setSidebarCollapsed((prev) => !prev)
                    }
                    isSidebarCollapsed={sidebarCollapsed}
                />
                {shouldBlock && !pathname.startsWith("/settings") && (
                    <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm font-medium">
                                Create or join an organization to unlock the employer dashboard.
                            </p>
                            <Link
                                href="/settings"
                                className="inline-flex items-center rounded-md bg-amber-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-amber-700"
                            >
                                Go to settings
                            </Link>
                        </div>
                    </div>
                )}
                <div className="mt-6">
                    {shouldBlock && !pathname.startsWith("/settings") ? null : children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;

