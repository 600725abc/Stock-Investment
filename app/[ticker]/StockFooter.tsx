"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function StockFooter() {
    const { t } = useLanguage();

    return (
        <footer className="py-12 text-center text-zinc-400 text-sm border-t border-zinc-100 bg-white font-sans">
            &copy; {new Date().getFullYear()} InvestTrack. {t("footer.source")}
        </footer>
    );
}
