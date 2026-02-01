"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";
import { useTheme } from "next-themes";

export const Toaster = (props: ToasterProps) => {
    const { resolvedTheme } = useTheme();
    return (
        <Sonner
            theme={resolvedTheme === "dark" ? "dark" : "light"}
            richColors
            closeButton
            {...props}
        />
    );
};


