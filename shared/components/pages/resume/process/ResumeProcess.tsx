"use client";

import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, Trash2, Upload } from "lucide-react";
import { useResumeStore } from "@/shared/store/pages/resume/useResumeStore";
import { successToast, warningToast } from "@/shared/helper/toast";
import Combobox from "@/shared/components/common/Combobox";
import { useJobStore } from "@/shared/store/pages/job/useJobStore";

const SelectedFilesList = ({
    files,
    filter,
    isExpanded,
    listId,
    maxFileSizeBytes,
    onClear,
    onFilterChange,
    onRemove,
    onToggle,
}: {
    files: File[];
    filter: "all" | "docs" | "pdf";
    isExpanded: boolean;
    listId: string;
    maxFileSizeBytes: number;
    onClear: () => void;
    onFilterChange: (filter: "all" | "docs" | "pdf") => void;
    onRemove: (index: number) => void;
    onToggle: () => void;
}) => {
    const isPdf = (name: string) => name.toLowerCase().endsWith(".pdf");
    const isDoc = (name: string) =>
        name.toLowerCase().endsWith(".doc") || name.toLowerCase().endsWith(".docx");
    const filteredFiles = files.filter((file) => {
        if (filter === "pdf") return isPdf(file.name);
        if (filter === "docs") return isDoc(file.name);
        return true;
    });

    const getFileTone = (file: File) => {
        if (file.size > maxFileSizeBytes) {
            return "border-red-300 bg-red-50 text-red-900 dark:border-red-700/60 dark:bg-red-950/40 dark:text-red-100";
        }
        if (file.size === maxFileSizeBytes) {
            return "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-100";
        }
        return "border-blue-200/80 dark:border-slate-700/60";
    };

    return (
        <div
            className={clsx(
                "w-full rounded-md border border-blue-200 bg-white p-3 shadow-sm",
                "dark:border-slate-700/60 dark:bg-slate-900"
            )}
        >
            <div
                className={clsx(
                    "flex items-center justify-between mb-2 cursor-pointer select-none"
                )}
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                aria-controls={listId}
                onClick={onToggle}
                onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onToggle();
                    }
                }}
            >
                <div className={clsx("text-xs sm:text-sm text-blue-600 dark:text-slate-300")}>
                    Selected files ({files.length}/500)
                </div>
                <div className={clsx("flex items-center gap-2 text-[10px] sm:text-[11px] md:text-xs")}>
                    {(["all", "docs", "pdf"] as const).map((item) => (
                        <button
                            key={item}
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                onFilterChange(item);
                            }}
                            className={clsx(
                                "rounded-md border border-blue-200 px-2 py-1 transition-all duration-300",
                                item === filter
                                    ? "bg-linear-to-r from-[#009ad5] to-[#005ca9] text-white"
                                    : "bg-blue-50 text-blue-600 hover:bg-blue-100/80 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
                            )}
                        >
                            {item.toUpperCase()}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onClear();
                        }}
                        className={clsx(
                            "rounded-md border border-red-200 px-2 py-1 transition-all duration-300",
                            "bg-red-50 text-red-600 hover:bg-red-100/80 dark:bg-red-950/40 dark:text-red-100 dark:hover:bg-red-950/60"
                        )}
                    >
                        Clear all
                    </button>
                </div>
            </div>
            {isExpanded && (
                <ul id={listId} className={clsx("space-y-2")}>
                    {filteredFiles.map((file, index) => (
                        <li
                            key={`${file.name}-${index}`}
                            className={clsx(
                                "flex flex-col gap-2 rounded-md border px-3 py-2 sm:flex-row sm:items-center sm:justify-between",
                                getFileTone(file)
                            )}
                        >
                            <span className={clsx("min-w-0 text-xs sm:text-sm truncate")}>
                                {file.name}
                            </span>
                            <div className={clsx("flex items-center gap-2")}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const url = URL.createObjectURL(file);
                                        window.open(url, "_blank", "noopener,noreferrer");
                                        setTimeout(() => URL.revokeObjectURL(url), 1000);
                                    }}
                                    className={clsx(
                                        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] sm:text-xs text-blue-600 hover:bg-blue-50 transition-all duration-300 dark:text-blue-300 dark:hover:bg-slate-800"
                                    )}
                                    aria-label={`Open ${file.name}`}
                                >
                                    <Eye className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onRemove(index)}
                                    className={clsx(
                                        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] sm:text-xs text-red-500 hover:bg-red-500/10 transition-all duration-300"
                                    )}
                                    aria-label={`Remove ${file.name}`}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const UploadBox = ({
    hasFiles,
    inputRef,
    onSelect,
}: {
    hasFiles: boolean;
    inputRef: React.RefObject<HTMLInputElement | null>;
    onSelect: (files: FileList | null) => void;
}) => {
    return (
        <div
            className={clsx(
                "w-full",
                hasFiles && "lg:w-[260px] lg:sticky lg:top-4 lg:self-start"
            )}
        >
            <label
                className={clsx(
                    "flex h-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-blue-200 p-6 text-xs sm:text-sm text-blue-600",
                    "hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 cursor-pointer",
                    "dark:border-slate-700/60 dark:text-slate-300 dark:hover:bg-slate-800/70",
                    !hasFiles && "min-h-[40vh]"
                )}
            >
                <Upload className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                <span>Upload resumes</span>
                <span className={clsx("text-[11px] sm:text-xs text-blue-500 dark:text-slate-400")}>
                    PDF, DOC, DOCX only
                </span>
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={(event) => onSelect(event.target.files)}
                    onClick={(event) => {
                        // allow selecting the same files repeatedly without manual upload click
                        (event.currentTarget as HTMLInputElement).value = "";
                    }}
                />
            </label>
        </div>
    );
};

