"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2 } from "lucide-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ThemeSwitch from "@/shared/components/layout/theme/ThemeSwitch";
import useAgencyStore from "@/shared/store/pages/agency/useAgencyStore";
import { ACCESS_TOKEN_KEY } from "@/lib/authTokens";
import Combobox from "@/shared/components/common/Combobox";
import { companyIndustries, companySizes } from "@/shared/core/agency/options";

type OverviewFormValues = {
    company_name: string;
    organization_url: string;
    company_size: string;
    company_industry: string;
    company_description: string;
};

type JoinFormValues = {
    organization_id: string;
    invite_code: string;
};

const createSchema = z
    .object({
        company_name: z.union([z.literal(""), z.string()]),
        organization_url: z.union([
            z.literal(""),
            z.string().url("Enter a valid URL"),
        ]),
        company_size: z.union([
            z.literal(""),
            z.string().max(64, "Company size is too long."),
        ]),
        company_industry: z.union([
            z.literal(""),
            z.string().max(64, "Industry is too long."),
        ]),
        company_description: z.union([z.literal(""), z.string()]),
    })
    .superRefine((data, ctx) => {
        const hasValue = [
            data.company_name,
            data.organization_url,
            data.company_size,
            data.company_industry,
            data.company_description,
        ].some((value) => value.trim().length > 0);
        if (!hasValue) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Add at least one organization field to update.",
                path: ["root"],
            });
        }
    });

const joinSchema = z.object({
    organization_id: z.string().min(1, "Organization ID is required"),
    invite_code: z.string().min(1, "Invite code is required"),
});

