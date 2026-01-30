import { Suspense } from "react";
import JobWatchForm from "@/shared/components/pages/job/JobWatchForm";

const JobWatchPage = () => {
    return (
        <Suspense fallback={null}>
            <JobWatchForm />
        </Suspense>
    );
};

export default JobWatchPage;

