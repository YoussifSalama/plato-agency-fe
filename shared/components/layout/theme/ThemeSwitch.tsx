"use client";

import clsx from "clsx";
import { SunMoon } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeSwitch() {
    const { resolvedTheme, setTheme } = useTheme();

    return (
        <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className={clsx("w-[26px] h-[26px]",
                "flex items-center justify-center transition-colors",
                "rounded-md shadow-md shadow-[#009ad5]/20",
                "border border-[#009ad5]/30",
                "bg-linear-to-r from-[#009ad5] to-[#005ca9] hover:from-[#009ad5] hover:to-[#005ca9]"
            )}
        >
            <SunMoon size={20} className="text-white" />
        </button>
    );
};