const OverviewPage = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"create" | "join">("create");
    const accessToken =
        typeof window !== "undefined"
            ? Cookies.get(ACCESS_TOKEN_KEY) ?? null
            : null;
    const { getOverview, updateAgency, loadingUpdateAgency } = useAgencyStore();
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        control,
        trigger,
        formState: { errors, isValid, isDirty },
    } = useForm<OverviewFormValues>({
        defaultValues: {
            company_name: "",
            organization_url: "",
            company_size: "",
            company_industry: "",
            company_description: "",
        },
        mode: "onChange",
        resolver: zodResolver(createSchema),
    });

    const {
        register: registerJoin,
        handleSubmit: handleJoinSubmit,
        formState: { errors: joinErrors, isValid: isJoinValid, isDirty: isJoinDirty },
    } = useForm<JoinFormValues>({
        defaultValues: {
            organization_id: "",
            invite_code: "",
        },
        mode: "onChange",
        resolver: zodResolver(joinSchema),
    });

    useEffect(() => {
        if (!accessToken) {
            router.push("/auth/login");
            return;
        }
        const loadOverview = async () => {
            const response = await getOverview(accessToken);
            if (response?.isComplete) {
                router.push("/");
                return;
            }
            if (response?.agency) {
                reset({
                    company_name: response.agency.company_name ?? "",
                    organization_url: response.agency.organization_url ?? "",
                    company_size: response.agency.company_size ?? "",
                    company_industry: response.agency.company_industry ?? "",
                    company_description: response.agency.company_description ?? "",
                });
                trigger();
            }
        };
        loadOverview();
    }, [accessToken, getOverview, reset, router, trigger]);

    const handleCreateSubmit = async (values: OverviewFormValues) => {
        if (!accessToken) return;
        const updated = await updateAgency(values, accessToken);
        if (updated) {
            router.push("/");
        }
    };

    const handleJoin = () => {
        // TODO: backend integration
    };

    const tabButtonClass = (tab: "create" | "join") =>
        `flex-1 rounded-md border px-3 py-2 text-sm font-medium transition ${activeTab === tab
            ? "border-transparent text-white bg-linear-to-r from-[#009ad5] to-[#005ca9] shadow-sm dark:border-slate-600 dark:shadow-none"
            : "border-transparent bg-blue-50 text-blue-600 hover:border-blue-200 hover:bg-blue-100/60 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800"
        }`;

    const companySizeValue = useWatch({ control, name: "company_size" });
    const companyIndustryValue = useWatch({ control, name: "company_industry" });

    const isCreateDisabled = !isValid || !isDirty || loadingUpdateAgency;
    const isJoinDisabled = !isJoinValid || !isJoinDirty;

    const helpText = useMemo(
        () =>
            activeTab === "create"
                ? "You can always invite team members or change settings later."
                : "Use the invite details shared by your organization admin.",
        [activeTab]
    );

    return (
        <div className="light-neutral-scope">
            <section className="relative flex min-h-screen items-center justify-center bg-blue-50 px-4 py-10 dark:bg-slate-950">
                <div className="absolute right-6 top-6">
                    <ThemeSwitch />
                </div>
                <div className="w-full max-w-2xl space-y-6">
                    <div className="text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-blue-100 text-blue-600 dark:bg-slate-800 dark:text-blue-300">
                            <Building2 className="size-6" />
                        </div>
                        <h1 className="text-2xl font-semibold text-blue-700 dark:text-blue-300">
                            Set Up Your Organization
                        </h1>
                        <p className="mt-2 text-sm text-blue-600 dark:text-slate-300">
                            Create a new organization or join an existing one to get
                            started with hiring.
                        </p>
                    </div>

                    <div className="rounded-md border border-blue-200 bg-white p-6 shadow-xl shadow-blue-200/60 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-blue-700 dark:text-slate-200">
                                    Choose Your Path
                                </h2>
                                <p className="text-xs text-blue-600 dark:text-slate-300">{helpText}</p>
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2 rounded-md bg-blue-50 p-1 dark:bg-slate-800/70">
                            <button
                                type="button"
                                className={tabButtonClass("create")}
                                onClick={() => setActiveTab("create")}
                            >
                                + Create New
                            </button>
                            <button
                                type="button"
                                className={tabButtonClass("join")}
                                onClick={() => setActiveTab("join")}
                            >
                                Join Existing
                            </button>
                        </div>

                        {activeTab === "create" ? (
                            <form
                                className="mt-6 space-y-4"
                                onSubmit={handleSubmit(handleCreateSubmit)}
                            >
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                        Company Name
                                    </label>
                                    <Input
                                        placeholder="e.g., Acme Corporation"
                                        className="dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-100 dark:placeholder:text-slate-400"
                                        {...register("company_name")}
                                    />
                                    {errors.company_name && (
                                        <p className="text-xs text-red-500">
                                            {errors.company_name.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                        Organization URL
                                    </label>
                                    <Input
                                        placeholder="https://your-company.com"
                                        className="dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-100 dark:placeholder:text-slate-400"
                                        {...register("organization_url")}
                                    />
                                    {errors.organization_url && (
                                        <p className="text-xs text-red-500">
                                            {errors.organization_url.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                        Company Size
                                    </label>
                                    <input type="hidden" {...register("company_size")} />
                                    <Combobox
                                        value={companySizeValue}
                                        onChange={(value) => setValue("company_size", value, { shouldValidate: true })}
                                        options={companySizes}
                                        placeholder="Select company size"
                                        searchPlaceholder="Search size..."
                                    />
                                    {errors.company_size && (
                                        <p className="text-xs text-red-500">
                                            {errors.company_size.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                        Industry
                                    </label>
                                    <input type="hidden" {...register("company_industry")} />
                                    <Combobox
                                        value={companyIndustryValue}
                                        onChange={(value) => setValue("company_industry", value, { shouldValidate: true })}
                                        options={companyIndustries}
                                        placeholder="Select industry"
                                        searchPlaceholder="Search industry..."
                                    />
                                    {errors.company_industry && (
                                        <p className="text-xs text-red-500">
                                            {errors.company_industry.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                        Company Description (Optional)
                                    </label>
                                    <Textarea
                                        className="min-h-[96px] dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-100 dark:placeholder:text-slate-400"
                                        placeholder="Tell us about your company..."
                                        {...register("company_description")}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isCreateDisabled}
                                    className="w-full rounded-md bg-linear-to-r from-[#009ad5] to-[#005ca9] text-white hover:from-[#009ad5] hover:to-[#005ca9]"
                                >
                                    {loadingUpdateAgency ? "Saving..." : "Create Organization"}
                                </Button>
                                {errors.root?.message && (
                                    <p className="text-center text-xs text-red-500">
                                        {errors.root.message}
                                    </p>
                                )}
                            </form>
                        ) : (
                            <form
                                className="mt-6 space-y-4"
                                onSubmit={handleJoinSubmit(handleJoin)}
                            >
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                        Organization ID
                                    </label>
                                    <Input
                                        placeholder="Enter the organization ID from your invitation email"
                                        className="dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-100 dark:placeholder:text-slate-400"
                                        {...registerJoin("organization_id")}
                                    />
                                    {joinErrors.organization_id && (
                                        <p className="text-xs text-red-500">
                                            {joinErrors.organization_id.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                        Invite Code
                                    </label>
                                    <Input
                                        placeholder="Enter your invite code"
                                        className="dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-100 dark:placeholder:text-slate-400"
                                        {...registerJoin("invite_code")}
                                    />
                                    {joinErrors.invite_code && (
                                        <p className="text-xs text-red-500">
                                            {joinErrors.invite_code.message}
                                        </p>
                                    )}
                                </div>
                                <p className="text-xs text-blue-600 dark:text-slate-300">
                                    Both Organization ID and Invite Code are required from your
                                    invitation email.
                                </p>
                                <Button
                                    type="submit"
                                    disabled={isJoinDisabled}
                                    className="w-full rounded-md bg-linear-to-r from-emerald-600 to-sky-600 text-white hover:from-emerald-500 hover:to-sky-500"
                                >
                                    Join Organization
                                </Button>
                            </form>
                        )}
                    </div>

                    <p className="text-center text-sm text-blue-600 dark:text-slate-300">
                        Need help? Contact support or check our documentation.
                    </p>
                </div>
            </section>
        </div>
    );
};

export default OverviewPage;

