"use client";

import { useEffect } from "react";
import { ExternalLink, FileText, Link2, Mail, Phone, Star, ThumbsUp, TrendingUp, User } from "lucide-react";
import { useResumeDetailsStore } from "@/shared/store/pages/resume/useResumeDetailsStore";
import { Button } from "@/components/ui/button";

const getRecommendationLabel = (value?: string | null) => {
    if (!value) return "Not rated";
    return value.replace(/_/g, " ");
};

const getRecommendationColors = (value?: string | null) => {
    switch (value) {
        case "highly_recommended":
            return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200";
        case "recommended":
            return "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200";
        case "consider":
            return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200";
        case "not_recommended":
            return "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200";
        default:
            return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200";
    }
};

const getSeniorityColors = () =>
    "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-200";

const toExternalUrl = (value: string) => {
    if (!value) return value;
    const normalized = value.trim();
    if (!normalized) return normalized;
    if (/^https?:\/\//i.test(normalized)) {
        return normalized;
    }
    return `https://${normalized}`;
};

type ScoreBreakdown = {
    role_fit_and_core_skills?: number;
    experience_impact?: number;
    performance_productivity?: number;
    retention_engagement_indicators?: number;
    leadership_collaboration?: number;
    education_certifications?: number;
    projects_initiative?: number;
};

type AiInsights = {
    matched_job_titles?: string[];
    ai_thought?: string | null;
    suggested_next_roles?: string[];
};

