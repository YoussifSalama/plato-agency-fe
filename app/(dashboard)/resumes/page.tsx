import ResumeClient from "@/shared/components/pages/resume/all/ResumeClient";
import clsx from "clsx";

const AllResumesPage = () => {
    return (
        <div
            className={clsx(
                "rounded-md border border-blue-200 bg-white p-4 shadow-xl shadow-blue-200/60",
                "dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none"
            )}
        >
            <ResumeClient />
        </div>
    );
};

export default AllResumesPage;

