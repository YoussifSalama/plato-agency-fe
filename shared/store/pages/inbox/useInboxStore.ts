import Cookies from "js-cookie";
import { create } from "zustand";
import { apiClient } from "@/lib/apiClient";
import { ACCESS_TOKEN_KEY } from "@/lib/authTokens";
import { errorToast, infoToast } from "@/shared/helper/toast";
import { resolveErrorMessage, resolveResponseMessage } from "@/shared/helper/apiMessages";
import type { IPaginationMeta } from "@/shared/store/pages/resume/useResumeStore";

export type InboxStatus = "unread" | "read" | "archived";
export type InboxType = "batch";

export type InboxItem = {
    id: number;
    type: InboxType;
    status: InboxStatus;
    severity: "info" | "warning" | "error";
    title: string;
    description?: string | null;
    created_at?: string;
    updated_at?: string;
    agency_id: number;
    job_id?: number | null;
    batch_id?: number | null;
    job?: { id: number; title: string } | null;
    batch?: {
        id: number;
        batch_id?: string | null;
        status?: string | null;
        ai_meta?: Record<string, unknown> | null;
    } | null;
};

type InboxSortOrder = "asc" | "desc";

interface IInboxStore {
    inboxes: InboxItem[];
    meta: IPaginationMeta | null;
    loadingInboxes: boolean;
    inboxActionLoading: number | null;
    getInboxes: (
        status: InboxStatus,
        sort_by: string,
        sort_order: InboxSortOrder,
        page: number,
        type?: InboxType | "",
        accessToken?: string | null
    ) => Promise<void>;
    archiveInbox: (id: number, accessToken?: string | null) => Promise<boolean>;
    unarchiveInbox: (id: number, accessToken?: string | null) => Promise<boolean>;
    markInboxRead: (id: number, accessToken?: string | null) => Promise<boolean>;
}

const getToken = (accessToken?: string | null) => {
    if (accessToken) return accessToken;
    return Cookies.get(ACCESS_TOKEN_KEY) ?? null;
};

const useInboxStore = create<IInboxStore>((set) => ({
    inboxes: [],
    meta: null,
    loadingInboxes: false,
    inboxActionLoading: null,
    getInboxes: async (status, sort_by, sort_order, page, type, accessToken) => {
        const token = getToken(accessToken);
        if (!token) return;
        set({ loadingInboxes: true });
        try {
            const params: Record<string, unknown> = {
                status,
                sort_by,
                sort_order,
                page,
                limit: 20,
            };
            if (type) {
                params.type = type;
            }
            const response = await apiClient.get("/agency/inbox", {
                headers: { Authorization: `Bearer ${token}` },
                params,
            });
            const inboxes = (response.data?.data ?? response.data ?? []) as InboxItem[];
            const meta = (response.data?.meta ?? null) as IPaginationMeta | null;
            set({ inboxes, meta });
        } catch {
            set({ inboxes: [], meta: null });
        } finally {
            set({ loadingInboxes: false });
        }
    },
    archiveInbox: async (id, accessToken) => {
        const token = getToken(accessToken);
        if (!token) return false;
        set({ inboxActionLoading: id });
        try {
            const response = await apiClient.patch(`/agency/inbox/${id}/archive`, null, {
                headers: { Authorization: `Bearer ${token}` },
            });
            infoToast(resolveResponseMessage(response, "Inbox archived."));
            return true;
        } catch (error) {
            errorToast(resolveErrorMessage(error, "Couldn't archive inbox."));
            return false;
        } finally {
            set({ inboxActionLoading: null });
        }
    },
    unarchiveInbox: async (id, accessToken) => {
        const token = getToken(accessToken);
        if (!token) return false;
        set({ inboxActionLoading: id });
        try {
            const response = await apiClient.patch(`/agency/inbox/${id}/unarchive`, null, {
                headers: { Authorization: `Bearer ${token}` },
            });
            infoToast(resolveResponseMessage(response, "Inbox restored."));
            return true;
        } catch (error) {
            errorToast(resolveErrorMessage(error, "Couldn't restore inbox."));
            return false;
        } finally {
            set({ inboxActionLoading: null });
        }
    },
    markInboxRead: async (id, accessToken) => {
        const token = getToken(accessToken);
        if (!token) return false;
        set({ inboxActionLoading: id });
        try {
            const response = await apiClient.patch(`/agency/inbox/${id}/read`, null, {
                headers: { Authorization: `Bearer ${token}` },
            });
            infoToast(resolveResponseMessage(response, "Inbox marked as read."));
            return true;
        } catch (error) {
            errorToast(resolveErrorMessage(error, "Couldn't mark inbox as read."));
            return false;
        } finally {
            set({ inboxActionLoading: null });
        }
    },
}));

export default useInboxStore;

