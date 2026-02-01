"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Controller,
    useForm,
    useWatch,
    type Resolver,
    type SubmitHandler,
    type SubmitErrorHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Award,
    BarChart3,
    Briefcase,
    Building2,
    CheckCircle2,
    ClipboardList,
    Code2,
    DollarSign,
    FileText,
    Languages,
    Mail,
    MapPin,
    Sparkles,
    Users,
    XCircle,
    ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import RetraceTextEditor from "@/shared/components/common/RetraceTextEditor";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    employmentTypeOptions,
    jobIndustryOptions,
    jobLanguageOptions,
    jobSalaryCurrencyOptions,
    jobSoftSkillsOptions,
    jobTechnicalSkillsOptions,
    seniorityLevelOptions,
    workplaceTypeOptions,
} from "@/shared/core/job/options";
import JobAiPromptModal, {
    AiPromptFormValues,
} from "@/shared/components/pages/job/JobAiPromptModal";
import SkillTagInput from "@/shared/components/pages/job/SkillTagInput";
import { splitList } from "@/shared/components/pages/job/jobFormUtils";
import { useJobStore } from "@/shared/store/pages/job/useJobStore";
import { warningToast } from "@/shared/helper/toast";

const numberOrUndefined = (value: unknown) => {
    if (value === "" || value == null) return undefined;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
};

const jobSchema = z
    .object({
        title: z.string().min(1, "Job title is required."),
        employment_type: z.string().min(1, "Employment type is required."),
        workplace_type: z.string().min(1, "Workplace type is required."),
        seniority_level: z.string().min(1, "Seniority level is required."),
        industry: z.string().min(1, "Industry is required."),
        location: z.string().min(1, "Location is required."),
        salary_currency: z.string().min(1, "Salary currency is required."),
        salary_from: z.preprocess(numberOrUndefined, z.number().min(0)),
        salary_to: z.preprocess(numberOrUndefined, z.number().min(0)),
        is_salary_negotiable: z.boolean().optional(),
        description: z.string().min(1, "Job description is required."),
        requirements: z.string().min(1, "Job requirements are required."),
        certifications: z.union([z.literal(""), z.string()]).optional(),
        company_overview: z.union([z.literal(""), z.string()]).optional(),
        role_overview: z.union([z.literal(""), z.string()]).optional(),
        responsibilities: z.union([z.literal(""), z.string()]).optional(),
        nice_to_have: z.union([z.literal(""), z.string()]).optional(),
        what_we_offer: z.union([z.literal(""), z.string()]).optional(),
        job_benefits: z.union([z.literal(""), z.string()]).optional(),
        auto_score_matching_threshold: z.preprocess(
            numberOrUndefined,
            z.number().min(0).optional()
        ),
        auto_email_invite_threshold: z.preprocess(
            numberOrUndefined,
            z.number().min(0).optional()
        ),
        auto_shortlisted_threshold: z.preprocess(
            numberOrUndefined,
            z.number().min(0).optional()
        ),
        auto_denied_threshold: z.preprocess(
            numberOrUndefined,
            z.number().min(0).optional()
        ),
        soft_skills: z.union([z.literal(""), z.string()]).optional(),
        technical_skills: z.union([z.literal(""), z.string()]).optional(),
        languages: z.union([z.literal(""), z.string()]).optional(),
    })
    .refine((data) => data.salary_from <= data.salary_to, {
        message: "Salary minimum must be less than or equal to salary maximum.",
        path: ["salary_from"],
    });

type JobFormValues = z.input<typeof jobSchema>;

