import Cookies from "js-cookie";
import { create } from "zustand";
import { apiClient } from "@/lib/apiClient";
import { ACCESS_TOKEN_KEY } from "@/lib/authTokens";
import { errorToast, successToast } from "@/shared/helper/toast";
import { resolveErrorMessage, resolveResponseMessage } from "@/shared/helper/apiMessages";

export type ResumeAnalysis = {
    score: number;
    recommendation: string;
    seniority_level?: string | null;
    insights?: {
        strengths?: string[];
        weaknesses?: string[];
        score_breakdown?: {
            role_fit_and_core_skills?: number;
            experience_impact?: number;
            performance_productivity?: number;
            retention_engagement_indicators?: number;
            leadership_collaboration?: number;
            education_certifications?: number;
            projects_initiative?: number;
        } | null;
        ai_insights?: {
            matched_job_titles?: string[];
            ai_thought?: string | null;
            suggested_next_roles?: string[];
        } | null;
    } | null;
} | null;

export type ResumeStructured = {
    name?: string | null;
    contact?: {
        email?: string | null;
        phone?: string | null;
        linkedin?: string | null;
        github?: string | null;
        portfolio?: string | null;
    };
    location?: {
        city?: string | null;
        country?: string | null;
    };
    current_title?: string | null;
    total_experience_years?: number | null;
    education?: Array<{
        degree?: string | null;
        institution?: string | null;
        year?: number | null;
    }>;
    experience?: Array<{
        title?: string | null;
        company?: string | null;
        start_year?: number | null;
        end_year?: number | "Present" | null;
        highlights?: string[];
    }>;
    skills?: string[];
    tools?: string[];
    certifications?: Array<{
        name?: string | null;
        issuer?: string | null;
        year?: number | null;
    }>;
    languages?: string[];
    projects?: Array<{
        name?: string | null;
        description?: string | null;
        tech?: string[];
    }>;
};

export type ResumeDetails = {
    id: number;
    name: string;
    link: string;
    created_at: string;
    auto_denied?: boolean;
    auto_shortlisted?: boolean;
    auto_invited?: boolean;
    resume_structured?: { data?: ResumeStructured | null } | null;
    resume_analysis?: ResumeAnalysis;
};

interface ResumeDetailsStore {
    resume: ResumeDetails | null;
    loading: boolean;
    error: string | null;
    actionLoading: "deny" | "shortlist" | "invite" | null;
    getResume: (id: number | string) => Promise<void>;
    denyResume: (id: number | string, value: boolean) => Promise<void>;
    shortlistResume: (id: number | string, value: boolean) => Promise<void>;
    inviteResume: (id: number | string) => Promise<void>;
    clear: () => void;
}

const getToken = () => {
    if (typeof window === "undefined") return null;
    return Cookies.get(ACCESS_TOKEN_KEY) ?? null;
};
export const useResumeDetailsStore = create<ResumeDetailsStore>((set) => ({
    resume: null,
    loading: false,
    error: null,
    actionLoading: null,
    getResume: async (id: number | string) => {
        const rawId = typeof id === "string" ? id.trim() : id;
        const parsedId =
            typeof rawId === "string" ? Number.parseInt(rawId, 10) : rawId;
        const requestId = Number.isFinite(parsedId) ? parsedId : rawId;
        set({ loading: true, error: null });
        try {
            const token = getToken();
            if (!token) {
                set({ resume: null, loading: false, error: "Unauthorized" });
                return;
            }
            const response = await apiClient.get(`/resume/single/${requestId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            set({ resume: response.data?.data ?? null, loading: false });
        } catch {
            set({
                resume: null,
                loading: false,
                error: Number.isFinite(parsedId)
                    ? "Resume not found"
                    : "Invalid resume id",
            });
        }
    },
    denyResume: async (id: number | string, value: boolean) => {
        const token = getToken();
        if (!token) return;
        const requestId = typeof id === "string" ? id.trim() : id;
        set({ actionLoading: "deny" });
        try {
            const response = await apiClient.patch(
                `/resume/${requestId}/deny`,
                { auto_denied: value },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const updated = response.data?.data ?? null;
            if (updated) {
                set((state) => ({
                    resume: state.resume ? { ...state.resume, ...updated } : state.resume,
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
    shortlistResume: async (id: number | string, value: boolean) => {
        const token = getToken();
        if (!token) return;
        const requestId = typeof id === "string" ? id.trim() : id;
        set({ actionLoading: "shortlist" });
        try {
            const response = await apiClient.patch(
                `/resume/${requestId}/shortlist`,
                { auto_shortlisted: value },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const updated = response.data?.data ?? null;
            if (updated) {
                set((state) => ({
                    resume: state.resume ? { ...state.resume, ...updated } : state.resume,
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
    inviteResume: async (id: number | string) => {
        const token = getToken();
        if (!token) return;
        const requestId = typeof id === "string" ? id.trim() : id;
        set({ actionLoading: "invite" });
        try {
            const response = await apiClient.post(
                `/resume/${requestId}/invite`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const updated = response.data?.data ?? null;
            if (updated) {
                set((state) => ({
                    resume: state.resume ? { ...state.resume, ...updated } : state.resume,
                }));
            }
            successToast(resolveResponseMessage(response, "Invitation sent successfully."));
        } catch (error) {
            errorToast(resolveErrorMessage(error, "Failed to send invitation."));
        } finally {
            set({ actionLoading: null });
        }
    },
    clear: () => set({ resume: null, loading: false, error: null }),
}));

