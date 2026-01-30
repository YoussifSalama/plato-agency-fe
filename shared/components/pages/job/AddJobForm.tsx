"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Controller,
    useFieldArray,
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

const aiPromptSchema = z.object({
    target: z.string().min(1, "Target is required."),
    prompt: z.string().min(1, "Prompt is required."),
    evaluation: z
        .array(
            z.object({
                key: z.string().min(1, "Evaluation key is required."),
                value: z.string().min(1, "Evaluation value is required."),
            })
        )
        .min(1, "Add at least one evaluation item."),
});

const AddJobForm = () => {
    const DRAFT_KEY = "plato_job_draft_v1";
    const [activeTab, setActiveTab] = useState<"job" | "ai">("job");
    const [promptOpen, setPromptOpen] = useState(false);
    const { createJob, createJobAiPrompt, loadingCreateJob, loadingCreatePrompt } =
        useJobStore();
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

    const {
        register: registerPrompt,
        handleSubmit: handlePromptSubmit,
        control: promptControl,
        reset: resetPrompt,
        formState: { errors: promptErrors, isValid: isPromptValid, isDirty: isPromptDirty },
    } = useForm<AiPromptFormValues>({
        defaultValues: {
            target: "",
            prompt: "",
            evaluation: [{ key: "", value: "" }],
        },
        mode: "onChange",
        resolver: zodResolver(aiPromptSchema),
    });
    const { fields: promptFields, append: appendPrompt, remove: removePrompt } = useFieldArray({
        control: promptControl,
        name: "evaluation",
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
            setActiveTab("ai");
            setPromptOpen(true);
        }
    };

    const handleInvalid: SubmitErrorHandler<JobFormValues> = () => {
        warningToast("Please fix the highlighted errors before submitting.");
    };

    const handlePromptModalSubmit = async (values: AiPromptFormValues) => {
        const ok = await createJobAiPrompt(values);
        if (ok) {
            setPromptOpen(false);
        }
    };

    const handleInlinePromptSubmit: SubmitHandler<AiPromptFormValues> = async (values) => {
        const ok = await createJobAiPrompt(values);
        if (ok) {
            resetPrompt({
                target: "",
                prompt: "",
                evaluation: [{ key: "", value: "" }],
            });
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
                        Publish a new role and optionally attach an AI prompt after creation.
                    </p>
                </div>
                <div className="mt-4 flex gap-2 rounded-md bg-blue-50 p-1 dark:bg-slate-800/70">
                    <button
                        type="button"
                        onClick={() => setActiveTab("job")}
                        className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${activeTab === "job"
                            ? "bg-linear-to-r from-[#009ad5] to-[#005ca9] text-white"
                            : "text-blue-600 hover:bg-blue-100/60 dark:text-slate-300 dark:hover:bg-slate-800"
                            }`}
                    >
                        Job Details
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("ai")}
                        className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${activeTab === "ai"
                            ? "bg-linear-to-r from-[#009ad5] to-[#005ca9] text-white"
                            : "text-blue-600 hover:bg-blue-100/60 dark:text-slate-300 dark:hover:bg-slate-800"
                            }`}
                    >
                        AI Prompt (Optional)
                    </button>
                </div>
            </div>

            {activeTab === "job" ? (
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
                                <Textarea placeholder="Describe the role and responsibilities..." {...register("description")} />
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
                                <Textarea placeholder="List required skills and experience..." {...register("requirements")} />
                                {errors.requirements && (
                                    <p className="text-xs text-red-500">{errors.requirements.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

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
            ) : (
                <div className="rounded-md border border-blue-200 bg-white p-6 shadow-xl shadow-blue-200/60 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
                    <h3 className="text-base font-semibold text-blue-700 dark:text-slate-100">
                        AI Prompt
                    </h3>
                    <p className="mt-1 text-sm text-blue-600 dark:text-slate-300">
                        Add an AI prompt to guide how resumes are evaluated for this job. You can skip it.
                    </p>
                    <form className="mt-6 space-y-4" onSubmit={handlePromptSubmit(handleInlinePromptSubmit)}>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                Target
                            </label>
                            <Input placeholder="e.g., resume" {...registerPrompt("target")} />
                            {promptErrors.target && (
                                <p className="text-xs text-red-500">{promptErrors.target.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                Prompt
                            </label>
                            <Textarea
                                placeholder="Describe how the AI should evaluate candidates..."
                                className="min-h-[120px]"
                                {...registerPrompt("prompt")}
                            />
                            {promptErrors.prompt && (
                                <p className="text-xs text-red-500">{promptErrors.prompt.message}</p>
                            )}
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                    Evaluation items
                                </label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => appendPrompt({ key: "", value: "" })}
                                >
                                    Add item
                                </Button>
                            </div>
                            {promptFields.map((field, index) => (
                                <div key={field.id} className="rounded-md border border-blue-100 p-3">
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-slate-600">
                                                Key
                                            </label>
                                            <Input
                                                placeholder="e.g., experience"
                                                {...registerPrompt(`evaluation.${index}.key`)}
                                            />
                                            {promptErrors.evaluation?.[index]?.key && (
                                                <p className="text-xs text-red-500">
                                                    {promptErrors.evaluation[index]?.key?.message}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-slate-600">
                                                Value
                                            </label>
                                            <Input
                                                placeholder="e.g., 3+ years"
                                                {...registerPrompt(`evaluation.${index}.value`)}
                                            />
                                            {promptErrors.evaluation?.[index]?.value && (
                                                <p className="text-xs text-red-500">
                                                    {promptErrors.evaluation[index]?.value?.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-3 flex justify-end">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="text-red-600 hover:text-red-700"
                                            onClick={() => removePrompt(index)}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {promptErrors.evaluation &&
                                typeof promptErrors.evaluation?.message === "string" && (
                                    <p className="text-xs text-red-500">
                                        {promptErrors.evaluation.message}
                                    </p>
                                )}
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => resetPrompt()}>
                                Clear
                            </Button>
                            <Button
                                type="submit"
                                disabled={loadingCreatePrompt || !isPromptValid || !isPromptDirty}
                                className="rounded-md bg-linear-to-r from-[#009ad5] to-[#005ca9] text-white hover:from-[#009ad5]/90 hover:to-[#005ca9]/90"
                            >
                                {loadingCreatePrompt ? "Saving..." : "Save AI Prompt"}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

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

