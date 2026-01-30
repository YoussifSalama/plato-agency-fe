"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Combobox from "@/shared/components/common/Combobox";
import useAgencyStore from "@/shared/store/pages/agency/useAgencyStore";
import { warningToast } from "@/shared/helper/toast";
import { companyIndustries, companySizes } from "@/shared/core/agency/options";

type OrgFormValues = {
    company_name: string;
    organization_url: string;
    company_size: string;
    company_industry: string;
    company_description: string;
};

const orgSchema = z
    .object({
        company_name: z.union([z.literal(""), z.string()]),
        organization_url: z.union([
            z.literal(""),
            z.string().url("Enter a valid URL"),
        ]),
        company_size: z.union([z.literal(""), z.string().max(64, "Company size is too long.")]),
        company_industry: z.union([z.literal(""), z.string().max(64, "Industry is too long.")]),
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

const SettingsPage = () => {
    const { getOverview, updateAgency, loadingUpdateAgency, loadingOverview } = useAgencyStore();
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        trigger,
        watch,
        formState: { errors, isValid, isDirty, isSubmitting },
    } = useForm<OrgFormValues>({
        defaultValues: {
            company_name: "",
            organization_url: "",
            company_size: "",
            company_industry: "",
            company_description: "",
        },
        mode: "onChange",
        resolver: zodResolver(orgSchema),
    });

    useEffect(() => {
        const loadOverview = async () => {
            const overview = await getOverview();
            if (overview?.agency) {
                reset({
                    company_name: overview.agency.company_name ?? "",
                    organization_url: overview.agency.organization_url ?? "",
                    company_size: overview.agency.company_size ?? "",
                    company_industry: overview.agency.company_industry ?? "",
                    company_description: overview.agency.company_description ?? "",
                });
                trigger();
            }
        };
        loadOverview();
    }, [getOverview, reset, trigger]);

    const handleOrgSave = async (values: OrgFormValues) => {
        const payload = {
            company_name: values.company_name.trim(),
            organization_url: values.organization_url.trim(),
            company_size: values.company_size.trim(),
            company_industry: values.company_industry.trim(),
            company_description: values.company_description.trim(),
        };
        const hasValue = Object.values(payload).some((value) => value);
        if (!hasValue) {
            warningToast("Add at least one organization field to update.");
            return;
        }
        await updateAgency(payload);
    };

    const companySizeValue = watch("company_size");
    const companyIndustryValue = watch("company_industry");

    const showSkeleton = loadingOverview;

    return (
        <section className="space-y-6">
            <div className="rounded-md border border-blue-200 bg-white p-6 shadow-xl shadow-blue-200/60 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
                <div>
                    <h2 className="text-lg font-semibold text-blue-700 dark:text-slate-100">
                        Agency Settings
                    </h2>
                    <p className="text-sm text-blue-600 dark:text-slate-300">
                        Keep your agency information up to date.
                    </p>
                </div>
                {showSkeleton ? (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 animate-pulse">
                        <div className="space-y-2">
                            <div className="h-4 w-28 rounded bg-blue-100/80 dark:bg-slate-700/60" />
                            <div className="h-9 w-full rounded-md bg-blue-100/70 dark:bg-slate-700/50" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-28 rounded bg-blue-100/80 dark:bg-slate-700/60" />
                            <div className="h-9 w-full rounded-md bg-blue-100/70 dark:bg-slate-700/50" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-28 rounded bg-blue-100/80 dark:bg-slate-700/60" />
                            <div className="h-9 w-full rounded-md bg-blue-100/70 dark:bg-slate-700/50" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-28 rounded bg-blue-100/80 dark:bg-slate-700/60" />
                            <div className="h-9 w-full rounded-md bg-blue-100/70 dark:bg-slate-700/50" />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <div className="h-4 w-32 rounded bg-blue-100/80 dark:bg-slate-700/60" />
                            <div className="h-24 w-full rounded-md bg-blue-100/70 dark:bg-slate-700/50" />
                        </div>
                        <div className="sm:col-span-2 mt-2 flex justify-end">
                            <div className="h-9 w-28 rounded-md bg-blue-100/80 dark:bg-slate-700/60" />
                        </div>
                    </div>
                ) : (
                    <form className="mt-4" onSubmit={handleSubmit(handleOrgSave)}>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                    Agency name
                                </label>
                                <Input placeholder="Agency name" {...register("company_name")} />
                                {errors.company_name && (
                                    <p className="text-xs text-red-500">
                                        {errors.company_name.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                    Agency website
                                </label>
                                <Input
                                    placeholder="https://your-company.com"
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
                                    Agency size
                                </label>
                                <input type="hidden" {...register("company_size")} />
                                <Combobox
                                    value={companySizeValue}
                                    onChange={(value) =>
                                        setValue("company_size", value, {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                        })
                                    }
                                    options={companySizes}
                                    placeholder="Select size"
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
                                    onChange={(value) =>
                                        setValue("company_industry", value, {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                        })
                                    }
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
                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                    Agency description
                                </label>
                                <Textarea placeholder="Describe your agency" {...register("company_description")} />
                                {errors.company_description && (
                                    <p className="text-xs text-red-500">
                                        {errors.company_description.message}
                                    </p>
                                )}
                            </div>
                        </div>
                        {errors.root?.message && (
                            <p className="mt-3 text-xs text-red-500">{errors.root.message}</p>
                        )}
                        <div className="mt-6 flex justify-end">
                            <Button
                                type="submit"
                                disabled={loadingUpdateAgency || isSubmitting || !isValid || !isDirty}
                                className="rounded-md bg-linear-to-r from-[#009ad5] to-[#005ca9] text-white hover:from-[#009ad5] hover:to-[#005ca9]"
                            >
                                {loadingUpdateAgency ? "Saving..." : "Save agency"}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </section>
    );
};

export default SettingsPage;

