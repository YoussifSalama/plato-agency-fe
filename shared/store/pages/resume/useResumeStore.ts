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
    uploadStatus: "idle" | "uploading" | "completed" | "failed";
    uploadTotal: number;
    uploadUploaded: number;
    uploadFailed: number;
    lastUploadError: string | null;
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
    processResumes: (
        files: File[],
        jobId: number,
        callbacks?: {
            onComplete?: () => void;
            onFailed?: (message: string | null) => void;
        }
    ) => Promise<number>;
    resetUploadState: () => void;
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
        uploadStatus: "idle",
        uploadTotal: 0,
        uploadUploaded: 0,
        uploadFailed: 0,
        lastUploadError: null,
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
        processResumes: async (files: File[], jobId: number, callbacks) => {
            const { onComplete, onFailed } = callbacks ?? {};
            set({ loadingProcessResumes: true });
            try {
                const token = getToken();
                if (!token) {
                    return 401;
                }
                const chunkSize = 5;
                const concurrency = 6;
                const maxRetries = 3;
                const baseDelayMs = 500;
                set({
                    uploadStatus: "uploading",
                    uploadTotal: files.length,
                    uploadUploaded: 0,
                    uploadFailed: 0,
                    lastUploadError: null,
                });
                const chunks: File[][] = [];
                for (let i = 0; i < files.length; i += chunkSize) {
                    chunks.push(files.slice(i, i + chunkSize));
                }
                const uploadChunk = async (chunk: File[]) => {
                    const formData = new FormData();
                    chunk.forEach((file) => formData.append("resumes", file));
                    formData.append("job_id", String(jobId));
                    const response = await apiClient.post("/resume/process", formData, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    return response.status;
                };
                const sleep = (ms: number) =>
                    new Promise((resolve) => setTimeout(resolve, ms));
                const uploadWithRetry = async (chunk: File[]) => {
                    let attempt = 0;
                    while (attempt <= maxRetries) {
                        try {
                            const status = await uploadChunk(chunk);
                            if (status !== 201) {
                                throw new Error(`Upload failed with status ${status}`);
                            }
                            return true;
                        } catch (error) {
                            if (attempt === maxRetries) {
                                throw error;
                            }
                            const delay =
                                baseDelayMs * 2 ** attempt +
                                Math.floor(Math.random() * 150);
                            await sleep(delay);
                            attempt += 1;
                        }
                    }
                    return false;
                };
                const runQueue = async () => {
                    let failedCount = 0;
                    let lastErrorMessage: string | null = null;
                    let cursor = 0;
                    const workers = Array.from({ length: concurrency }, async () => {
                        while (cursor < chunks.length) {
                            const current = chunks[cursor];
                            cursor += 1;
                            try {
                                await uploadWithRetry(current);
                                set((state) => ({
                                    uploadUploaded: state.uploadUploaded + current.length,
                                }));
                            } catch (error) {
                                lastErrorMessage =
                                    (error as Error)?.message ??
                                    "Upload failed. Please retry.";
                                failedCount += current.length;
                                set((state) => ({
                                    uploadFailed: state.uploadFailed + current.length,
                                    lastUploadError: lastErrorMessage,
                                }));
                            }
                        }
                    });
                    await Promise.all(workers);
                    const finalStatus = failedCount > 0 ? "failed" : "completed";
                    set({
                        uploadStatus: finalStatus,
                        loadingProcessResumes: false,
                    });
                    if (finalStatus === "completed") {
                        onComplete?.();
                    } else {
                        onFailed?.(lastErrorMessage);
                    }
                };
                void runQueue();
                return 202;
            } finally {
                set((state) =>
                    state.uploadStatus === "uploading"
                        ? state
                        : { loadingProcessResumes: false }
                );
            }
        },
        resetUploadState: () =>
            set({
                uploadStatus: "idle",
                uploadTotal: 0,
                uploadUploaded: 0,
                uploadFailed: 0,
                lastUploadError: null,
            }),
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