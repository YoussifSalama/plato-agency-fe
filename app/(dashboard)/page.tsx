"use client";

import { useEffect, useMemo, useState } from "react";
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import clsx from "clsx";
import useDashboardStore from "@/shared/store/pages/dashboard/useDashboardStore";

type TabKey = "jobs" | "resumes" | "invitations";

const DashboardPage = () => {
    const { stats, loading, getDashboard } = useDashboardStore();
    const [tab, setTab] = useState<TabKey>("jobs");

    useEffect(() => {
        getDashboard();
    }, [getDashboard]);

    const showSkeleton = loading || !stats;
    const totals = stats?.totals;
    const trend = stats?.trend ?? [];

    const cards = useMemo(
        () => [
            { label: "Total jobs", value: totals?.totalJobs ?? 0 },
            { label: "Active jobs", value: totals?.activeJobs ?? 0 },
            { label: "Total resumes", value: totals?.totalResumes ?? 0 },
            { label: "Analyzed resumes", value: totals?.analyzedResumes ?? 0 },
        ],
        [totals]
    );

    const tabMetrics = useMemo(() => {
        if (!totals) return [];
        if (tab === "jobs") {
            return [
                { label: "Total jobs", value: totals.totalJobs },
                { label: "Active jobs", value: totals.activeJobs },
            ];
        }
        if (tab === "resumes") {
            return [
                { label: "Total resumes", value: totals.totalResumes },
                { label: "Analyzed resumes", value: totals.analyzedResumes },
                { label: "Auto denied", value: totals.autoDenied },
                { label: "Auto shortlisted", value: totals.autoShortlisted },
                { label: "Auto invited", value: totals.autoInvited },
            ];
        }
        return [
            { label: "Invitations sent", value: totals.invitations },
            { label: "Auto invited", value: totals.autoInvited },
        ];
    }, [tab, totals]);

    const renderSkeleton = () => (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={`dashboard-card-skeleton-${index}`}
                        className="rounded-md border border-blue-200 bg-white p-4 shadow-sm shadow-blue-200/40 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none"
                    >
                        <div className="h-3 w-24 animate-pulse rounded-md bg-blue-100/80 dark:bg-slate-700/60" />
                        <div className="mt-3 h-8 w-20 animate-pulse rounded-md bg-blue-100/70 dark:bg-slate-700/50" />
                    </div>
                ))}
            </div>

            <div className="rounded-md border border-blue-200 bg-white p-4 shadow-sm shadow-blue-200/40 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-2">
                        <div className="h-4 w-36 animate-pulse rounded-md bg-blue-100/80 dark:bg-slate-700/60" />
                        <div className="h-3 w-44 animate-pulse rounded-md bg-blue-100/70 dark:bg-slate-700/50" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div
                                key={`dashboard-tab-skeleton-${index}`}
                                className="h-8 w-20 animate-pulse rounded-md bg-blue-100/80 dark:bg-slate-700/60"
                            />
                        ))}
                    </div>
                </div>
                <div className="mt-4 h-64 animate-pulse rounded-md bg-blue-100/70 dark:bg-slate-700/50" />
            </div>

            <div className="rounded-md border border-blue-200 bg-white p-4 shadow-sm shadow-blue-200/40 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="h-4 w-32 animate-pulse rounded-md bg-blue-100/80 dark:bg-slate-700/60" />
                    <div className="h-3 w-36 animate-pulse rounded-md bg-blue-100/70 dark:bg-slate-700/50" />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div
                            key={`dashboard-metric-skeleton-${index}`}
                            className="rounded-md border border-blue-100 bg-blue-50/60 p-3 dark:border-slate-700/60 dark:bg-slate-800/60"
                        >
                            <div className="h-3 w-24 animate-pulse rounded-md bg-blue-100/80 dark:bg-slate-700/60" />
                            <div className="mt-2 h-6 w-16 animate-pulse rounded-md bg-blue-100/70 dark:bg-slate-700/50" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Agency Dashboard
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Track jobs, resumes, and invitations at a glance.
                </p>
            </div>

            {showSkeleton ? (
                renderSkeleton()
            ) : (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {cards.map((card) => (
                            <div
                                key={card.label}
                                className="rounded-md border border-blue-200 bg-white p-4 shadow-sm shadow-blue-200/40 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none"
                            >
                                <p className="text-xs font-semibold uppercase tracking-wide text-blue-500 dark:text-blue-300">
                                    {card.label}
                                </p>
                                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                                    {card.value}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-md border border-blue-200 bg-white p-4 shadow-sm shadow-blue-200/40 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    14-day activity
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Analyzed resumes and invitations
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { key: "jobs", label: "Jobs" },
                                    { key: "resumes", label: "Resumes" },
                                    { key: "invitations", label: "Invitations" },
                                ].map((option) => (
                                    <button
                                        key={option.key}
                                        onClick={() => setTab(option.key as TabKey)}
                                        className={clsx(
                                            "rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors",
                                            tab === option.key
                                                ? "border-blue-400/60 bg-linear-to-r from-[#009ad5] to-[#005ca9] text-white"
                                                : "border-blue-200 bg-white text-blue-700 hover:bg-blue-50 dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                                        )}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="mt-4 h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="analyzed"
                                        stroke="#0ea5e9"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="invited"
                                        stroke="#22c55e"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="rounded-md border border-blue-200 bg-white p-4 shadow-sm shadow-blue-200/40 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {tab === "jobs"
                                    ? "Job metrics"
                                    : tab === "resumes"
                                        ? "Resume metrics"
                                        : "Invitation metrics"}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Summary for selected tab
                            </p>
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {tabMetrics.map((metric) => (
                                <div
                                    key={metric.label}
                                    className="rounded-md border border-blue-100 bg-blue-50/60 p-3 text-sm text-blue-700 dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-100"
                                >
                                    <p className="text-xs font-semibold uppercase tracking-wide">
                                        {metric.label}
                                    </p>
                                    <p className="mt-1 text-lg font-semibold">
                                        {metric.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default DashboardPage;