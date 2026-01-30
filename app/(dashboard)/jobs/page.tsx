"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import JobTable from "@/shared/components/pages/job/JobTable";
import { useJobStore } from "@/shared/store/pages/job/useJobStore";
import SearchBar from "@/shared/common/features/SearchBar";
import SortingMenu from "@/shared/common/features/SortingMenu";
import PaginationBar from "@/shared/common/features/PaginationBar";

type JobFilterState = {
    partial_matching: string;
    sort_by: string;
    sort_order: "asc" | "desc";
    page: number;
};

const JobsPage = () => {
    const { jobs, loadingJobs, hasLoadedJobs, meta, getJobs } = useJobStore();
    const [filters, setFilters] = useState<JobFilterState>({
        partial_matching: "",
        sort_by: "created_at",
        sort_order: "desc",
        page: 1,
    });
    const lastQueryRef = useRef<string | null>(null);

    useEffect(() => {
        const queryKey = `${filters.partial_matching}|${filters.sort_by}|${filters.sort_order}|${filters.page}`;
        if (lastQueryRef.current === queryKey) return;
        lastQueryRef.current = queryKey;
        getJobs(
            filters.partial_matching,
            filters.sort_by,
            filters.sort_order,
            filters.page,
        );
    }, [filters, getJobs]);

    return (
        <section className="space-y-6">
            <div className="flex flex-col gap-4 rounded-md border border-blue-200 bg-white p-6 shadow-xl shadow-blue-200/60 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-blue-700 dark:text-slate-100">
                        Jobs
                    </h2>
                    <p className="text-sm text-blue-600 dark:text-slate-300">
                        Manage your job postings and hiring pipelines.
                    </p>
                </div>
                <Button
                    asChild
                    className="rounded-md bg-linear-to-r from-[#009ad5] to-[#005ca9] text-white hover:from-[#009ad5] hover:to-[#005ca9]"
                >
                    <Link href="/jobs/new">Add new job</Link>
                </Button>
            </div>
            <div className="rounded-md border border-blue-200 bg-white p-6 shadow-xl shadow-blue-200/60 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="w-full sm:w-[220px]">
                        <SortingMenu
                            options={[
                                { key: "created_at", value: "desc" },
                                { key: "created_at", value: "asc" },
                                { key: "title", value: "asc" },
                                { key: "title", value: "desc" },
                            ]}
                            value={{ key: filters.sort_by, value: filters.sort_order }}
                            onChange={(key: string, value) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    sort_by: key,
                                    sort_order: value,
                                    page: 1,
                                }))
                            }
                        />
                    </div>
                    <div className="flex-1">
                        <SearchBar
                            hideSearchButton={true}
                            placeholder="Search jobs"
                            onChange={(value: string) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    partial_matching: value,
                                    page: 1,
                                }))
                            }
                        />
                    </div>
                </div>
                <JobTable jobs={jobs} loading={loadingJobs} hasLoaded={hasLoadedJobs} />
                {meta && meta.total_pages > 1 && (
                    <div className="mt-4">
                        <PaginationBar
                            currentPage={meta.page ?? filters.page}
                            totalPages={meta.total_pages ?? 1}
                            onPageChange={(page) =>
                                setFilters((prev) => ({ ...prev, page }))
                            }
                        />
                    </div>
                )}
            </div>
        </section>
    );
};

export default JobsPage;

