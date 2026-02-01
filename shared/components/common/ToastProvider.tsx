"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";
import { ACCESS_TOKEN_KEY } from "@/lib/authTokens";
import { apiClient } from "@/lib/apiClient";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

const ToastProvider = () => {
    const router = useRouter();
    const socketRef = useRef<Socket | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const playNotificationSound = async () => {
        if (typeof window === "undefined") return;
        if (!audioRef.current) {
            audioRef.current = new Audio("/sounds/smooth-completed-notify-starting-alert-274739.mp3");
        }
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
    };

    useEffect(() => {
        const token = Cookies.get(ACCESS_TOKEN_KEY);
        if (!token) return;

        let isActive = true;

        const connectSocket = async () => {
            try {
                const response = await apiClient.get("/agency/inbox/agency", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const agencyId =
                    response.data?.data?.agency_id ?? response.data?.agency_id;
                const baseUrl = process.env.NEXT_PUBLIC_AGENCY_API_URL;
                if (!agencyId || !baseUrl || !isActive) return;

                const socket = io(`${baseUrl}/agency`, {
                    transports: ["websocket"],
                });
                socketRef.current = socket;
                socket.emit("inbox.join", { agencyId });
                socket.on("inbox.created", (payload: Record<string, unknown>) => {
                    const title = (payload.title as string) ?? "New inbox item";
                    const description =
                        (payload.description as string) ??
                        "A new inbox item is available.";
                    if (typeof window !== "undefined") {
                        window.dispatchEvent(
                            new CustomEvent("inbox:created", { detail: payload })
                        );
                    }
                    playNotificationSound().catch(() => {
                        // ignore audio playback errors (autoplay restrictions)
                    });
                    toast(title, {
                        description,
                        action: {
                            label: "Open inbox",
                            onClick: () => router.push("/inbox"),
                        },
                    });
                });
            } catch {
                // ignore connection failures
            }
        };

        connectSocket();

        return () => {
            isActive = false;
            socketRef.current?.disconnect();
            socketRef.current = null;
        };
    }, [router]);

    return <Toaster />;
};

export default ToastProvider;

