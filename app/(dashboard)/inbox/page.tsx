"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import SortingMenu from "@/shared/common/features/SortingMenu";
import { Button } from "@/components/ui/button";
import useInboxStore, { InboxItem, InboxStatus, InboxType } from "@/shared/store/pages/inbox/useInboxStore";

const statusTabs: Array<{ key: InboxStatus; label: string }> = [
    { key: "unread", label: "Unread" },
    { key: "read", label: "Read" },
    { key: "archived", label: "Archived" },
];

const typeOptions: Array<{ label: string; value: InboxType | "" }> = [
    { label: "All types", value: "" },
    { label: "Batch", value: "batch" },
];

const formatDate = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString();
};

const resolveReference = (item: InboxItem) => {
    if (item.job?.title) {
        return `Job: ${item.job.title}`;
    }
    return "";
};

const resolveBatchSummary = (item: InboxItem) => {
    const batchMeta = (item.batch?.ai_meta ?? {}) as Record<string, unknown>;
    const openAiBatch = (batchMeta.openai_batch ?? {}) as Record<string, unknown>;
    const requestCounts = (openAiBatch.request_counts ?? {}) as Record<string, unknown>;
    const total = requestCounts.total;
    const totalValue = typeof total === "number" ? total : Number(total);
    if (Number.isFinite(totalValue) && totalValue > 0) {
        return `This batch analyzed ${totalValue} resume${totalValue === 1 ? "" : "s"}.`;
    }
    return "This batch analyzed resumes.";
};

const resolveBatchTimestamp = (item: InboxItem) => {
    const batchMeta = (item.batch?.ai_meta ?? {}) as Record<string, unknown>;
    const openAiBatch = (batchMeta.openai_batch ?? {}) as Record<string, unknown>;
    const completedAt = openAiBatch.completed_at;
    const inProgressAt = openAiBatch.in_progress_at;
    const value = typeof completedAt === "number"
        ? completedAt
        : typeof inProgressAt === "number"
            ? inProgressAt
            : null;
    if (!value) return "";
    return formatDate(new Date(value * 1000).toISOString());
};

