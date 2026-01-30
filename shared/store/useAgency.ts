"use client";

import Cookies from "js-cookie";
import { create } from "zustand";
import { apiClient } from "@/lib/apiClient";
import { ACCESS_TOKEN_KEY } from "@/lib/authTokens";
import { errorToast, successToast } from "@/shared/helper/toast";
import { resolveErrorMessage, resolveResponseMessage } from "@/shared/helper/apiMessages";

type AgencyAccountData = {
    email: string;
    f_name: string;
    l_name: string;
    user_name: string;
    name?: string;
};

type UpdateAccountPayload = {
    f_name?: string;
    l_name?: string;
    user_name?: string;
};

interface IAgencyStore {
    account: AgencyAccountData | null;
    loadingAccount: boolean;
    loadingUpdateBrand: boolean;
    loadingChangePassword: boolean;
    getMyAgencyAccountData: (accessToken?: string | null) => Promise<AgencyAccountData | null>;
    updateBrand: (
        payload: UpdateAccountPayload,
        accessToken?: string | null
    ) => Promise<boolean>;
    changePassword: (
        payload: { oldPassword: string; newPassword: string },
        accessToken?: string | null
    ) => Promise<boolean>;
    setAccount: (account: AgencyAccountData | null) => void;
}

const getToken = (accessToken?: string | null) => {
    if (accessToken) return accessToken;
    return Cookies.get(ACCESS_TOKEN_KEY) ?? null;
};

const useAgency = create<IAgencyStore>((set) => ({
    account: null,
    loadingAccount: false,
    loadingUpdateBrand: false,
    loadingChangePassword: false,
    setAccount: (account) => set({ account }),
    getMyAgencyAccountData: async (accessToken) => {
        const token = getToken(accessToken);
        if (!token) return null;
        set({ loadingAccount: true });
        try {
            const response = await apiClient.get("/agency/account/me", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = (response.data?.data ?? response.data) as AgencyAccountData;
            set({
                account: {
                    email: data.email ?? "",
                    f_name: data.f_name ?? "",
                    l_name: data.l_name ?? "",
                    user_name: data.user_name ?? "",
                    name: data.name,
                },
            });
            return data;
        } catch {
            set({ account: null });
            return null;
        } finally {
            set({ loadingAccount: false });
        }
    },
    updateBrand: async (payload, accessToken) => {
        const token = getToken(accessToken);
        if (!token) return false;
        set({ loadingUpdateBrand: true });
        try {
            const response = await apiClient.patch("/agency/brand", payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = response.data?.data ?? response.data;
            if (data?.email) {
                const name = `${data.f_name ?? ""} ${data.l_name ?? ""}`.trim();
                set({
                    account: {
                        email: data.email ?? "",
                        f_name: data.f_name ?? "",
                        l_name: data.l_name ?? "",
                        user_name: data.user_name ?? "",
                        name: name || (data.email ?? ""),
                    },
                });
            }
            successToast(
                resolveResponseMessage(
                    response,
                    "Profile saved. Your data is up to date."
                )
            );
            return true;
        } catch (error) {
            errorToast(resolveErrorMessage(error, "Couldn't save your profile data."));
            return false;
        } finally {
            set({ loadingUpdateBrand: false });
        }
    },
    changePassword: async (payload, accessToken) => {
        const token = getToken(accessToken);
        if (!token) return false;
        set({ loadingChangePassword: true });
        try {
            const response = await apiClient.patch("/agency/password", payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            successToast(
                resolveResponseMessage(response, "Password saved successfully.")
            );
            return true;
        } catch (error) {
            errorToast(resolveErrorMessage(error, "Couldn't save your password."));
            return false;
        } finally {
            set({ loadingChangePassword: false });
        }
    },
}));

export default useAgency;

