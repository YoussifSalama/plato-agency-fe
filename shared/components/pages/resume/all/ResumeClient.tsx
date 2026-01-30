"use client";
import SearchBar from "@/shared/common/features/SearchBar";
import SortingMenu from "@/shared/common/features/SortingMenu";
import { useResumeStore } from "@/shared/store/pages/resume/useResumeStore";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import ResumeTable from "./ResumeTable";
import PaginationBar from "@/shared/common/features/PaginationBar";
import RecommendationFilter from "./RecommendationFilter";
import Combobox from "@/shared/components/common/Combobox";
import { useJobStore } from "@/shared/store/pages/job/useJobStore";
import { ToggleButton } from "@/components/ui/toggle-button";
interface IFilterObject {
    partial_matching: string | null;
    sort_by: string;
    sort_order: "asc" | "desc";
    page: number;
    recommendation: string | null;
    score: string | null;
    job_id: string | null;
    auto_invited: boolean | null;
    auto_shortlisted: boolean | null;
    auto_denied: boolean | null;
}

const formatDate = (value?: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString();
};

const ResumeFilters = ({
    filterObject,
    onChange,
    jobOptions,
    onSearchJobs,
    loadingJobs,
    onClear,
}: {
    filterObject: IFilterObject;
    onChange: (next: IFilterObject) => void;
    jobOptions: { label: string; value: string }[];
    onSearchJobs: (term: string) => void;
    loadingJobs: boolean;
    onClear: () => void;
}) => {
    return (
        <div className={clsx("space-y-2")}>
            <div className={clsx("flex flex-wrap items-center gap-2")}>
                <div className={clsx("w-full sm:w-[220px]")}>
                    <SortingMenu
                        options={[
                            { key: "updated_at", value: "desc" },
                            { key: "updated_at", value: "asc" },
                        ]}
                        value={{ key: filterObject.sort_by, value: filterObject.sort_order }}
                        onChange={(key: string, value) =>
                            onChange({ ...filterObject, sort_by: key, sort_order: value, page: 1 })
                        }
                    />
                </div>
                <div className={clsx("w-full sm:w-[220px]")}>
                    <RecommendationFilter
                        value={filterObject.recommendation}
                        onChange={(value) =>
                            onChange({
                                ...filterObject,
                                recommendation: value,
                                page: 1,
                            })
                        }
                    />
                </div>
                <div className={clsx("w-full sm:flex-1")}>
                    <Combobox
                        value={filterObject.job_id ?? ""}
                        onChange={(value) =>
                            onChange({ ...filterObject, job_id: value, page: 1 })
                        }
                        options={jobOptions}
                        placeholder="Filter by job"
                        searchPlaceholder="Search jobs..."
                        emptyLabel="No active jobs found."
                        disabled={loadingJobs}
                        onSearch={onSearchJobs}
                    />
                </div>
            </div>
            <div className={clsx("flex flex-wrap items-center gap-2")}>
                <div className={clsx("w-full sm:flex-1")}>
                    <SearchBar
                        hideSearchButton={true}
                        placeholder="Search"
                        onChange={(value: string) =>
                            onChange({ ...filterObject, partial_matching: value, page: 1 })
                        }
                    />
                </div>
                <div className={clsx("w-full sm:flex-1")}>
                    <SearchBar
                        hideSearchButton={true}
                        placeholder="Minimum score"
                        onChange={(value: string) =>
                            onChange({ ...filterObject, score: value, page: 1 })
                        }
                    />
                </div>
                <div className={clsx("w-full sm:w-auto")}>
                    <div className="flex flex-wrap items-center gap-2">
                        <ToggleButton
                            label="Invited"
                            value={filterObject.auto_invited}
                            tone="success"
                            onChange={(next) =>
                                onChange({
                                    ...filterObject,
                                    auto_invited: next,
                                    page: 1,
                                })
                            }
                        />
                        <ToggleButton
                            label="Shortlisted"
                            value={filterObject.auto_shortlisted}
                            tone="success"
                            onChange={(next) =>
                                onChange({
                                    ...filterObject,
                                    auto_shortlisted: next,
                                    page: 1,
                                })
                            }
                        />
                        <ToggleButton
                            label="Denied"
                            value={filterObject.auto_denied}
                            tone="danger"
                            onChange={(next) =>
                                onChange({
                                    ...filterObject,
                                    auto_denied: next,
                                    page: 1,
                                })
                            }
                        />
                    </div>
                </div>
                <div className={clsx("w-full sm:w-auto")}>
                    <button
                        type="button"
                        onClick={onClear}
                        className="w-full rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100/80 dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        Clear filters
                    </button>
                </div>
            </div>
        </div>
    );
};

