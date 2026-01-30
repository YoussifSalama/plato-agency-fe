"use client";

import LayoutTabsRouter from "@/shared/common/layout/LayoutTabsRouter";
import { settingsTabs } from "@/shared/core/layout/settings/tabs";
import clsx from "clsx";

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className={clsx("space-y-6")}>
            <LayoutTabsRouter tabs={settingsTabs} />
            {children}
        </div>
    );
};

export default SettingsLayout;

