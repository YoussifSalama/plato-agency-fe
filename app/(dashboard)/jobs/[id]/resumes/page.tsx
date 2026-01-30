"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import ResumeTable from "@/shared/components/pages/resume/all/ResumeTable";
import { useJobStore } from "@/shared/store/pages/job/useJobStore";
import SearchBar from "@/shared/common/features/SearchBar";
import SortingMenu from "@/shared/common/features/SortingMenu";
import RecommendationFilter from "@/shared/components/pages/resume/all/RecommendationFilter";
import PaginationBar from "@/shared/common/features/PaginationBar";
import clsx from "clsx";
import { ToggleButton } from "@/components/ui/toggle-button";

interface IFilterObject {
    partial_matching: string | null;
    sort_by: string;
    sort_order: "asc" | "desc";
    page: number;
    recommendation: string | null;
    score: string | null;
    auto_invited: boolean | null;
    auto_shortlisted: boolean | null;
    auto_denied: boolean | null;
}


const JobResumeFilters = ({
    filterObject,
    onChange,
    onClear,
}: {
    filterObject: IFilterObject;
    onChange: (next: IFilterObject) => void;
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
                            label="invited"
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
                            label="shortlisted"
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
                            label="denied"
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

const JobResumesPage = () => {
    const params = useParams<{ id: string }>();
    const jobId = params?.id ? Number(params.id) : NaN;
    const {
        jobResumes,
        jobResumesMeta,
        loadingJobResumes,
        loadingJob,
        job,
        getJobResumes,
        getJobById,
        resumeActionLoading,
        denyJobResume,
        shortlistJobResume,
        inviteJobResume,
    } = useJobStore();
    const [filterObject, setFilterObject] = useState<IFilterObject>({
        partial_matching: null,
        sort_by: "updated_at",
        sort_order: "desc",
        page: 1,
        recommendation: null,
        score: null,
        auto_invited: null,
        auto_shortlisted: null,
        auto_denied: null,
    });
    const lastQueryRef = useRef<string | null>(null);

    useEffect(() => {
        if (!Number.isFinite(jobId)) return;
        getJobById(jobId);
    }, [getJobById, jobId]);

    useEffect(() => {
        if (!Number.isFinite(jobId)) return;
        const partialMatching = filterObject.partial_matching ?? "";
        const recommendation = filterObject.recommendation ?? "";
        const score = filterObject.score ?? "";
        const queryKey = `${jobId}|${partialMatching}|${filterObject.sort_by}|${filterObject.sort_order}|${filterObject.page}|${recommendation}|${score}|${filterObject.auto_invited}|${filterObject.auto_shortlisted}|${filterObject.auto_denied}`;
        if (lastQueryRef.current === queryKey) return;
        lastQueryRef.current = queryKey;
        getJobResumes(
            jobId,
            partialMatching,
            filterObject.sort_by,
            filterObject.sort_order,
            filterObject.page,
            filterObject.recommendation,
            filterObject.score,
            filterObject.auto_invited,
            filterObject.auto_shortlisted,
            filterObject.auto_denied,
        );
    }, [filterObject, getJobResumes, jobId]);

    if (!Number.isFinite(jobId)) {
        return (
            <div className="rounded-md border border-red-200 bg-red-50 p-6 text-sm text-red-600">
                Invalid job id.
            </div>
        );
    }

    const showSkeleton =
        (!job && !jobResumes.length && !jobResumesMeta && (loadingJob || loadingJobResumes));

    return (
        <section className="space-y-6">

            <div className="flex items-center">
                <Link
                    href="/jobs"
                    className="inline-flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100/80 dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                    <ArrowLeft className="h-4 w-4" />
                    All Jobs
                </Link>
            </div>
            <div className="rounded-md border border-blue-200 bg-white p-6 shadow-xl shadow-blue-200/60 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
                {showSkeleton ? (
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-2">
                            <div className="h-5 w-56 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
                            <div className="h-4 w-40 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
                        </div>
                        <div className="h-6 w-36 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
                    </div>
                ) : (
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-blue-700 dark:text-slate-100">
                                {loadingJob ? "Job details" : job?.title ?? "Job details"}
                            </h2>
                            <p className="text-sm text-blue-600 dark:text-slate-300">
                                {job?.location ? `${job.location} • ` : ""}
                                {job?.employment_type ? job.employment_type.replace(/_/g, " ") : ""}
                            </p>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-slate-800/70 dark:text-slate-200">
                            <FileText className="h-3 w-3" />
                            {jobResumes.length} resumes / {jobResumesMeta?.total ?? jobResumes.length} total
                        </div>
                    </div>
                )}
            </div>


            <div className="rounded-md border border-blue-200 bg-white p-6 shadow-xl shadow-blue-200/60 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
                {showSkeleton ? (
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="h-9 w-full animate-pulse rounded-md bg-slate-200 dark:bg-slate-700 sm:w-[220px]" />
                            <div className="h-9 w-full animate-pulse rounded-md bg-slate-200 dark:bg-slate-700 sm:w-[220px]" />
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="h-9 w-full animate-pulse rounded-md bg-slate-200 dark:bg-slate-700 sm:flex-1" />
                            <div className="h-9 w-full animate-pulse rounded-md bg-slate-200 dark:bg-slate-700 sm:flex-1" />
                            <div className="h-9 w-full animate-pulse rounded-md bg-slate-200 dark:bg-slate-700 sm:w-[160px]" />
                        </div>
                        <div className="mt-6 space-y-3">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <div
                                    key={`job-resumes-skeleton-${index}`}
                                    className="h-12 w-full animate-pulse rounded-md bg-slate-200 dark:bg-slate-700"
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        <JobResumeFilters
                            filterObject={filterObject}
                            onChange={setFilterObject}
                            onClear={() =>
                                setFilterObject({
                                    partial_matching: null,
                                    sort_by: "updated_at",
                                    sort_order: "desc",
                                    page: 1,
                                    recommendation: null,
                                    score: null,
                                    auto_invited: null,
                                    auto_shortlisted: null,
                                    auto_denied: null,
                                })
                            }
                        />
                        <div className="mt-4">
                            <ResumeTable
                                resumes={jobResumes}
                                loading={loadingJobResumes}
                                actionLoading={resumeActionLoading}
                                onDeny={(resume) => denyJobResume(resume.id, !resume.auto_denied)}
                                onShortlist={(resume) => shortlistJobResume(resume.id, !resume.auto_shortlisted)}
                                onInvite={(resume) => inviteJobResume(resume.id)}
                            />
                        </div>
                        {jobResumesMeta && jobResumesMeta.total_pages > 1 && (
                            <div className="mt-4">
                                <PaginationBar
                                    currentPage={jobResumesMeta?.page ?? filterObject.page}
                                    totalPages={jobResumesMeta?.total_pages ?? 1}
                                    onPageChange={(page) =>
                                        setFilterObject((prev) => ({ ...prev, page }))
                                    }
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
};

export default JobResumesPage;