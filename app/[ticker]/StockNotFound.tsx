"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

interface StockNotFoundProps {
    ticker: string;
}

export default function StockNotFound({ ticker }: StockNotFoundProps) {
    const { t } = useLanguage();

    return (
        <main className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="bg-white p-12 rounded-3xl border border-zinc-100 shadow-sm text-center max-w-md">
                <h1 className="text-2xl font-bold text-zinc-900 mb-2">{t("stock.notFound.title")}</h1>
                <p className="text-zinc-500 mb-6">
                    {t("stock.notFound.message")} ({ticker.toUpperCase()})
                </p>
                <a href="/" className="inline-block px-6 py-2 bg-black text-white rounded-lg font-bold">
                    {t("stock.notFound.back")}
                </a>
            </div>
        </main>
    );
}