const InboxPage = () => {
    const {
        inboxes,
        loadingInboxes,
        inboxActionLoading,
        getInboxes,
        archiveInbox,
        unarchiveInbox,
        markInboxRead,
    } = useInboxStore();
    const [status, setStatus] = useState<InboxStatus>("unread");
    const [typeFilter, setTypeFilter] = useState<InboxType | "">("");
    const [sortBy, setSortBy] = useState("created_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const filtersRef = useRef({
        status,
        typeFilter,
        sortBy,
        sortOrder,
    });

    useEffect(() => {
        getInboxes(status, sortBy, sortOrder, 1, typeFilter);
    }, [getInboxes, sortBy, sortOrder, status, typeFilter]);

    useEffect(() => {
        filtersRef.current = { status, typeFilter, sortBy, sortOrder };
    }, [status, typeFilter, sortBy, sortOrder]);

    useEffect(() => {
        const handleInboxCreated = () => {
            const current = filtersRef.current;
            getInboxes(current.status, current.sortBy, current.sortOrder, 1, current.typeFilter);
        };
        window.addEventListener("inbox:created", handleInboxCreated as EventListener);
        return () => {
            window.removeEventListener("inbox:created", handleInboxCreated as EventListener);
        };
    }, [getInboxes]);

    const sortOptions = useMemo(
        () => [
            { key: "created_at", value: "desc" as const },
            { key: "created_at", value: "asc" as const },
        ],
        []
    );

    const activeSort = useMemo(
        () => ({ key: sortBy, value: sortOrder }),
        [sortBy, sortOrder]
    );

    const handleArchive = async (item: InboxItem) => {
        const done = await archiveInbox(item.id);
        if (done) {
            getInboxes(status, sortBy, sortOrder, 1, typeFilter);
        }
    };

    const handleUnarchive = async (item: InboxItem) => {
        const done = await unarchiveInbox(item.id);
        if (done) {
            getInboxes(status, sortBy, sortOrder, 1, typeFilter);
        }
    };

    const handleMarkRead = async (item: InboxItem) => {
        const done = await markInboxRead(item.id);
        if (done) {
            getInboxes(status, sortBy, sortOrder, 1, typeFilter);
        }
    };

    const renderSkeleton = () => (
        <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
                <div
                    key={`inbox-skeleton-${index}`}
                    className="flex flex-col gap-3 rounded-md border border-blue-200 bg-white p-4 shadow-sm shadow-blue-200/60 md:flex-row md:items-center md:justify-between dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none"
                >
                    <div className="space-y-2">
                        <div className="h-3 w-32 animate-pulse rounded-md bg-blue-100/80 dark:bg-slate-700/60" />
                        <div className="h-4 w-48 animate-pulse rounded-md bg-blue-100/70 dark:bg-slate-700/50" />
                        <div className="h-3 w-64 animate-pulse rounded-md bg-blue-100/70 dark:bg-slate-700/50" />
                        <div className="h-3 w-24 animate-pulse rounded-md bg-blue-100/60 dark:bg-slate-700/40" />
                    </div>
                    <div className="flex flex-wrap gap-2 self-start md:self-center">
                        <div className="h-8 w-24 animate-pulse rounded-md bg-blue-100/70 dark:bg-slate-700/50" />
                        <div className="h-8 w-20 animate-pulse rounded-md bg-blue-100/70 dark:bg-slate-700/50" />
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                    {statusTabs.map((tab) => {
                        const isActive = status === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setStatus(tab.key)}
                                className={clsx(
                                    "rounded-md border px-3 py-2 text-xs font-semibold transition-colors",
                                    isActive
                                        ? "border-blue-400/60 bg-linear-to-r from-[#009ad5] to-[#005ca9] text-white"
                                        : "border-blue-200 bg-white text-blue-700 hover:bg-blue-50 dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                                )}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <select
                        value={typeFilter}
                        onChange={(event) => setTypeFilter(event.target.value as InboxType | "")}
                        className={clsx(
                            "w-full rounded-md border border-blue-200 bg-white p-2 text-xs text-blue-700 shadow-sm",
                            "focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-100",
                            "dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-100 dark:focus-visible:ring-slate-700/60"
                        )}
                    >
                        {typeOptions.map((option) => (
                            <option key={option.label} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <div className="min-w-[220px]">
                        <SortingMenu
                            options={sortOptions}
                            value={activeSort}
                            onChange={(key, order) => {
                                setSortBy(key);
                                setSortOrder(order);
                            }}
                            placeholder="Sort by"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {loadingInboxes ? (
                    renderSkeleton()
                ) : inboxes.length === 0 ? (
                    <div className="rounded-md border border-dashed border-blue-200 bg-white p-6 text-sm text-blue-700 dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-100">
                        No inboxes found.
                    </div>
                ) : (
                    inboxes.map((item) => {
                        const reference = resolveReference(item);
                        const batchSummary = item.type === "batch" ? resolveBatchSummary(item) : "";
                        const batchTimestamp = item.type === "batch" ? resolveBatchTimestamp(item) : "";
                        return (
                            <div
                                key={item.id}
                                className="flex flex-col gap-3 rounded-md border border-blue-200 bg-white p-4 shadow-sm shadow-blue-200/60 md:flex-row md:items-center md:justify-between dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none"
                            >
                                <div className="space-y-2">
                                    {reference ? (
                                        <p className="text-xs font-semibold text-blue-600 dark:text-blue-300">
                                            {reference}
                                        </p>
                                    ) : null}
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                        {item.title}
                                    </p>
                                    {item.description ? (
                                        <p className="text-xs text-slate-600 dark:text-slate-300">
                                            {item.description}
                                        </p>
                                    ) : null}
                                    {batchSummary ? (
                                        <p className="text-xs text-slate-600 dark:text-slate-300">
                                            {batchSummary}
                                        </p>
                                    ) : null}
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        {batchTimestamp || formatDate(item.created_at)}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2 self-start md:self-center">
                                    {status !== "archived" && item.status !== "read" && (
                                        <Button
                                            variant="secondary"
                                            className="h-8 px-4 text-xs"
                                            onClick={() => handleMarkRead(item)}
                                            disabled={inboxActionLoading === item.id}
                                        >
                                            Mark as read
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        className="h-8 px-4 text-xs"
                                        onClick={() =>
                                            status === "archived"
                                                ? handleUnarchive(item)
                                                : handleArchive(item)
                                        }
                                        disabled={inboxActionLoading === item.id}
                                    >
                                        {status === "archived" ? "Restore" : "Archive"}
                                    </Button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default InboxPage;