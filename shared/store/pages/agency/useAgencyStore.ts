"use client";

import Cookies from "js-cookie";
import { create } from "zustand";
import { apiClient } from "@/lib/apiClient";
import { ACCESS_TOKEN_KEY } from "@/lib/authTokens";
import { errorToast, successToast } from "@/shared/helper/toast";
import { resolveErrorMessage, resolveResponseMessage } from "@/shared/helper/apiMessages";

type AgencyOverview = {
    isComplete: boolean;
    agency: {
        company_name?: string | null;
        organization_url?: string | null;
        company_size?: string | null;
        company_industry?: string | null;
        company_description?: string | null;
    } | null;
};

type UpdateAgencyPayload = {
    company_name: string;
    organization_url: string;
    company_size: string;
    company_industry: string;
    company_description?: string;
};

interface IAgencyStore {
    loadingOverview: boolean;
    loadingUpdateAgency: boolean;
    getOverview: (accessToken?: string | null) => Promise<AgencyOverview | null>;
    updateAgency: (
        payload: UpdateAgencyPayload,
        accessToken?: string | null
    ) => Promise<boolean>;
}

const getToken = (accessToken?: string | null) => {
    if (accessToken) return accessToken;
    if (typeof window === "undefined") return null;
    return Cookies.get(ACCESS_TOKEN_KEY) ?? null;
};

const useAgencyStore = create<IAgencyStore>((set) => ({
    loadingOverview: false,
    loadingUpdateAgency: false,
    getOverview: async (accessToken) => {
        const token = getToken(accessToken);
        if (!token) return null;
        set({ loadingOverview: true });
        try {
            const response = await apiClient.get("/agency/overview", {
                headers: { Authorization: `Bearer ${token}` },
            });
            return (response.data?.data ?? response.data) as AgencyOverview;
        } catch {
            return null;
        } finally {
            set({ loadingOverview: false });
        }
    },
    updateAgency: async (payload, accessToken) => {
        const token = getToken(accessToken);
        if (!token) return false;
        set({ loadingUpdateAgency: true });
        try {
            const response = await apiClient.patch("/agency/agency", payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            successToast(
                resolveResponseMessage(
                    response,
                    "Agency details saved. Your agency history is up to date."
                )
            );
            return true;
        } catch (error) {
            errorToast(
                resolveErrorMessage(error, "Couldn't save your agency details.")
            );
            return false;
        } finally {
            set({ loadingUpdateAgency: false });
        }
    },
}));

export default useAgencyStore;

