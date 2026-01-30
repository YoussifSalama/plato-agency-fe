"use client";

import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { useTheme } from "next-themes";
import { ToastContainer, TypeOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ToastProvider = () => {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    return (
        <ToastContainer
            position="bottom-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme={isDark ? "dark" : "light"}
            toastClassName={`rounded-md border px-4 py-3 text-sm font-medium shadow-xl ${isDark
                ? "border-slate-700/60 bg-slate-900 text-slate-100 shadow-none"
                : "border-blue-200 bg-white text-slate-900 shadow-blue-200/60"
                }`}
            progressClassName="bg-blue-500"
            icon={({ type }: { type?: TypeOptions }) => {
                if (type === "success") {
                    return <CheckCircle2 className="size-5 text-emerald-500" />;
                }
                if (type === "error") {
                    return <XCircle className="size-5 text-red-500" />;
                }
                if (type === "warning") {
                    return <AlertTriangle className="size-5 text-amber-500" />;
                }
                if (type === "info") {
                    return <Info className="size-5 text-blue-500" />;
                }
                return <Info className="size-5 text-blue-500" />;
            }}
        />
    );
};

export default ToastProvider;

