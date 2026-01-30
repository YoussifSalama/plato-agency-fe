"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAuthStore from "@/shared/store/pages/auth/useAuthStore";
import ThemeSwitch from "@/shared/components/layout/theme/ThemeSwitch";

type SignupFormValues = {
    f_name: string;
    l_name: string;
    user_name: string;
    email: string;
    password: string;
};

const signupSchema = z.object({
    f_name: z.string().min(1, "First name is required"),
    l_name: z.string().min(1, "Last name is required"),
    user_name: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(32, "Username must be at most 32 characters")
        .regex(/^[a-zA-Z0-9]+$/, "Username must contain only letters and numbers"),
    email: z.string().email("Enter a valid email"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(32, "Password must be at most 32 characters")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
        ),
});

const SignupPage = () => {
    const { signup, loadingSignup } = useAuthStore();
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isDirty },
    } = useForm<SignupFormValues>({
        defaultValues: {
            f_name: "",
            l_name: "",
            user_name: "",
            email: "",
            password: "",
        },
        mode: "onChange",
        resolver: zodResolver(signupSchema),
    });

    const onSubmit = async (values: SignupFormValues) => {
        const isCreated = await signup(
            values.f_name,
            values.l_name,
            values.email,
            values.user_name,
            values.password
        );
        if (isCreated) {
            setTimeout(() => {
                router.push("/auth/login");
            }, 10000);
        }
    };

    return (
        <div className="light-neutral-scope">
            <section className="relative flex min-h-screen items-center justify-center bg-blue-50 px-4 py-10 dark:bg-slate-950">
                <div className="absolute right-6 top-6">
                    <ThemeSwitch />
                </div>
                <div className="w-full max-w-lg rounded-md border border-blue-200 bg-white p-6 shadow-xl shadow-blue-200/60 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
                    <div>
                        <h1 className="text-2xl font-semibold text-blue-700 dark:text-blue-300">
                            Create your account
                        </h1>
                        <p className="mt-1 text-sm text-blue-600 dark:text-slate-300">
                            Join Plato and start managing your hiring workflow.
                        </p>
                    </div>

                    <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                    First name
                                </label>
                                <div className="relative">
                                    <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-blue-500 dark:text-slate-300" />
                                    <Input
                                        placeholder="Enter your first name"
                                        className="pl-9 dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-100 dark:placeholder:text-slate-400"
                                        {...register("f_name")}
                                    />
                                </div>
                                {errors.f_name && (
                                    <p className="text-xs text-red-500">
                                        {errors.f_name.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                    Last name
                                </label>
                                <div className="relative">
                                    <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-blue-500 dark:text-slate-300" />
                                    <Input
                                        placeholder="Enter your last name"
                                        className="pl-9 dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-100 dark:placeholder:text-slate-400"
                                        {...register("l_name")}
                                    />
                                </div>
                                {errors.l_name && (
                                    <p className="text-xs text-red-500">
                                        {errors.l_name.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-blue-700 dark:text-slate-200">
                                Username
                            </label>
                            <div className="relative">
                                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-blue-500 dark:text-slate-300" />
                                <Input
                                    placeholder="Choose a username"
                                    className="pl-9 dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-100 dark:placeholder:text-slate-400"
                                    {...register("user_name")}
                                />
                            </div>
                            {errors.user_name && (
                                <p className="text-xs text-red-500">
                                    {errors.user_name.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-blue-700 dark:text-slate-200">Email</label>
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
                                    placeholder="Create a password"
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
                            disabled={loadingSignup || !isValid || !isDirty}
                            className="w-full rounded-md bg-linear-to-r from-[#009ad5] to-[#005ca9] text-white hover:from-[#009ad5] hover:to-[#005ca9]"
                        >
                            {loadingSignup ? "Creating account..." : "Create account"}
                        </Button>
                    </form>

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
                        Already have an account?{" "}
                        <Link href="/auth/login" className="text-blue-700 hover:underline dark:text-blue-400">
                            Sign in
                        </Link>
                    </p>
                </div>
            </section>
        </div>
    );
};

export default SignupPage;