const AddJobForm = () => {
    const DRAFT_KEY = "plato_job_draft_v1";
    const [promptOpen, setPromptOpen] = useState(false);
    const {
        createJob,
        createJobAiPrompt,
        generateJobContent,
        loadingCreateJob,
        loadingCreatePrompt,
        loadingGenerateDescription,
        loadingGenerateRequirements,
    } = useJobStore();
    const {
        register,
        handleSubmit,
        control,
        setValue,
        getValues,
        reset,
        formState: { errors, isValid, isDirty, isSubmitting },
    } = useForm<JobFormValues>({
        defaultValues: async () => {
            const emptyDefaults: JobFormValues = {
                title: "",
                employment_type: "",
                workplace_type: "",
                seniority_level: "",
                industry: "",
                location: "",
                salary_currency: "",
                salary_from: undefined,
                salary_to: undefined,
                is_salary_negotiable: false,
                description: "",
                requirements: "",
                certifications: "",
                company_overview: "",
                role_overview: "",
                responsibilities: "",
                nice_to_have: "",
                what_we_offer: "",
                job_benefits: "",
                auto_score_matching_threshold: undefined,
                auto_email_invite_threshold: undefined,
                auto_shortlisted_threshold: undefined,
                auto_denied_threshold: undefined,
                soft_skills: "",
                technical_skills: "",
                languages: "",
            };
            if (typeof window === "undefined") return emptyDefaults;
            const saved = window.localStorage.getItem(DRAFT_KEY);
            if (!saved) return emptyDefaults;
            try {
                const draft = JSON.parse(saved) as Partial<JobFormValues> & {
                    softSkills?: string[];
                    technicalSkills?: string[];
                    languagesRequired?: string[];
                };
                const nextSoftSkills =
                    draft.softSkills ?? splitList(draft.soft_skills);
                const nextTechnicalSkills =
                    draft.technicalSkills ?? splitList(draft.technical_skills);
                const nextLanguages =
                    draft.languagesRequired ?? splitList(draft.languages);
                return {
                    ...emptyDefaults,
                    ...draft,
                    soft_skills: nextSoftSkills.join(", "),
                    technical_skills: nextTechnicalSkills.join(", "),
                    languages: nextLanguages.join(", "),
                };
            } catch {
                window.localStorage.removeItem(DRAFT_KEY);
                return emptyDefaults;
            }
        },
        mode: "onChange",
        resolver: zodResolver(jobSchema) as Resolver<JobFormValues>,
    });

    const watchedSoftSkills = useWatch({ control, name: "soft_skills" });
    const watchedTechnicalSkills = useWatch({ control, name: "technical_skills" });
    const watchedLanguages = useWatch({ control, name: "languages" });

    const softSkillsList = useMemo(
        () => splitList(watchedSoftSkills),
        [watchedSoftSkills]
    );
    const technicalSkillsList = useMemo(
        () => splitList(watchedTechnicalSkills),
        [watchedTechnicalSkills]
    );
    const languagesList = useMemo(
        () => splitList(watchedLanguages),
        [watchedLanguages]
    );

    const saveDraft = useCallback(() => {
        if (typeof window === "undefined") return;
        const values = getValues();
        const draft = {
            ...values,
            soft_skills: softSkillsList.join(", "),
            technical_skills: technicalSkillsList.join(", "),
            languages: languagesList.join(", "),
            softSkills: softSkillsList,
            technicalSkills: technicalSkillsList,
            languagesRequired: languagesList,
        };
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }, [getValues, softSkillsList, technicalSkillsList, languagesList]);

    const watchedForm = useWatch({ control });
    useEffect(() => {
        saveDraft();
    }, [watchedForm, softSkillsList, technicalSkillsList, languagesList, saveDraft]);

    const selectOptions = useMemo(
        () => ({
            employment: employmentTypeOptions,
            workplace: workplaceTypeOptions,
            seniority: seniorityLevelOptions,
            industry: jobIndustryOptions,
            currency: jobSalaryCurrencyOptions,
        }),
        []
    );

    const buildAiPayload = (target: "description" | "requirements") => {
        const values = getValues();
        return {
            title: values.title?.trim() ?? "",
            seniority_level: values.seniority_level ?? "",
            industry: values.industry ?? "",
            employment_type: values.employment_type ?? "",
            workplace_type: values.workplace_type ?? "",
            location: values.location ?? "",
            technical_skills: technicalSkillsList,
            soft_skills: softSkillsList,
            target,
        };
    };

    const resolveMissingAiFields = () => {
        const values = getValues();
        const missing: string[] = [];
        if (!values.title?.trim()) missing.push("job title");
        if (!values.employment_type) missing.push("employment type");
        if (!values.workplace_type) missing.push("workplace type");
        if (!values.industry) missing.push("industry");
        if (!values.seniority_level) missing.push("seniority level");
        if (!values.location) missing.push("location");
        return missing;
    };

    const onSubmit: SubmitHandler<JobFormValues> = async (values) => {
        const parsed = jobSchema.parse(values);
        const payload = {
            title: parsed.title,
            employment_type: parsed.employment_type,
            workplace_type: parsed.workplace_type,
            seniority_level: parsed.seniority_level,
            industry: parsed.industry,
            location: parsed.location,
            salary_currency: parsed.salary_currency,
            salary_from: parsed.salary_from,
            salary_to: parsed.salary_to,
            is_salary_negotiable: parsed.is_salary_negotiable,
            description: parsed.description,
            requirements: parsed.requirements,
            certifications: parsed.certifications?.trim() || undefined,
            company_overview: parsed.company_overview?.trim() || undefined,
            role_overview: parsed.role_overview?.trim() || undefined,
            responsibilities: parsed.responsibilities?.trim() || undefined,
            nice_to_have: parsed.nice_to_have?.trim() || undefined,
            what_we_offer: parsed.what_we_offer?.trim() || undefined,
            job_benefits: parsed.job_benefits?.trim() || undefined,
            auto_score_matching_threshold: parsed.auto_score_matching_threshold,
            auto_email_invite_threshold: parsed.auto_email_invite_threshold,
            auto_shortlisted_threshold: parsed.auto_shortlisted_threshold,
            auto_denied_threshold: parsed.auto_denied_threshold,
            soft_skills: softSkillsList,
            technical_skills: technicalSkillsList,
            languages: languagesList,
        };
        const created = await createJob(payload);
        if (created) {
            reset();
            setValue("soft_skills", "", { shouldDirty: false, shouldValidate: true });
            setValue("technical_skills", "", { shouldDirty: false, shouldValidate: true });
            setValue("languages", "", { shouldDirty: false, shouldValidate: true });
            if (typeof window !== "undefined") {
                window.localStorage.removeItem(DRAFT_KEY);
            }
            setPromptOpen(true);
        }
    };

    const handleGenerate = async (target: "description" | "requirements") => {
        const missing = resolveMissingAiFields();
        if (missing.length > 0) {
            warningToast(`Fill ${missing.join(", ")} before generating content.`);
            return;
        }
        const payload = buildAiPayload(target);
        const generated = await generateJobContent(payload);
        if (!generated) return;
        if (target === "description") {
            setValue("description", generated.description, {
                shouldDirty: true,
                shouldValidate: true,
            });
        } else {
            setValue("requirements", generated.requirements, {
                shouldDirty: true,
                shouldValidate: true,
            });
        }
    };

    const missingAiFields = resolveMissingAiFields();

    const errorSummary = useMemo(() => {
        const labels: Partial<Record<keyof JobFormValues, string>> = {
            title: "Job title",
            employment_type: "Employment type",
            workplace_type: "Workplace type",
            seniority_level: "Seniority level",
            industry: "Industry",
            location: "Location",
            salary_currency: "Salary currency",
            salary_from: "Salary minimum",
            salary_to: "Salary maximum",
            description: "Job description",
            requirements: "Job requirements",
        };
        return Object.entries(errors)
            .map(([key, value]) => {
                if (key === "root" && typeof value?.message === "string") {
                    return value.message;
                }
                const message =
                    typeof value?.message === "string"
                        ? value.message
                        : "This field needs attention.";
                const label = labels[key as keyof JobFormValues] ?? key;
                return `${label}: ${message}`;
            })
            .filter(Boolean);
    }, [errors]);

    const handleInvalid: SubmitErrorHandler<JobFormValues> = () => {
        warningToast("Please fix the highlighted errors before submitting.");
    };

    const handlePromptModalSubmit = async (values: AiPromptFormValues) => {
        const ok = await createJobAiPrompt(values);
        if (ok) {
            setPromptOpen(false);
        }
    };

    return (
        <section className="space-y-6">
            <div className="rounded-md border border-blue-200 bg-white p-6 shadow-xl shadow-blue-200/60 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
                <div>
                    <Link
                        href="/jobs"
                        className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to jobs
                    </Link>
                    <h2 className="text-lg font-semibold text-blue-700 dark:text-slate-100">
                        Add New Job
                    </h2>
                    <p className="text-sm text-blue-600 dark:text-slate-300">
                        Publish a new role.
                    </p>
                </div>
            </div>

            <form
                className="space-y-6"
                onSubmit={handleSubmit(onSubmit, handleInvalid)}
            >
                <div className="rounded-md border border-blue-200 bg-white p-6 shadow-xl shadow-blue-200/60 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                <span className="inline-flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-[#005ca9]" />
                                    Job Title
                                </span>
                            </label>
                            <Input placeholder="e.g., Senior Frontend Developer" {...register("title")} />
                            {errors.title && (
                                <p className="text-xs text-red-500">{errors.title.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                <span className="inline-flex items-center gap-2">
                                    <Users className="h-4 w-4 text-indigo-500" />
                                    Employment Type
                                </span>
                            </label>
                            <Controller
                                control={control}
                                name="employment_type"
                                render={({ field }) => (
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select employment type..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {selectOptions.employment.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.employment_type && (
                                <p className="text-xs text-red-500">
                                    {errors.employment_type.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                <span className="inline-flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-emerald-500" />
                                    Workplace Type
                                </span>
                            </label>
                            <Controller
                                control={control}
                                name="workplace_type"
                                render={({ field }) => (
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select workplace type..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {selectOptions.workplace.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.workplace_type && (
                                <p className="text-xs text-red-500">
                                    {errors.workplace_type.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                <span className="inline-flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4 text-amber-500" />
                                    Seniority Level
                                </span>
                            </label>
                            <Controller
                                control={control}
                                name="seniority_level"
                                render={({ field }) => (
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select seniority level..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {selectOptions.seniority.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.seniority_level && (
                                <p className="text-xs text-red-500">
                                    {errors.seniority_level.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                <span className="inline-flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-sky-500" />
                                    Industry
                                </span>
                            </label>
                            <Controller
                                control={control}
                                name="industry"
                                render={({ field }) => (
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select industry..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {selectOptions.industry.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.industry && (
                                <p className="text-xs text-red-500">{errors.industry.message}</p>
                            )}
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                <span className="inline-flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-rose-500" />
                                    Location
                                </span>
                            </label>
                            <Input placeholder="e.g., Cairo, Egypt" {...register("location")} />
                            {errors.location && (
                                <p className="text-xs text-red-500">{errors.location.message}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="rounded-md border border-blue-200 bg-white p-6 shadow-xl shadow-blue-200/60 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                <span className="inline-flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-emerald-600" />
                                    Salary Currency
                                </span>
                            </label>
                            <Controller
                                control={control}
                                name="salary_currency"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select salary currency..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {selectOptions.currency.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.salary_currency && (
                                <p className="text-xs text-red-500">
                                    {errors.salary_currency.message}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                className="h-4 w-4 accent-[#009ad5]"
                                {...register("is_salary_negotiable")}
                            />
                            <span className="text-sm text-slate-600 dark:text-slate-300">
                                Salary negotiable
                            </span>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                <span className="inline-flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-emerald-600" />
                                    Minimum Salary
                                </span>
                            </label>
                            <Input type="number" min={0} placeholder="e.g., 1200" {...register("salary_from")} />
                            {errors.salary_from && (
                                <p className="text-xs text-red-500">{errors.salary_from.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                <span className="inline-flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-emerald-600" />
                                    Maximum Salary
                                </span>
                            </label>
                            <Input type="number" min={0} placeholder="e.g., 2000" {...register("salary_to")} />
                            {errors.salary_to && (
                                <p className="text-xs text-red-500">{errors.salary_to.message}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="rounded-md border border-blue-200 bg-white p-6 shadow-xl shadow-blue-200/60 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                <span className="inline-flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4 text-indigo-500" />
                                    Score Matching Threshold
                                </span>
                            </label>
                            <Input type="number" min={0} placeholder="e.g., 75" {...register("auto_score_matching_threshold")} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                <span className="inline-flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-sky-500" />
                                    Email Invite Threshold
                                </span>
                            </label>
                            <Input type="number" min={0} placeholder="e.g., 80" {...register("auto_email_invite_threshold")} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                <span className="inline-flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    Shortlist Threshold
                                </span>
                            </label>
                            <Input type="number" min={0} placeholder="e.g., 85" {...register("auto_shortlisted_threshold")} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                <span className="inline-flex items-center gap-2">
                                    <XCircle className="h-4 w-4 text-rose-500" />
                                    Denied Threshold
                                </span>
                            </label>
                            <Input type="number" min={0} placeholder="e.g., 50" {...register("auto_denied_threshold")} />
                        </div>
                    </div>
                </div>

                <div className="rounded-md border border-blue-200 bg-white p-6 shadow-xl shadow-blue-200/60 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                <span className="inline-flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-indigo-500" />
                                    Job Description
                                </span>
                            </label>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <RetraceTextEditor
                                        value={field.value ?? ""}
                                        onChange={field.onChange}
                                        placeholder="Describe the role and responsibilities..."
                                    />
                                )}
                            />
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={loadingGenerateDescription || missingAiFields.length > 0}
                                    onClick={() => handleGenerate("description")}
                                >
                                    <span className="inline-flex items-center gap-2">
                                        <Sparkles className="h-4 w-4" />
                                        {loadingGenerateDescription
                                            ? "Generating..."
                                            : "Generate description"}
                                    </span>
                                </Button>
                            </div>
                            {errors.description && (
                                <p className="text-xs text-red-500">{errors.description.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                <span className="inline-flex items-center gap-2">
                                    <ClipboardList className="h-4 w-4 text-amber-500" />
                                    Job Requirements
                                </span>
                            </label>
                            <Controller
                                name="requirements"
                                control={control}
                                render={({ field }) => (
                                    <RetraceTextEditor
                                        value={field.value ?? ""}
                                        onChange={field.onChange}
                                        placeholder="List required skills and experience..."
                                    />
                                )}
                            />
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={loadingGenerateRequirements || missingAiFields.length > 0}
                                    onClick={() => handleGenerate("requirements")}
                                >
                                    <span className="inline-flex items-center gap-2">
                                        <Sparkles className="h-4 w-4" />
                                        {loadingGenerateRequirements
                                            ? "Generating..."
                                            : "Generate requirements"}
                                    </span>
                                </Button>
                            </div>
                            {errors.requirements && (
                                <p className="text-xs text-red-500">{errors.requirements.message}</p>
                            )}
                        </div>
                    </div>
                </div>

                <details className="rounded-md border border-blue-200 bg-white shadow-xl shadow-blue-200/60 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
                    <summary className="cursor-pointer px-6 py-4 text-sm font-semibold text-blue-700 dark:text-slate-200">
                        Optional details
                    </summary>
                    <div className="space-y-6 border-t border-blue-100 px-6 py-6 dark:border-slate-700/60">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                    Company Overview (Optional)
                                </label>
                                <Controller
                                    name="company_overview"
                                    control={control}
                                    render={({ field }) => (
                                        <RetraceTextEditor
                                            value={field.value ?? ""}
                                            onChange={field.onChange}
                                            placeholder="Share a brief company overview..."
                                        />
                                    )}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                    Role Overview (Optional)
                                </label>
                                <Controller
                                    name="role_overview"
                                    control={control}
                                    render={({ field }) => (
                                        <RetraceTextEditor
                                            value={field.value ?? ""}
                                            onChange={field.onChange}
                                            placeholder="Summarize the role and its impact..."
                                        />
                                    )}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                    Responsibilities (Optional)
                                </label>
                                <Controller
                                    name="responsibilities"
                                    control={control}
                                    render={({ field }) => (
                                        <RetraceTextEditor
                                            value={field.value ?? ""}
                                            onChange={field.onChange}
                                            placeholder="List the key responsibilities..."
                                        />
                                    )}
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                    Nice to Have (Optional)
                                </label>
                                <Controller
                                    name="nice_to_have"
                                    control={control}
                                    render={({ field }) => (
                                        <RetraceTextEditor
                                            value={field.value ?? ""}
                                            onChange={field.onChange}
                                            placeholder="Share nice-to-have skills or experience..."
                                        />
                                    )}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                    What We Offer (Optional)
                                </label>
                                <Controller
                                    name="what_we_offer"
                                    control={control}
                                    render={({ field }) => (
                                        <RetraceTextEditor
                                            value={field.value ?? ""}
                                            onChange={field.onChange}
                                            placeholder="Describe what you offer candidates..."
                                        />
                                    )}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                    Job Benefits (Optional)
                                </label>
                                <Controller
                                    name="job_benefits"
                                    control={control}
                                    render={({ field }) => (
                                        <RetraceTextEditor
                                            value={field.value ?? ""}
                                            onChange={field.onChange}
                                            placeholder="List benefits and perks..."
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </details>

                <div className="rounded-md border border-blue-200 bg-white p-6 shadow-xl shadow-blue-200/60 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
                    <div className="grid gap-4 md:grid-cols-2">
                        <SkillTagInput
                            label="Soft Skills"
                            icon={<Sparkles className="h-4 w-4 text-purple-500" />}
                            iconClassName=""
                            values={softSkillsList}
                            onChange={(next) => {
                                setValue("soft_skills", next.join(", "), {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                });
                            }}
                            options={jobSoftSkillsOptions}
                            placeholder="Type or select soft skills..."
                            allowCustom
                        />
                        <SkillTagInput
                            label="Technical Skills"
                            icon={<Code2 className="h-4 w-4 text-slate-600 dark:text-slate-300" />}
                            iconClassName=""
                            values={technicalSkillsList}
                            onChange={(next) => {
                                setValue("technical_skills", next.join(", "), {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                });
                            }}
                            options={jobTechnicalSkillsOptions}
                            placeholder="Type or select technical skills..."
                            allowCustom
                        />
                        <div className="md:col-span-2">
                            <SkillTagInput
                                label="Languages Required (Optional)"
                                icon={<Languages className="h-4 w-4 text-sky-500" />}
                                iconClassName=""
                                values={languagesList}
                                onChange={(next) => {
                                    setValue("languages", next.join(", "), {
                                        shouldDirty: true,
                                        shouldValidate: true,
                                    });
                                }}
                                options={jobLanguageOptions}
                                placeholder="Type or select languages..."
                                allowCustom
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                <span className="inline-flex items-center gap-2">
                                    <Award className="h-4 w-4 text-amber-500" />
                                    Certifications (Optional)
                                </span>
                            </label>
                            <Textarea placeholder="e.g., PMP, Scrum Master" {...register("certifications")} />
                        </div>
                    </div>
                </div>

                {errorSummary.length > 0 && (
                    <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-100">
                        <p className="text-sm font-semibold">Fix these before posting:</p>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                            {errorSummary.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>
                )}
                <div className="flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            reset();
                            setValue("soft_skills", "", { shouldDirty: false, shouldValidate: true });
                            setValue("technical_skills", "", { shouldDirty: false, shouldValidate: true });
                            setValue("languages", "", { shouldDirty: false, shouldValidate: true });
                            if (typeof window !== "undefined") {
                                window.localStorage.removeItem(DRAFT_KEY);
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={loadingCreateJob || isSubmitting || !isValid || !isDirty}
                        className="rounded-md bg-linear-to-r from-[#009ad5] to-[#005ca9] text-white hover:from-[#009ad5]/90 hover:to-[#005ca9]/90"
                    >
                        {loadingCreateJob ? "Posting..." : "Post Job"}
                    </Button>
                </div>
            </form>
            <JobAiPromptModal
                open={promptOpen}
                onOpenChange={setPromptOpen}
                onSubmit={handlePromptModalSubmit}
                loading={loadingCreatePrompt}
            />
        </section>
    );
};

export default AddJobForm;