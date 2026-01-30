"use client";

import { useParams } from "next/navigation";

const JobDetailsPage = () => {
    const params = useParams<{ id: string }>();
    return (
        <section className="rounded-md border border-blue-200 bg-white p-6 shadow-xl shadow-blue-200/60 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none">
            <h2 className="text-lg font-semibold text-blue-700 dark:text-slate-100">
                Job Details
            </h2>
            <p className="mt-2 text-sm text-blue-600 dark:text-slate-300">
                Job details for ID: {params?.id ?? "-"} will appear here.
            </p>
        </section>
    );
};

export default JobDetailsPage;

