import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { FileText, Settings } from "lucide-react";
import type { JobListItem } from "@/shared/store/pages/job/useJobStore";
import LoadingEllipsis from "@/shared/components/common/LoadingEllipsis";

const formatLabel = (value?: string) =>
    value
        ? value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
        : "-";

const JobTable = ({
    jobs,
    loading,
    hasLoaded,
}: {
    jobs: JobListItem[];
    loading: boolean;
    hasLoaded: boolean;
}) => {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[260px]">Title</TableHead>
                    <TableHead>Employment</TableHead>
                    <TableHead>Workplace</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Settings</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading || (!hasLoaded && jobs.length === 0) ? (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center">
                            <span className="inline-flex items-center justify-center gap-1 text-slate-500">
                                <span>Loading jobs</span>
                                <LoadingEllipsis />
                            </span>
                        </TableCell>
                    </TableRow>
                ) : jobs.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center text-slate-500">
                            No jobs yet.
                        </TableCell>
                    </TableRow>
                ) : (
                    jobs.map((job) => (
                        <TableRow key={job.id}>
                            <TableCell className="font-medium">{job.title}</TableCell>
                            <TableCell>{formatLabel(job.employment_type)}</TableCell>
                            <TableCell>{formatLabel(job.workplace_type)}</TableCell>
                            <TableCell>{formatLabel(job.industry)}</TableCell>
                            <TableCell>{job.location}</TableCell>
                            <TableCell>
                                <span
                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${job.is_active
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-slate-100 text-slate-600"
                                        }`}
                                >
                                    {job.is_active ? "Active" : "Inactive"}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="inline-flex items-center justify-end gap-2">
                                    <Link
                                        href={`/job/watch?id=${job.id}`}
                                        className="inline-flex rounded-full p-1 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/60 dark:hover:text-white"
                                        title="Job settings"
                                    >
                                        <Settings className="h-4 w-4" />
                                    </Link>
                                    <Link
                                        href={`/jobs/${job.id}/resumes`}
                                        className="inline-flex rounded-full p-1 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/60 dark:hover:text-white"
                                        title="View job resumes"
                                    >
                                        <FileText className="h-4 w-4" />
                                    </Link>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );
};

export default JobTable;

