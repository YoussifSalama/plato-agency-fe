"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAgency from "@/shared/store/useAgency";

type PasswordFormValues = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
};

const passwordSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required."),
        newPassword: z
            .string()
            .min(8, "Password must be at least 8 characters.")
            .max(32, "Password must be at most 32 characters.")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
            ),
        confirmPassword: z.string().min(1, "Please confirm your new password."),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "New password and confirmation do not match.",
        path: ["confirmPassword"],
    });

const PasswordSettingsPage = () => {
    const { changePassword, loadingChangePassword } = useAgency();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid, isDirty, isSubmitting },
    } = useForm<PasswordFormValues>({
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
        mode: "onChange",
        resolver: zodResolver(passwordSchema),
    });

    const onSubmit = async (values: PasswordFormValues) => {
        const ok = await changePassword({
            oldPassword: values.currentPassword,
            newPassword: values.newPassword,
        });
        if (ok) {
            reset({ currentPassword: "", newPassword: "", confirmPassword: "" });
        }
    };

    return (
        <section className="rounded-md border border-blue-200 bg-white p-6 shadow-xl shadow-blue-200/60 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
            <h2 className="text-lg font-semibold text-blue-700 dark:text-slate-100">
                Update Password
            </h2>
            <form className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                        Current Password
                    </label>
                    <Input
                        type="password"
                        placeholder="Enter current password"
                        {...register("currentPassword")}
                    />
                    {errors.currentPassword && (
                        <p className="text-xs text-red-500">
                            {errors.currentPassword.message}
                        </p>
                    )}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                        New Password
                    </label>
                    <Input
                        type="password"
                        placeholder="Enter new password (min. 8 characters)"
                        {...register("newPassword")}
                    />
                    {errors.newPassword && (
                        <p className="text-xs text-red-500">
                            {errors.newPassword.message}
                        </p>
                    )}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                        Confirm New Password
                    </label>
                    <Input
                        type="password"
                        placeholder="Confirm new password"
                        {...register("confirmPassword")}
                    />
                    {errors.confirmPassword && (
                        <p className="text-xs text-red-500">
                            {errors.confirmPassword.message}
                        </p>
                    )}
                </div>
                <div className="mt-6 flex justify-end">
                    <Button
                        type="submit"
                        disabled={loadingChangePassword || isSubmitting || !isValid || !isDirty}
                        className="rounded-md bg-linear-to-r from-[#009ad5] to-[#005ca9] text-white hover:from-[#009ad5] hover:to-[#005ca9]"
                    >
                        {loadingChangePassword ? "Updating..." : "Update Password"}
                    </Button>
                </div>
            </form>
        </section>
    );
};

export default PasswordSettingsPage;