const renderSkeleton = () => (
    <div className="space-y-6">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-3">
                    <div className="h-6 w-48 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="h-4 w-40 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
                        <div className="h-4 w-32 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="h-4 w-24 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
                        <div className="h-4 w-24 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
                        <div className="h-4 w-24 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
                    </div>
                </div>
                <div className="h-4 w-36 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
            </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="h-9 w-28 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
            <div className="h-9 w-36 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
            <div className="h-9 w-44 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
        </div>

        <div className="flex flex-wrap gap-3">
            <div className="h-12 min-w-[160px] flex-1 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
            <div className="h-12 min-w-[180px] flex-1 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
            <div className="h-12 min-w-[200px] flex-1 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
        </div>

        <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
                <div
                    key={`resume-skeleton-${index}`}
                    className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
                >
                    <div className="h-4 w-24 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
                    <div className="mt-3 space-y-2">
                        <div className="h-3 w-full animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
                        <div className="h-3 w-5/6 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
                        <div className="h-3 w-2/3 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const ResumeDetailsClient = ({ resumeId }: { resumeId: number | string }) => {
    const {
        resume,
        loading,
        error,
        actionLoading,
        getResume,
        denyResume,
        shortlistResume,
        inviteResume,
    } = useResumeDetailsStore();

    useEffect(() => {
        getResume(resumeId);
    }, [getResume, resumeId]);

    if (loading) {
        return renderSkeleton();
    }

    if (!resume) {
        if (!error) {
            return renderSkeleton();
        }
        return (
            <div className="rounded-md border border-slate-200 p-6 text-sm text-muted-foreground dark:border-slate-700">
                {error ?? "Resume not found."}
            </div>
        );
    }

    const structured = resume.resume_structured?.data ?? null;
    const contact = structured?.contact ?? {};
    const locationText = [structured?.location?.city, structured?.location?.country]
        .filter(Boolean)
        .join(", ");
    const scoreBreakdown =
        (resume.resume_analysis?.insights?.score_breakdown as ScoreBreakdown | undefined) ??
        (resume.resume_analysis as { score_breakdown?: ScoreBreakdown } | null)?.score_breakdown ??
        null;
    const aiInsights =
        (resume.resume_analysis?.insights?.ai_insights as AiInsights | undefined) ??
        (resume.resume_analysis as { ai_insights?: AiInsights } | null)?.ai_insights ??
        null;
    const links = [
        { label: "LinkedIn", value: contact.linkedin },
        { label: "GitHub", value: contact.github },
        { label: "Portfolio", value: contact.portfolio },
    ]
        .map((item) => ({
            ...item,
            value: item.value ? toExternalUrl(String(item.value)) : null,
        }))
        .filter((item) => item.value);
    const scoreBreakdownItems = scoreBreakdown
        ? [
            { label: "Role fit & core skills", value: scoreBreakdown.role_fit_and_core_skills },
            { label: "Experience impact", value: scoreBreakdown.experience_impact },
            { label: "Performance productivity", value: scoreBreakdown.performance_productivity },
            { label: "Retention & engagement", value: scoreBreakdown.retention_engagement_indicators },
            { label: "Leadership & collaboration", value: scoreBreakdown.leadership_collaboration },
            { label: "Education & certifications", value: scoreBreakdown.education_certifications },
            { label: "Projects & initiative", value: scoreBreakdown.projects_initiative },
        ]
        : [];
    const hasScoreBreakdown = scoreBreakdownItems.some((item) => item.value != null);
    const hasAiInsights =
        Boolean(aiInsights?.ai_thought) ||
        Boolean(aiInsights?.matched_job_titles?.length) ||
        Boolean(aiInsights?.suggested_next_roles?.length);
    const hasSummary =
        Boolean(structured?.current_title) ||
        structured?.total_experience_years != null ||
        Boolean(locationText);
    const hasExperience = Boolean(structured?.experience?.length);
    const hasEducation = Boolean(structured?.education?.length);
    const hasSkills = Boolean(structured?.skills?.length);
    const hasTools = Boolean(structured?.tools?.length);
    const hasCertifications = Boolean(structured?.certifications?.length);
    const hasLanguages = Boolean(structured?.languages?.length);
    const hasProjects = Boolean(structured?.projects?.length);

    return (
        <div className="space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-lg font-semibold">
                            <User className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                            <span>{structured?.name ?? resume.name}</span>
                        </div>
                        {(contact.email || contact.phone) && (
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                                {contact.email && (
                                    <a className="inline-flex items-center gap-2 hover:text-blue-600" href={`mailto:${contact.email}`}>
                                        <Mail className="h-4 w-4" />
                                        {contact.email}
                                    </a>
                                )}
                                {contact.phone && (
                                    <a className="inline-flex items-center gap-2 hover:text-blue-600" href={`tel:${contact.phone}`}>
                                        <Phone className="h-4 w-4" />
                                        {contact.phone}
                                    </a>
                                )}
                            </div>
                        )}
                        {links.length > 0 && (
                            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                {links.map((link) => (
                                    <a
                                        key={link.label}
                                        href={String(link.value)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 hover:text-blue-600"
                                    >
                                        <Link2 className="h-4 w-4" />
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="space-y-2 text-right">
                        <a
                            href={`${process.env.NEXT_PUBLIC_FILES_RESUME}/${resume.link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-300"
                        >
                            <FileText className="h-4 w-4" />
                            View original resume
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
                <Button
                    variant={resume.auto_denied ? "destructive" : "outline"}
                    size="sm"
                    disabled={actionLoading === "deny"}
                    onClick={() => denyResume(resume.id, !resume.auto_denied)}
                >
                    {resume.auto_denied ? "Remove from denied" : "Deny"}
                </Button>
                <Button
                    variant={resume.auto_shortlisted ? "secondary" : "outline"}
                    size="sm"
                    disabled={actionLoading === "shortlist"}
                    onClick={() => shortlistResume(resume.id, !resume.auto_shortlisted)}
                >
                    {resume.auto_shortlisted ? "Remove from shortlist" : "Shortlist"}
                </Button>
                <Button
                    variant="default"
                    size="sm"
                    disabled={actionLoading === "invite"}
                    onClick={() => inviteResume(resume.id)}
                    className="border border-blue-400/60 bg-linear-to-r from-[#009ad5] to-[#005ca9] text-white shadow-md shadow-blue-200/60 hover:from-[#0089bf] hover:to-[#00509a] dark:shadow-none"
                >
                    Send Invitation
                </Button>
            </div>

            {(resume.resume_analysis?.score != null ||
                resume.resume_analysis?.seniority_level ||
                resume.resume_analysis?.recommendation) && (
                    <div className="flex flex-wrap gap-3">
                        {resume.resume_analysis?.score != null && (
                            <div className={`flex min-w-[160px] flex-1 items-center justify-between gap-3 rounded-lg border px-4 py-2 ${getRecommendationColors(resume.resume_analysis?.recommendation)}`}>
                                <div>
                                    <div className="text-[10px] uppercase tracking-wide opacity-80">Score</div>
                                    <div className="text-lg font-semibold">{resume.resume_analysis?.score}</div>
                                </div>
                                <Star className="h-4 w-4" />
                            </div>
                        )}
                        {resume.resume_analysis?.seniority_level && (
                            <div className={`flex min-w-[180px] flex-1 items-center justify-between gap-3 rounded-lg border px-4 py-2 ${getSeniorityColors()}`}>
                                <div>
                                    <div className="text-[10px] uppercase tracking-wide opacity-80">Seniority level</div>
                                    <div className="text-lg font-semibold">{resume.resume_analysis?.seniority_level}</div>
                                </div>
                                <TrendingUp className="h-4 w-4" />
                            </div>
                        )}
                        {resume.resume_analysis?.recommendation && (
                            <div className={`flex min-w-[200px] flex-1 items-center justify-between gap-3 rounded-lg border px-4 py-2 ${getRecommendationColors(resume.resume_analysis?.recommendation)}`}>
                                <div>
                                    <div className="text-[10px] uppercase tracking-wide opacity-80">Recommendation</div>
                                    <div className="text-lg font-semibold">{getRecommendationLabel(resume.resume_analysis?.recommendation)}</div>
                                </div>
                                <ThumbsUp className="h-4 w-4" />
                            </div>
                        )}
                    </div>
                )}

            <div className="space-y-3">
                <details className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                    <summary className="cursor-pointer text-sm font-semibold">Analysis</summary>
                    <div className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                        {resume.resume_analysis?.score != null && (
                            <div>Score: {resume.resume_analysis?.score}</div>
                        )}
                        {resume.resume_analysis?.seniority_level && (
                            <div>Seniority: {resume.resume_analysis?.seniority_level}</div>
                        )}
                        {resume.resume_analysis?.recommendation && (
                            <div>Recommendation: {getRecommendationLabel(resume.resume_analysis?.recommendation)}</div>
                        )}
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                                <div className="mb-2 text-xs font-semibold uppercase">Strengths</div>
                                {resume.resume_analysis?.insights?.strengths?.length ? (
                                    <ul className="list-disc space-y-1 pl-5 text-xs">
                                        {resume.resume_analysis.insights.strengths.map((item, index) => (
                                            <li key={`${item}-${index}`}>{item}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-xs">No strengths listed.</div>
                                )}
                            </div>
                            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                                <div className="mb-2 text-xs font-semibold uppercase">Weaknesses</div>
                                {resume.resume_analysis?.insights?.weaknesses?.length ? (
                                    <ul className="list-disc space-y-1 pl-5 text-xs">
                                        {resume.resume_analysis.insights.weaknesses.map((item, index) => (
                                            <li key={`${item}-${index}`}>{item}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-xs">No weaknesses listed.</div>
                                )}
                            </div>
                        </div>
                        {hasScoreBreakdown && (
                            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                <div className="mb-2 text-xs font-semibold uppercase">Score breakdown</div>
                                <div className="grid gap-2 sm:grid-cols-2">
                                    {scoreBreakdownItems
                                        .filter((item) => item.value != null)
                                        .map((item) => (
                                            <div key={item.label} className="flex items-center justify-between gap-4">
                                                <span className="text-xs text-slate-600 dark:text-slate-300">{item.label}</span>
                                                <span className="text-xs font-semibold">{item.value}</span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                        {hasAiInsights && (
                            <div className="rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                                <div className="mb-2 text-xs font-semibold uppercase">AI insights</div>
                                <div className="space-y-2 text-xs">
                                    {aiInsights?.matched_job_titles?.length ? (
                                        <div>
                                            <span className="font-semibold">Matched job titles:</span>{" "}
                                            {aiInsights.matched_job_titles.join(", ")}
                                        </div>
                                    ) : null}
                                    {aiInsights?.ai_thought ? (
                                        <div>
                                            <span className="font-semibold">AI thought:</span>{" "}
                                            {aiInsights.ai_thought}
                                        </div>
                                    ) : null}
                                    {aiInsights?.suggested_next_roles?.length ? (
                                        <div>
                                            <span className="font-semibold">Suggested next roles:</span>{" "}
                                            {aiInsights.suggested_next_roles.join(", ")}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        )}
                    </div>
                </details>
                {hasSummary && (
                    <details className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                        <summary className="cursor-pointer text-sm font-semibold">Summary</summary>
                        <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                            {structured?.current_title && (
                                <div>Current title: {structured.current_title}</div>
                            )}
                            {structured?.total_experience_years != null && (
                                <div>Experience years: {structured.total_experience_years}</div>
                            )}
                            {locationText && (
                                <div>Location: {locationText}</div>
                            )}
                        </div>
                    </details>
                )}

                {hasExperience && (
                    <details className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                        <summary className="cursor-pointer text-sm font-semibold">Experience</summary>
                        <div className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                            {structured?.experience?.map((item, index) => (
                                <div key={`${item.title}-${index}`} className="rounded-md border border-slate-200 p-3 dark:border-slate-700">
                                    {(item.title || item.company) && (
                                        <div className="font-medium text-slate-900 dark:text-white">
                                            {item.title ?? ""} {item.company ? `• ${item.company}` : ""}
                                        </div>
                                    )}
                                    {(item.start_year || item.end_year) && (
                                        <div className="text-xs text-slate-500">
                                            {item.start_year ?? ""}{item.start_year && item.end_year ? " – " : ""}{item.end_year ?? ""}
                                        </div>
                                    )}
                                    {item.highlights?.length ? (
                                        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-600 dark:text-slate-300">
                                            {item.highlights.map((highlight, highlightIndex) => (
                                                <li key={`${highlight}-${highlightIndex}`}>{highlight}</li>
                                            ))}
                                        </ul>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </details>
                )}

                {hasEducation && (
                    <details className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                        <summary className="cursor-pointer text-sm font-semibold">Education</summary>
                        <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                            {structured?.education?.map((item, index) => (
                                <div key={`${item.degree}-${index}`} className="rounded-md border border-slate-200 p-3 dark:border-slate-700">
                                    {item.degree && (
                                        <div className="font-medium text-slate-900 dark:text-white">{item.degree}</div>
                                    )}
                                    {(item.institution || item.year) && (
                                        <div className="text-xs text-slate-500">
                                            {item.institution ?? ""}{item.institution && item.year ? " • " : ""}{item.year ?? ""}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </details>
                )}

                {(hasSkills || hasTools) && (
                    <details className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                        <summary className="cursor-pointer text-sm font-semibold">Skills & Tools</summary>
                        <div className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                            {hasSkills && (
                                <div>
                                    <div className="text-xs uppercase text-slate-500">Skills</div>
                                    <div>{structured?.skills?.join(", ")}</div>
                                </div>
                            )}
                            {hasTools && (
                                <div>
                                    <div className="text-xs uppercase text-slate-500">Tools</div>
                                    <div>{structured?.tools?.join(", ")}</div>
                                </div>
                            )}
                        </div>
                    </details>
                )}

                {(hasCertifications || hasLanguages) && (
                    <details className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                        <summary className="cursor-pointer text-sm font-semibold">Certifications & Languages</summary>
                        <div className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                            {hasCertifications && (
                                <div>
                                    <div className="text-xs uppercase text-slate-500">Certifications</div>
                                    <ul className="list-disc space-y-1 pl-5 text-xs">
                                        {structured?.certifications?.map((item, index) => (
                                            <li key={`${item.name}-${index}`}>
                                                {item.name ?? ""}{item.issuer ? ` • ${item.issuer}` : ""}{item.year ? ` • ${item.year}` : ""}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {hasLanguages && (
                                <div>
                                    <div className="text-xs uppercase text-slate-500">Languages</div>
                                    <div>{structured?.languages?.join(", ")}</div>
                                </div>
                            )}
                        </div>
                    </details>
                )}

                {hasProjects && (
                    <details className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                        <summary className="cursor-pointer text-sm font-semibold">Projects</summary>
                        <div className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                            {structured?.projects?.map((item, index) => (
                                <div key={`${item.name}-${index}`} className="rounded-md border border-slate-200 p-3 dark:border-slate-700">
                                    {item.name && (
                                        <div className="font-medium text-slate-900 dark:text-white">{item.name}</div>
                                    )}
                                    {item.description && (
                                        <div className="text-xs text-slate-500">{item.description}</div>
                                    )}
                                    {item.tech?.length ? (
                                        <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                                            Tech: {item.tech.join(", ")}
                                        </div>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </details>
                )}
            </div>
        </div>
    );
};

export default ResumeDetailsClient;