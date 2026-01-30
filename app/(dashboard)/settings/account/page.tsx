"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAgency from "@/shared/store/useAgency";
import { warningToast } from "@/shared/helper/toast";

const profileSchema = z
    .object({
        firstName: z.union([z.literal(""), z.string()]),
        lastName: z.union([z.literal(""), z.string()]),
        username: z.union([
            z.literal(""),
            z
                .string()
                .min(3, "Username must be at least 3 characters.")
                .max(32, "Username must be at most 32 characters.")
                .regex(/^[a-zA-Z0-9]+$/, "Username must contain only letters and numbers."),
        ]),
    })
    .superRefine((data, ctx) => {
        const hasFirstName = data.firstName.trim().length > 0;
        const hasLastName = data.lastName.trim().length > 0;
        const hasUsername = data.username.trim().length > 0;
        if (!hasFirstName && !hasLastName && !hasUsername) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Add at least one profile field to update.",
                path: ["root"],
            });
        }
    });

type ProfileFormValues = z.infer<typeof profileSchema>;

const AccountSettingsPage = () => {
    const {
        account,
        loadingAccount,
        getMyAgencyAccountData,
        updateBrand,
        loadingUpdateBrand,
    } = useAgency();
    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isDirty, isSubmitting },
        reset,
        trigger,
    } = useForm<ProfileFormValues>({
        defaultValues: { firstName: "", lastName: "", username: "" },
        mode: "onChange",
        resolver: zodResolver(profileSchema),
    });

    useEffect(() => {
        if (!account) {
            getMyAgencyAccountData();
        }
    }, [account, getMyAgencyAccountData]);

    useEffect(() => {
        if (!account) return;
        reset(
            {
                firstName: account.f_name ?? "",
                lastName: account.l_name ?? "",
                username: account.user_name ?? "",
            },
            { keepErrors: false, keepDirty: false, keepTouched: false }
        );
        trigger();
    }, [account, reset, trigger]);

    const handleProfileSave = async (values: ProfileFormValues) => {
        const payload: Record<string, string> = {};
        const firstName = values.firstName.trim();
        const lastName = values.lastName.trim();
        const username = values.username.trim();
        if (firstName) payload.f_name = firstName;
        if (lastName) payload.l_name = lastName;
        if (username) payload.user_name = username;
        if (Object.keys(payload).length === 0) {
            warningToast("Add at least one profile field to update.");
            return;
        }
        await updateBrand(payload);
    };

    const handleInvalid = (formErrors: typeof errors) => {
        const firstMessage =
            formErrors.username?.message ||
            formErrors.lastName?.message ||
            formErrors.firstName?.message ||
            formErrors.root?.message;
        if (firstMessage) {
            warningToast(firstMessage);
        }
    };

    const emailLabel = useMemo(() => account?.email ?? "", [account?.email]);
    const showSkeleton = loadingAccount || !account;

    return (
        <section className="space-y-6">
            <div className="rounded-md border border-blue-200 bg-white p-6 shadow-xl shadow-blue-200/60 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
                <div>
                    <h2 className="text-lg font-semibold text-blue-700 dark:text-slate-100">
                        Account Settings
                    </h2>
                    <p className="text-sm text-blue-600 dark:text-slate-300">
                        Update your personal information and username.
                    </p>
                </div>
                {showSkeleton ? (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 animate-pulse">
                        <div className="space-y-2">
                            <div className="h-4 w-24 rounded bg-blue-100/80 dark:bg-slate-700/60" />
                            <div className="h-9 w-full rounded-md bg-blue-100/70 dark:bg-slate-700/50" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-24 rounded bg-blue-100/80 dark:bg-slate-700/60" />
                            <div className="h-9 w-full rounded-md bg-blue-100/70 dark:bg-slate-700/50" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-24 rounded bg-blue-100/80 dark:bg-slate-700/60" />
                            <div className="h-9 w-full rounded-md bg-blue-100/70 dark:bg-slate-700/50" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-28 rounded bg-blue-100/80 dark:bg-slate-700/60" />
                            <div className="h-9 w-full rounded-md bg-blue-100/70 dark:bg-slate-700/50" />
                        </div>
                        <div className="sm:col-span-2 mt-2 flex justify-end">
                            <div className="h-9 w-28 rounded-md bg-blue-100/80 dark:bg-slate-700/60" />
                        </div>
                    </div>
                ) : (
                    <>
                        <form
                            className="mt-4"
                            onSubmit={handleSubmit(handleProfileSave, handleInvalid)}
                        >
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                        First name
                                    </label>
                                    <Input placeholder="Enter first name" {...register("firstName")} />
                                    {errors.firstName && (
                                        <p className="text-xs text-red-500">
                                            {errors.firstName.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                        Last name
                                    </label>
                                    <Input placeholder="Enter last name" {...register("lastName")} />
                                    {errors.lastName && (
                                        <p className="text-xs text-red-500">
                                            {errors.lastName.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                        Username
                                    </label>
                                    <Input placeholder="Choose a username" {...register("username")} />
                                    {errors.username && (
                                        <p className="text-xs text-red-500">
                                            {errors.username.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                        Email address
                                    </label>
                                    <Input value={emailLabel} disabled />
                                </div>
                            </div>
                            {errors.root?.message && (
                                <p className="mt-3 text-xs text-red-500">{errors.root.message}</p>
                            )}
                            <div className="mt-6 flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={loadingUpdateBrand || isSubmitting || !isValid || !isDirty}
                                    className="rounded-md bg-linear-to-r from-[#009ad5] to-[#005ca9] text-white hover:from-[#009ad5] hover:to-[#005ca9]"
                                >
                                    {loadingUpdateBrand ? "Saving..." : "Save account"}
                                </Button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </section>
    );
};

export default AccountSettingsPage;