const ResumeClient = () => {

    const [filterObject, setFilterObject] = useState<IFilterObject>({
        partial_matching: null,
        sort_by: "updated_at",
        sort_order: "desc",
        page: 1,
        recommendation: null,
        score: null,
        job_id: null,
        auto_invited: null,
        auto_shortlisted: null,
        auto_denied: null,
    });
    const {
        getResumes,
        resumes,
        loadingGetResumes,
        meta,
        actionLoading,
        denyResume,
        shortlistResume,
        inviteResume,
    } = useResumeStore();
    const { jobSearchResults, loadingJobSearch, searchJobs } = useJobStore();
    const lastQueryRef = useRef<string | null>(null);

    useEffect(() => {
        const partialMatching = filterObject.partial_matching ?? "";
        const recommendation = filterObject.recommendation ?? "";
        const score = filterObject.score ?? "";
        const jobId = filterObject.job_id ?? "";
        const queryKey = `${partialMatching}|${filterObject.sort_by}|${filterObject.sort_order}|${filterObject.page}|${recommendation}|${score}|${jobId}|${filterObject.auto_invited}|${filterObject.auto_shortlisted}|${filterObject.auto_denied}`;
        if (lastQueryRef.current === queryKey) return;
        lastQueryRef.current = queryKey;
        getResumes(
            partialMatching,
            filterObject.sort_by,
            filterObject.sort_order,
            filterObject.page,
            filterObject.recommendation,
            filterObject.score,
            filterObject.job_id ? Number(filterObject.job_id) : null,
            filterObject.auto_invited,
            filterObject.auto_shortlisted,
            filterObject.auto_denied
        );
    }, [filterObject, getResumes]);

    useEffect(() => {
        searchJobs("");
    }, [searchJobs]);




    return <div className="space-y-4">
        {/* feature bar */}
        <ResumeFilters
            filterObject={filterObject}
            onChange={setFilterObject}
            jobOptions={jobSearchResults.map((job) => ({
                label: formatDate(job.created_at)
                    ? `${job.title} • ${formatDate(job.created_at)}`
                    : job.title,
                value: String(job.id),
            }))}
            onSearchJobs={searchJobs}
            loadingJobs={loadingJobSearch}
            onClear={() =>
                setFilterObject({
                    partial_matching: null,
                    sort_by: "updated_at",
                    sort_order: "desc",
                    page: 1,
                    recommendation: null,
                    score: null,
                    job_id: null,
                    auto_invited: null,
                    auto_shortlisted: null,
                    auto_denied: null,
                })
            }
        />
        {/* table */}
        <ResumeTable
            resumes={resumes}
            loading={loadingGetResumes}
            actionLoading={actionLoading}
            onDeny={(resume) => denyResume(resume.id, !resume.auto_denied)}
            onShortlist={(resume) => shortlistResume(resume.id, !resume.auto_shortlisted)}
            onInvite={(resume) => inviteResume(resume.id)}
        />
        {
            meta && meta.total_pages > 1 && <PaginationBar
                currentPage={meta?.page ?? filterObject.page}
                totalPages={meta?.total_pages ?? 1}
                onPageChange={(page) =>
                    setFilterObject((prev) => ({ ...prev, page }))
                }
            />
        }
    </div>;
};


export default ResumeClient;