const AnalyseButton = ({
    disabled,
    loading,
    onClick,
}: {
    disabled: boolean;
    loading: boolean;
    onClick: () => void;
}) => {
    return (
        <button
            type="button"
            disabled={loading || disabled}
            onClick={onClick}
            className={clsx(
                "w-full rounded-md bg-linear-to-r from-[#009ad5] to-[#005ca9] text-white p-2 transition-all duration-300",
                loading || disabled
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:from-[#009ad5] hover:to-[#005ca9] hover:scale-[0.99]"
            )}
        >
            {loading ? "Sending..." : "Send for Analysis"}
        </button>
    );
};

const ResumeProcess = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [filter, setFilter] = useState<"all" | "docs" | "pdf">("all");
    const [selectedJobId, setSelectedJobId] = useState<string>("");
    const [isFilesExpanded, setIsFilesExpanded] = useState(true);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const searchParams = useSearchParams();
    const {
        processResumes,
        loadingProcessResumes,
        uploadStatus,
        uploadTotal,
        uploadUploaded,
        uploadFailed,
        resetUploadState,
    } = useResumeStore();
    const { jobSearchResults, loadingJobSearch, searchJobs } = useJobStore();
    const maxFileSizeBytes = 20 * 1024 * 1024;
    const maxFilesPerRequest = 500;
    const preselectedJobId = useMemo(() => {
        const param = searchParams.get("jobId")?.trim();
        if (!param) return "";
        return Number.isFinite(Number(param)) ? param : "";
    }, [searchParams]);

    useEffect(() => {
        searchJobs("");
    }, [searchJobs]);

    const activeJobId = preselectedJobId || selectedJobId;
    const shouldWarnBeforeUnload = uploadStatus === "uploading" || loadingProcessResumes;

    useEffect(() => {
        if (!shouldWarnBeforeUnload) return;
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue =
                "Uploads are still running. Leaving now will stop the uploads and lose progress.";
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [shouldWarnBeforeUnload]);

    const handleFiles = (selected: FileList | null) => {
        if (!selected) return;
        const incoming = Array.from(selected);
        setFiles((prev) => {
            const seen = new Set(prev.map((file) => `${file.name}-${file.size}-${file.lastModified}`));
            const deduped = incoming.filter(
                (file) => !seen.has(`${file.name}-${file.size}-${file.lastModified}`)
            );
            return [...prev, ...deduped];
        });
        if (inputRef.current) inputRef.current.value = "";
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };
    const clearFiles = () => {
        setFiles([]);
        setFilter("all");
        if (inputRef.current) inputRef.current.value = "";
    };

    const hasFiles = files.length > 0;
    const hasOversizeFiles = files.some((file) => file.size > maxFileSizeBytes);
    const exceedsFileCount = files.length > maxFilesPerRequest;
    const handleProcess = async () => {
        if (!files.length || loadingProcessResumes) return;
        if (exceedsFileCount) {
            warningToast("You can send up to 500 files per request.");
            return;
        }
        if (hasOversizeFiles) {
            warningToast("Some files exceed 20 MB. Remove them to continue.");
            return;
        }
        if (!activeJobId) {
            warningToast("Please select a job before sending resumes.");
            return;
        }
        const status = await processResumes(files, Number(activeJobId), {
            onComplete: () => {
                successToast(
                    "Uploads completed. Resumes are being analyzed in the background."
                );
                setFiles([]);
                setFilter("all");
                if (!preselectedJobId) {
                    setSelectedJobId("");
                }
                resetUploadState();
            },
            onFailed: (message) => {
                if (message) {
                    warningToast(message);
                }
            },
        });
        if (status === 202) {
            successToast("Upload started. You can continue working.");
        }
    };

    return (
        <div className={clsx("space-y-4")}>
            <div className="rounded-md border border-blue-200 bg-white p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                        Job to analyze resumes for
                    </label>
                    <div className="w-full md:max-w-[360px]">
                        <Combobox
                            value={activeJobId}
                            onChange={(value) => {
                                if (!preselectedJobId) {
                                    setSelectedJobId(value);
                                }
                            }}
                            options={jobSearchResults.map((job) => ({
                                label: job.title,
                                value: String(job.id),
                            }))}
                            placeholder="Select a job..."
                            searchPlaceholder="Search jobs..."
                            emptyLabel="No active jobs found."
                            disabled={loadingJobSearch || Boolean(preselectedJobId)}
                            onSearch={(term) => searchJobs(term)}
                        />
                    </div>
                </div>
                {preselectedJobId && (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        Job is pre-selected from the jobs page.
                    </p>
                )}
            </div>
            <div className={clsx("flex flex-col items-start gap-4 lg:flex-row")}>
                <UploadBox hasFiles={hasFiles} inputRef={inputRef} onSelect={handleFiles} />
                {hasFiles && (
                    <div className="w-full">
                        <SelectedFilesList
                            files={files}
                            filter={filter}
                            isExpanded={isFilesExpanded}
                            listId="selected-files-list"
                            maxFileSizeBytes={maxFileSizeBytes}
                            onClear={clearFiles}
                            onFilterChange={setFilter}
                            onRemove={removeFile}
                            onToggle={() => setIsFilesExpanded((prev) => !prev)}
                        />
                    </div>
                )}
            </div>

            {hasFiles && (
                <AnalyseButton
                    disabled={hasOversizeFiles || exceedsFileCount}
                    loading={loadingProcessResumes}
                    onClick={handleProcess}
                />
            )}
            {exceedsFileCount && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-900 dark:border-red-700/60 dark:bg-red-950/40 dark:text-red-100">
                    Maximum 500 files per request. Remove files to continue.
                </div>
            )}
            {hasOversizeFiles && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-900 dark:border-red-700/60 dark:bg-red-950/40 dark:text-red-100">
                    One or more files exceed 20 MB. Remove them to continue.
                </div>
            )}
            {shouldWarnBeforeUnload && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                    Uploads are running. Please do not refresh or close the page, or you
                    will lose progress.
                </div>
            )}
            {uploadStatus === "uploading" && (
                <div className="rounded-md border border-blue-200 bg-white p-3 text-xs text-blue-700 dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-200">
                    Uploading {uploadUploaded}/{uploadTotal} files
                    {uploadFailed > 0 ? ` (${uploadFailed} failed)` : ""}.
                </div>
            )}
        </div>
    );
};

export default ResumeProcess;