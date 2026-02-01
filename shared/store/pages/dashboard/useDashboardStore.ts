"use client";

import Cookies from "js-cookie";
import { create } from "zustand";
import { apiClient } from "@/lib/apiClient";
import { ACCESS_TOKEN_KEY } from "@/lib/authTokens";

export type DashboardTotals = {
    totalJobs: number;
    activeJobs: number;
    totalResumes: number;
    analyzedResumes: number;
    invitations: number;
    autoInvited: number;
    autoDenied: number;
    autoShortlisted: number;
};

export type DashboardTrendPoint = {
    date: string;
    analyzed: number;
    invited: number;
};

export type DashboardStats = {
    totals: DashboardTotals;
    trend: DashboardTrendPoint[];
};

interface DashboardStore {
    stats: DashboardStats | null;
    loading: boolean;
    getDashboard: (accessToken?: string | null) => Promise<DashboardStats | null>;
    clear: () => void;
}

const getToken = (accessToken?: string | null) => {
    if (accessToken) return accessToken;
    return Cookies.get(ACCESS_TOKEN_KEY) ?? null;
};

const useDashboardStore = create<DashboardStore>((set) => ({
    stats: null,
    loading: false,
    getDashboard: async (accessToken) => {
        const token = getToken(accessToken);
        if (!token) return null;
        set({ loading: true });
        try {
            const response = await apiClient.get("/agency/dashboard", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const stats = (response.data?.data ?? response.data) as DashboardStats;
            set({ stats });
            return stats;
        } catch {
            set({ stats: null });
            return null;
        } finally {
            set({ loading: false });
        }
    },
    clear: () => set({ stats: null, loading: false }),
}));

export default useDashboardStore;


