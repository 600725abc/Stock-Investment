"use client";

import SearchBar from "./SearchBar";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function HomeSearch() {
    const { t } = useLanguage();

    return (
        <div className="w-full max-w-lg mx-auto">
            <SearchBar placeholder={t("home.search.placeholder")} />

            {/* Hint */}
            <p className="mt-4 text-sm text-slate-400 text-center font-medium dark:text-slate-500">
                {t("home.search.hint")}
            </p>
        </div>
    );
}
