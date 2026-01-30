"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { Eye, Trash2, Upload } from "lucide-react";
import { useResumeStore } from "@/shared/store/pages/resume/useResumeStore";
import { toast } from "react-toastify";
import Combobox from "@/shared/components/common/Combobox";
import { useJobStore } from "@/shared/store/pages/job/useJobStore";

const SelectedFilesList = ({
    files,
    filter,
    onFilterChange,
    onRemove,
}: {
    files: File[];
    filter: "all" | "docs" | "pdf";
    onFilterChange: (filter: "all" | "docs" | "pdf") => void;
    onRemove: (index: number) => void;
}) => {
    const isPdf = (name: string) => name.toLowerCase().endsWith(".pdf");
    const isDoc = (name: string) =>
        name.toLowerCase().endsWith(".doc") || name.toLowerCase().endsWith(".docx");
    const filteredFiles = files.filter((file) => {
        if (filter === "pdf") return isPdf(file.name);
        if (filter === "docs") return isDoc(file.name);
        return true;
    });

    return (
        <div
            className={clsx(
                "flex-1 rounded-md border border-blue-200 bg-white p-3 shadow-sm",
                "dark:border-slate-700/60 dark:bg-slate-900"
            )}
        >
            <div className={clsx("flex items-center justify-between mb-2")}>
                <div className={clsx("text-sm text-blue-600 dark:text-slate-300")}>
                    Selected files ({files.length}/500)
                </div>
                <div className={clsx("flex items-center gap-2 text-xs")}>
                    {(["all", "docs", "pdf"] as const).map((item) => (
                        <button
                            key={item}
                            type="button"
                            onClick={() => onFilterChange(item)}
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
                </div>
            </div>
            <ul className={clsx("space-y-2")}>
                {filteredFiles.map((file, index) => (
                    <li
                        key={`${file.name}-${index}`}
                        className={clsx(
                            "flex items-center justify-between rounded-md border border-blue-200/80 px-3 py-2 dark:border-slate-700/60"
                        )}
                    >
                        <span className={clsx("text-sm truncate")}>{file.name}</span>
                        <div className={clsx("flex items-center gap-2")}>
                            <button
                                type="button"
                                onClick={() => {
                                    const url = URL.createObjectURL(file);
                                    window.open(url, "_blank", "noopener,noreferrer");
                                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                                }}
                                className={clsx(
                                    "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 transition-all duration-300 dark:text-blue-300 dark:hover:bg-slate-800"
                                )}
                                aria-label={`Open ${file.name}`}
                            >
                                <Eye className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => onRemove(index)}
                                className={clsx(
                                    "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-red-500 hover:bg-red-500/10 transition-all duration-300"
                                )}
                                aria-label={`Remove ${file.name}`}
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
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
        <div className={clsx(hasFiles ? "w-[260px] sticky top-4 self-start" : "w-full")}>
            <label
                className={clsx(
                    "flex h-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-blue-200 p-6 text-sm text-blue-600",
                    "hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 cursor-pointer",
                    "dark:border-slate-700/60 dark:text-slate-300 dark:hover:bg-slate-800/70",
                    !hasFiles && "min-h-[40vh]"
                )}
            >
                <Upload className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                <span>Upload resumes</span>
                <span className={clsx("text-xs text-blue-500 dark:text-slate-400")}>
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
    loading,
    onClick,
}: {
    loading: boolean;
    onClick: () => void;
}) => {
    return (
        <button
            type="button"
            disabled={loading}
            onClick={onClick}
            className={clsx(
                "w-full rounded-md bg-linear-to-r from-[#009ad5] to-[#005ca9] text-white p-2 transition-all duration-300",
                loading
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
    const inputRef = useRef<HTMLInputElement | null>(null);
    const { processResumes, loadingProcessResumes } = useResumeStore();
    const { jobSearchResults, loadingJobSearch, searchJobs } = useJobStore();

    useEffect(() => {
        searchJobs("");
    }, [searchJobs]);

    const handleFiles = (selected: FileList | null) => {
        if (!selected) return;
        const incoming = Array.from(selected).slice(0, 500);
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

    const hasFiles = files.length > 0;
    const handleProcess = async () => {
        if (!files.length || loadingProcessResumes) return;
        if (!selectedJobId) {
            toast.warning("Please select a job before sending resumes.");
            return;
        }
        const status = await processResumes(files, Number(selectedJobId));
        if (status === 201) {
            toast.success(
                "Your resumes are being analyzed in the background. We'll notify you when it's done."
            );
            setFiles([]);
            setFilter("all");
            setSelectedJobId("");
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
                            value={selectedJobId}
                            onChange={setSelectedJobId}
                            options={jobSearchResults.map((job) => ({
                                label: job.title,
                                value: String(job.id),
                            }))}
                            placeholder="Select a job..."
                            searchPlaceholder="Search jobs..."
                            emptyLabel="No active jobs found."
                            disabled={loadingJobSearch}
                            onSearch={(term) => searchJobs(term)}
                        />
                    </div>
                </div>
            </div>
            <div className={clsx("flex items-start gap-4")}>
                {hasFiles && (
                    <SelectedFilesList
                        files={files}
                        filter={filter}
                        onFilterChange={setFilter}
                        onRemove={removeFile}
                    />
                )}
                <UploadBox hasFiles={hasFiles} inputRef={inputRef} onSelect={handleFiles} />
            </div>

            {hasFiles && (
                <AnalyseButton
                    loading={loadingProcessResumes}
                    onClick={handleProcess}
                />
            )}
        </div>
    );
};

export default ResumeProcess;