import Cookies from "js-cookie";
import { create } from "zustand";
import { apiClient } from "@/lib/apiClient";
import { ACCESS_TOKEN_KEY } from "@/lib/authTokens";
import { errorToast, successToast } from "@/shared/helper/toast";
import { resolveErrorMessage, resolveResponseMessage } from "@/shared/helper/apiMessages";

export interface IResume {
    id: string;
    name: string;
    file_type: string;
    link: string;
    created_at: string;
    updated_at: string;
    auto_invited?: boolean;
    auto_shortlisted?: boolean;
    auto_denied?: boolean;
    resume_analysis?: {
        score: number;
        recommendation: string;
    } | null;
    structured_name?: string | null;
    structured_email?: string | null;
}
export interface IPaginationMeta {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    current_page: number;
    next_page: number | null;
    previous_page: number | null;
    has_next_page: boolean;
    has_previous_page: boolean;
    is_first_page: boolean;
    is_last_page: boolean;
}
interface IresumeStore {
    resumes: IResume[];
    meta: IPaginationMeta | null;
    loadingGetResumes: boolean;
    hasLoadedResumes: boolean;
    loadingProcessResumes: boolean;
    actionLoading: { id: string | number; type: "deny" | "shortlist" | "invite" } | null;
    getResumes: (
        partial_matching: string,
        sort_by: string,
        sort_order: string,
        page: number,
        recommendation?: string | null,
        score?: string | number | null,
        jobId?: number | null,
        autoInvited?: boolean | null,
        autoShortlisted?: boolean | null,
        autoDenied?: boolean | null
    ) => Promise<void>;
    processResumes: (files: File[], jobId: number) => Promise<number>;
    denyResume: (id: string | number, value: boolean) => Promise<void>;
    shortlistResume: (id: string | number, value: boolean) => Promise<void>;
    inviteResume: (id: string | number) => Promise<void>;
}

const getToken = () => {
    if (typeof window === "undefined") return null;
    return Cookies.get(ACCESS_TOKEN_KEY) ?? null;
};

export const useResumeStore = create<IresumeStore>((set) => {
    return {
        resumes: [],
        meta: null,
        loadingGetResumes: false,
        hasLoadedResumes: false,
        loadingProcessResumes: false,
        actionLoading: null,
        getResumes: async (
            partial_matching: string,
            sort_by: string,
            sort_order: string,
            page: number,
            recommendation?: string | null,
            score?: string | number | null,
            jobId?: number | null,
            autoInvited?: boolean | null,
            autoShortlisted?: boolean | null,
            autoDenied?: boolean | null,
        ) => {
            set({ loadingGetResumes: true });
            const params: Record<string, unknown> = {
                partial_matching,
                sort_by,
                sort_order,
                page,
                limit: 15,
            };

            if (recommendation) {
                params.recommendation = recommendation;
            }
            const scoreValue =
                typeof score === "string"
                    ? score.trim() === ""
                        ? null
                        : Number(score)
                    : score;
            if (typeof scoreValue === "number" && !Number.isNaN(scoreValue)) {
                params.score = scoreValue;
            }
            if (typeof jobId === "number" && !Number.isNaN(jobId)) {
                params.job_id = jobId;
            }
            if (typeof autoInvited === "boolean") {
                params.auto_invited = autoInvited;
            }
            if (typeof autoShortlisted === "boolean") {
                params.auto_shortlisted = autoShortlisted;
            }
            if (typeof autoDenied === "boolean") {
                params.auto_denied = autoDenied;
            }
            const token = getToken();
            if (!token) {
                set({ loadingGetResumes: false });
                return;
            }
            const response = await apiClient.get("/resume", {
                headers: { Authorization: `Bearer ${token}` },
                params,
            });
            const resumes = response.data?.data ?? [];
            const meta = response.data?.meta ?? null;
            set({ resumes, meta, loadingGetResumes: false, hasLoadedResumes: true });
        },
        processResumes: async (files: File[], jobId: number) => {
            set({ loadingProcessResumes: true });
            try {
                const formData = new FormData();
                files.forEach((file) => formData.append("resumes", file));
                formData.append("job_id", String(jobId));
                const token = getToken();
                if (!token) {
                    return 401;
                }
                const response = await apiClient.post("/resume/process", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                    },
                });
                return response.status;
            } finally {
                set({ loadingProcessResumes: false });
            }
        },
        denyResume: async (id, value) => {
            const token = getToken();
            if (!token) return;
            set({ actionLoading: { id, type: "deny" } });
            try {
                const response = await apiClient.patch(
                    `/resume/${id}/deny`,
                    { auto_denied: value },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const updated = response.data?.data ?? null;
                if (updated) {
                    set((state) => ({
                        resumes: state.resumes.map((resume) =>
                            String(resume.id) === String(updated.id)
                                ? { ...resume, ...updated }
                                : resume
                        ),
                    }));
                }
                successToast(
                    resolveResponseMessage(
                        response,
                        value ? "Resume denied successfully." : "Resume denial removed successfully."
                    )
                );
            } catch (error) {
                errorToast(resolveErrorMessage(error, "Failed to update resume."));
            } finally {
                set({ actionLoading: null });
            }
        },
        shortlistResume: async (id, value) => {
            const token = getToken();
            if (!token) return;
            set({ actionLoading: { id, type: "shortlist" } });
            try {
                const response = await apiClient.patch(
                    `/resume/${id}/shortlist`,
                    { auto_shortlisted: value },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const updated = response.data?.data ?? null;
                if (updated) {
                    set((state) => ({
                        resumes: state.resumes.map((resume) =>
                            String(resume.id) === String(updated.id)
                                ? { ...resume, ...updated }
                                : resume
                        ),
                    }));
                }
                successToast(
                    resolveResponseMessage(
                        response,
                        value ? "Resume shortlisted successfully." : "Resume removed from shortlist successfully."
                    )
                );
            } catch (error) {
                errorToast(resolveErrorMessage(error, "Failed to update resume."));
            } finally {
                set({ actionLoading: null });
            }
        },
        inviteResume: async (id) => {
            const token = getToken();
            if (!token) return;
            set({ actionLoading: { id, type: "invite" } });
            try {
                const response = await apiClient.post(
                    `/resume/${id}/invite`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const updated = response.data?.data ?? null;
                if (updated) {
                    set((state) => ({
                        resumes: state.resumes.map((resume) =>
                            String(resume.id) === String(updated.id)
                                ? { ...resume, ...updated }
                                : resume
                        ),
                    }));
                }
                successToast(resolveResponseMessage(response, "Invitation sent successfully."));
            } catch (error) {
                errorToast(resolveErrorMessage(error, "Failed to send invitation."));
            } finally {
                set({ actionLoading: null });
            }
        },
    }
})