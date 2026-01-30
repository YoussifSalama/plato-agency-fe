"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import useAuthStore from "@/shared/store/pages/auth/useAuthStore";
import useAgencyStore from "@/shared/store/pages/agency/useAgencyStore";
import { errorToast, successToast } from "@/shared/helper/toast";
import ThemeSwitch from "@/shared/components/layout/theme/ThemeSwitch";

type LoginFormValues = {
    email: string;
    password: string;
};

type ResetPasswordValues = {
    email: string;
};

const loginSchema = z.object({
    email: z.string().email("Enter a valid email"),
    password: z.string().min(1, "Password is required"),
});

const resetSchema = z.object({
    email: z.string().email("Enter a valid email"),
});

const LoginPage = () => {
    const { login, loadingLogin, requestPasswordReset } = useAuthStore();
    const { getOverview } = useAgencyStore();
    const router = useRouter();
    const [isResetOpen, setIsResetOpen] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isDirty },
    } = useForm<LoginFormValues>({
        defaultValues: { email: "", password: "" },
        mode: "onChange",
        resolver: zodResolver(loginSchema),
    });
    const {
        register: registerReset,
        handleSubmit: handleSubmitReset,
        formState: {
            errors: resetErrors,
            isValid: isResetValid,
            isDirty: isResetDirty,
            isSubmitting: isResetSubmitting,
        },
        reset: resetResetForm,
    } = useForm<ResetPasswordValues>({
        defaultValues: { email: "" },
        mode: "onChange",
        resolver: zodResolver(resetSchema),
    });

    const onSubmit = async ({ email, password }: LoginFormValues) => {
        const result = await login(email, password);
        if (!result?.access_token) return;
        const overview = await getOverview(result.access_token);
        if (overview?.agency && overview.isComplete) {
            router.push("/");
        } else {
            router.push("/overview");
        }
    };

    const onResetSubmit = async ({ email }: ResetPasswordValues) => {
        const sent = await requestPasswordReset(email);
        if (sent) {
            successToast("OTP sent. Check your email for the 6-digit code.");
            resetResetForm();
            setIsResetOpen(false);
            router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
        } else {
            errorToast("Failed to send reset OTP. Please try again.");
        }
    };

    return (
        <div className="light-neutral-scope">
            <section className="relative flex min-h-screen items-center justify-center bg-blue-50 px-4 py-10 dark:bg-slate-950">
                <div className="absolute right-6 top-6">
                    <ThemeSwitch />
                </div>
                <div className="w-full max-w-md rounded-md border border-blue-200 bg-white p-6 shadow-xl shadow-blue-200/60 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-semibold text-blue-700 dark:text-blue-300">
                                Welcome Back
                            </h1>
                            <p className="mt-1 text-sm text-blue-600 dark:text-slate-300">
                                Sign in to your account to access your employer dashboard
                            </p>
                        </div>
                    </div>

                    <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-blue-500 dark:text-slate-300" />
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="pl-9 dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-100 dark:placeholder:text-slate-400"
                                    {...register("email")}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-xs text-red-500">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-blue-500 dark:text-slate-300" />
                                <Input
                                    type="password"
                                    placeholder="Enter your password"
                                    className="pl-9 dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-100 dark:placeholder:text-slate-400"
                                    {...register("password")}
                                />
                            </div>
                            {errors.password && (
                                <p className="text-xs text-red-500">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={loadingLogin || !isValid || !isDirty}
                            className="w-full rounded-md bg-linear-to-r from-[#009ad5] to-[#005ca9] text-white hover:from-[#009ad5] hover:to-[#005ca9]"
                        >
                            {loadingLogin ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>

                    <div className="mt-4 text-center">
                        <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
                            <DialogTrigger asChild>
                                <button
                                    type="button"
                                    className="text-sm text-slate-600 hover:underline dark:text-blue-400"
                                >
                                    Forgot your password?
                                </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Reset your password</DialogTitle>
                                    <DialogDescription>
                                        Enter your email address and we&apos;ll send you a link
                                        to reset your password.
                                    </DialogDescription>
                                </DialogHeader>
                                <form
                                    className="mt-4 space-y-4"
                                    onSubmit={handleSubmitReset(onResetSubmit)}
                                >
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            Email address
                                        </label>
                                        <div className="relative">
                                            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                                            <Input
                                                type="email"
                                                placeholder="Enter your email address"
                                                className="pl-9"
                                                {...registerReset("email")}
                                            />
                                        </div>
                                        {resetErrors.email && (
                                            <p className="text-xs text-red-500">
                                                {resetErrors.email.message}
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={!isResetValid || !isResetDirty || isResetSubmitting}
                                        className="w-full rounded-md bg-linear-to-r from-[#009ad5] to-[#005ca9] text-white hover:from-[#009ad5] hover:to-[#005ca9]"
                                    >
                                        {isResetSubmitting ? "Sending..." : "Send reset OTP"}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="mt-6 flex items-center gap-3 text-xs text-blue-500 dark:text-slate-400">
                        <span className="h-px flex-1 bg-blue-200 dark:bg-slate-700" />
                        OR CONTINUE WITH
                        <span className="h-px flex-1 bg-blue-200 dark:bg-slate-700" />
                    </div>

                    <button
                        type="button"
                        className="mt-4 w-full rounded-md border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 transition hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                    >
                        Continue with Google
                    </button>

                    <p className="mt-6 text-center text-sm text-blue-600 dark:text-slate-300">
                        Don&apos;t have an account?{" "}
                        <Link href="/auth/signup" className="text-blue-700 hover:underline dark:text-blue-400">
                            Sign up here
                        </Link>
                    </p>
                </div>
            </section>
        </div>
    );
};

export default LoginPage;