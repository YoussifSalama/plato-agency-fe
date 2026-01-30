import clsx from "clsx";
import {
    ChevronDown,
    LogOut,
    Menu,
    PanelLeftClose,
    PanelLeftOpen,
    Settings,
    User,
    WalletCards,
} from "lucide-react";
import Link from "next/link";
import useAgency from "@/shared/store/useAgency";
import useAuthStore from "@/shared/store/pages/auth/useAuthStore";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const getInitials = (name?: string | null) => {
    if (!name) return "AC";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "";
    const second = parts[1]?.[0] ?? parts[0]?.[1] ?? "";
    return `${first}${second}`.toUpperCase() || "AC";
};

const Navbar = ({
    onMenuClick,
    onToggleSidebar,
    isSidebarCollapsed,
}: {
    onMenuClick: () => void;
    onToggleSidebar: () => void;
    isSidebarCollapsed: boolean;
}) => {
    const { account } = useAgency();
    const { logout } = useAuthStore();
    const initials = getInitials(account?.name);
    return (
        <nav
            className={clsx(
                "flex items-center justify-between rounded-md border border-blue-200 bg-white px-4 py-2 shadow-sm shadow-blue-200/60",
                "dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-none"
            )}
        >
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={onMenuClick}
                    className={clsx(
                        "inline-flex items-center justify-center rounded-md border border-[#009ad5]/30 bg-[#009ad5]/10 p-2 text-[#005ca9] transition hover:bg-[#009ad5]/20",
                        "lg:hidden",
                        "dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-100 dark:hover:bg-slate-800"
                    )}
                    aria-label="Open sidebar menu"
                >
                    <Menu className="h-5 w-5" />
                </button>
                <button
                    type="button"
                    onClick={onToggleSidebar}
                    className={clsx(
                        "hidden items-center justify-center rounded-md border border-[#009ad5]/30 bg-[#009ad5]/10 p-2 text-[#005ca9] transition hover:bg-[#009ad5]/20 lg:inline-flex",
                        "dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-100 dark:hover:bg-slate-800"
                    )}
                    aria-label={isSidebarCollapsed ? "Open sidebar" : "Close sidebar"}
                >
                    {isSidebarCollapsed ? (
                        <PanelLeftOpen className="h-5 w-5" />
                    ) : (
                        <PanelLeftClose className="h-5 w-5" />
                    )}
                </button>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        className={clsx(
                            "ml-auto inline-flex items-center gap-3 rounded-full border border-[#009ad5]/30 bg-[#009ad5]/10 px-3 py-1.5 text-left transition hover:bg-[#009ad5]/20",
                            "dark:border-slate-700/60 dark:bg-slate-800/70 dark:hover:bg-slate-800"
                        )}
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-r from-[#009ad5] to-[#005ca9] text-sm font-semibold text-white">
                            {initials}
                        </span>
                        <span className="hidden flex-col text-left sm:flex">
                            <span className="text-sm font-semibold text-[#005ca9] dark:text-slate-100">
                                {account?.name ?? "Account"}
                            </span>
                            <span className="text-xs text-[#009ad5] dark:text-slate-400">
                                {account?.email ?? ""}
                            </span>
                        </span>
                        <ChevronDown className="h-4 w-4 text-[#009ad5] dark:text-slate-300" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                    <DropdownMenuLabel className="text-[#005ca9] dark:text-slate-100">
                        {account?.name ?? "Account"}
                        <div className="text-xs font-normal text-[#009ad5] dark:text-slate-400">
                            {account?.email ?? ""}
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/settings/account" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Profile Settings
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/billing" className="flex items-center gap-2">
                            <WalletCards className="h-4 w-4" />
                            Billing & Credits
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/settings" className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Settings
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={logout}
                        className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </nav>
    );
};

export default Navbar;