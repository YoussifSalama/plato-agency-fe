"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeSwitch from "@/shared/components/layout/theme/ThemeSwitch";
import useAuthStore from "@/shared/store/pages/auth/useAuthStore";

const VerifyAccountContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token") ?? "";
    const { verifyAccountToken, resendVerificationToken } = useAuthStore();
    const [status, setStatus] = useState<"loading" | "success" | "failed">(
        "loading"
    );
    const [secondsLeft, setSecondsLeft] = useState(5);

    useEffect(() => {
        let active = true;
        const run = async () => {
            if (!token) {
                setStatus("failed");
                return;
            }
            const valid = await verifyAccountToken(token);
            if (!active) return;
            setStatus(valid ? "success" : "failed");
        };
        run();
        return () => {
            active = false;
        };
    }, [token, verifyAccountToken]);

    useEffect(() => {
        if (status !== "success") return;
        if (secondsLeft <= 0) {
            router.push("/auth/login");
            return;
        }
        const timer = setTimeout(() => {
            setSecondsLeft((prev) => prev - 1);
        }, 1000);
        return () => clearTimeout(timer);
    }, [router, secondsLeft, status]);

    const statusContent = useMemo(() => {
        if (status === "loading") {
            return {
                title: "Verifying your account",
                description: "Please wait while we verify your account.",
                icon: "loading",
            };
        }
        if (status === "success") {
            return {
                title: "Account verified",
                description: `Redirecting to login in ${secondsLeft}s`,
                icon: "success",
            };
        }
        return {
            title: "Verification failed",
            description: "The verification link is invalid or expired.",
            icon: "failed",
        };
    }, [secondsLeft, status]);

    const statusIcon =
        statusContent.icon === "loading" ? (
            <Loader2 className="size-6 animate-spin text-blue-600 dark:text-blue-300" />
        ) : statusContent.icon === "success" ? (
            <CheckCircle2 className="size-6 text-emerald-500" />
        ) : (
            <XCircle className="size-6 text-rose-500" />
        );

    return (
        <div className="light-neutral-scope">
            <section className="relative flex min-h-screen items-center justify-center bg-blue-50 px-4 py-10 dark:bg-slate-950">
                <div className="absolute right-6 top-6">
                    <ThemeSwitch />
                </div>
                <div className="w-full max-w-md rounded-md border border-blue-200 bg-white p-6 text-center shadow-xl shadow-blue-200/60 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-slate-800">
                        {statusIcon}
                    </div>
                    <h1 className="text-xl font-semibold text-blue-700 dark:text-blue-300">
                        {statusContent.title}
                    </h1>
                    <p className="mt-2 text-sm text-blue-600 dark:text-slate-300">
                        {statusContent.description}
                    </p>

                    {status === "success" && (
                        <Button
                            type="button"
                            className="mt-6 w-full rounded-md bg-linear-to-r from-[#009ad5] to-[#005ca9] text-white shadow-lg shadow-blue-300/60 hover:from-[#009ad5] hover:to-[#005ca9] dark:shadow-none"
                            onClick={() => router.push("/auth/login")}
                        >
                            Login now
                        </Button>
                    )}

                    {status === "failed" && (
                        <div className="mt-6 space-y-3">
                            <Button
                                type="button"
                                className="w-full rounded-md bg-linear-to-r from-[#009ad5] to-[#005ca9] text-white shadow-lg shadow-blue-300/60 hover:from-[#009ad5] hover:to-[#005ca9] dark:shadow-none"
                                onClick={() => resendVerificationToken(token)}
                                disabled={!token}
                            >
                                Resend verification email
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => router.push("/auth/login")}
                            >
                                Back to login
                            </Button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

const VerifyAccountPage = () => {
    return (
        <Suspense fallback={null}>
            <VerifyAccountContent />
        </Suspense>
    );
};

export default VerifyAccountPage;

