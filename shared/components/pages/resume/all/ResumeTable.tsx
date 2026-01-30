import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { IResume } from "@/shared/store/pages/resume/useResumeStore";
import { ExternalLink, Eye, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import LoadingEllipsis from "@/shared/components/common/LoadingEllipsis";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip } from "@/components/ui/tooltip";

const formatDate = (value: string) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString();
};

const formatFallbackName = (raw?: string | null) => {
    if (!raw) return "-";
    return raw
        .replace(/\.[^/.]+$/i, "")
        .replace(/resume/gi, "")
        .replace(/[-_]+/g, " ")
        .replace(/\s+/g, " ")
        .trim() || "-";
};

const formatRecommendationLabel = (value?: string | null) => {
    if (!value) return "-";
    return value.replace(/_/g, " ");
};

const getRecommendationClasses = (value?: string | null) => {
    switch (value) {
        case "highly_recommended":
            return "bg-emerald-100 text-emerald-600 ring-emerald-500/40 ring-1 dark:bg-emerald-500/20 dark:text-emerald-300";
        case "recommended":
            return "bg-emerald-100 text-emerald-500 ring-emerald-400/40 ring-1 dark:bg-emerald-500/15 dark:text-emerald-200";
        case "consider":
            return "bg-amber-100 text-amber-600 ring-amber-500/40 ring-1 dark:bg-amber-500/15 dark:text-amber-200";
        case "not_recommended":
            return "bg-red-100 text-red-600 ring-red-500/40 ring-1 dark:bg-red-500/15 dark:text-red-200";
        default:
            return "bg-blue-100 text-blue-700 ring-blue-400/40 ring-1 dark:bg-blue-500/15 dark:text-blue-200";
    }
};

const renderStatusDots = (
    invited?: boolean | null,
    shortlisted?: boolean | null,
    denied?: boolean | null
) => {
    const dotClass = (active?: boolean | null) =>
        active
            ? "bg-emerald-500/90 ring-emerald-500/40"
            : "bg-red-500/90 ring-red-500/40";
    const statusLabel = (label: string, active?: boolean | null) =>
        active ? label : `Not ${label.toLowerCase()}`;
    return (
        <div className="flex items-center gap-4">
            <Tooltip content={statusLabel("Invited", invited)}>
                <span
                    className={`h-2.5 w-2.5 rounded-full ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ${dotClass(
                        invited
                    )}`}
                />
            </Tooltip>
            <Tooltip content={statusLabel("Shortlisted", shortlisted)}>
                <span
                    className={`h-2.5 w-2.5 rounded-full ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ${dotClass(
                        shortlisted
                    )}`}
                />
            </Tooltip>
            <Tooltip content={statusLabel("Denied", denied)}>
                <span
                    className={`h-2.5 w-2.5 rounded-full ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ${dotClass(
                        denied
                    )}`}
                />
            </Tooltip>
        </div>
    );
};

const ResumeTable = ({
    resumes,
    loading,
    onDeny,
    onShortlist,
    onInvite,
    actionLoading,
}: {
    resumes: IResume[];
    loading: boolean;
    onDeny?: (resume: IResume) => void;
    onShortlist?: (resume: IResume) => void;
    onInvite?: (resume: IResume) => void;
    actionLoading?: { id: string | number; type: "deny" | "shortlist" | "invite" } | null;
}) => {
    const showActions = Boolean(onDeny || onShortlist || onInvite);
    const isActionLoading = (resumeId: string | number, type: "deny" | "shortlist" | "invite") =>
        actionLoading?.id != null &&
        String(actionLoading.id) === String(resumeId) &&
        actionLoading.type === type;
    return (
        <div className="w-full max-w-full min-w-0">
            <Table className="min-w-max">
                <TableCaption>
                    {loading
                        ? null
                        : `Resumes (${resumes.length})`}
                </TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[240px]">Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Recommendation</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Creation Date <span className="text-[8px] text-muted-foreground">(UTC+0) MM/DD/YYYY</span></TableHead>
                        <TableHead>File</TableHead>
                        <TableHead>Settings</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {resumes.length === 0 && !loading ? (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center text-muted-foreground">
                                No resumes found.
                            </TableCell>
                        </TableRow>
                    ) : loading ? (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center">
                                <span className="inline-flex items-center justify-center gap-1 text-slate-500">
                                    <span>Loading resumes</span>
                                    <LoadingEllipsis />
                                </span>
                            </TableCell>
                        </TableRow>
                    ) : (
                        resumes.map((resume, index) => (
                            <TableRow
                                key={resume.id}
                                className={
                                    index % 2 === 0
                                        ? "bg-blue-50/70 dark:bg-slate-800/60"
                                        : "bg-transparent"
                                }
                            >
                                <TableCell className="font-medium">
                                    {resume.structured_name ?? formatFallbackName(resume.name ?? resume.link)}
                                </TableCell>
                                <TableCell>{resume.structured_email ?? "-"}</TableCell>
                                <TableCell>
                                    <span
                                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${getRecommendationClasses(
                                            resume.resume_analysis?.recommendation
                                        )}`}
                                    >
                                        {resume.resume_analysis?.score ?? "-"}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span
                                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${getRecommendationClasses(
                                            resume.resume_analysis?.recommendation
                                        )}`}
                                    >
                                        {formatRecommendationLabel(resume.resume_analysis?.recommendation)}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {renderStatusDots(
                                        resume.auto_invited,
                                        resume.auto_shortlisted,
                                        resume.auto_denied
                                    )}
                                </TableCell>
                                <TableCell>{formatDate(resume.created_at)}</TableCell>
                                <TableCell className="truncate max-w-[220px]">
                                    <Tooltip content="Open file in new tab">
                                        <a
                                            href={`${process.env.NEXT_PUBLIC_FILES_RESUME}/${resume.link}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <ExternalLink className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                                        </a>
                                    </Tooltip>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Tooltip content="Open resume in new tab">
                                            <Link
                                                href={`/resumes/${resume.id}`}
                                                className="rounded-full p-1 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/60 dark:hover:text-white"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Tooltip>
                                        {showActions ? (
                                            <DropdownMenu>
                                                <Tooltip content="Resume actions">
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 w-8 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/60 dark:hover:text-white"
                                                            aria-label="Resume actions"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                </Tooltip>
                                                <DropdownMenuContent align="end">
                                                    {onShortlist && (
                                                        <DropdownMenuItem
                                                            disabled={isActionLoading(resume.id, "shortlist")}
                                                            onSelect={() => onShortlist(resume)}
                                                        >
                                                            {resume.auto_shortlisted
                                                                ? "Remove from shortlist"
                                                                : "Shortlist"}
                                                        </DropdownMenuItem>
                                                    )}
                                                    {onInvite && (
                                                        <DropdownMenuItem
                                                            className="text-blue-600 focus:text-blue-700 dark:text-blue-300 dark:focus:text-blue-200"
                                                            disabled={isActionLoading(resume.id, "invite")}
                                                            onSelect={() => onInvite(resume)}
                                                        >
                                                            Send invitation
                                                        </DropdownMenuItem>
                                                    )}
                                                    {onDeny && (
                                                        <DropdownMenuItem
                                                            className="text-red-600 focus:text-red-700 dark:text-red-300 dark:focus:text-red-200"
                                                            disabled={isActionLoading(resume.id, "deny")}
                                                            onSelect={() => onDeny(resume)}
                                                        >
                                                            {resume.auto_denied ? "Remove from denied" : "Deny"}
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        ) : (
                                            <span className="rounded-full p-1 text-slate-400">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default ResumeTable;