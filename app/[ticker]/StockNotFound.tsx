"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface StockNotFoundProps {
    ticker: string;
    isApiError?: boolean;
}

export default function StockNotFound({ ticker, isApiError = false }: StockNotFoundProps) {
    const { t } = useLanguage();
    const router = useRouter();
    const [isRetrying, setIsRetrying] = useState(false);

    const handleRetry = async () => {
        setIsRetrying(true);
        // Force a hard reload to bypass any stale cache
        router.refresh();
        setTimeout(() => {
            setIsRetrying(false);
        }, 2000);
    };

    if (isApiError) {
        return (
            <main className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="bg-white p-12 rounded-3xl border border-orange-100 shadow-sm text-center max-w-md dark:bg-slate-900 dark:border-orange-900/30">
                    <div className="text-5xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2 dark:text-slate-100">數據載入失敗</h1>
                    <p className="text-slate-500 mb-6 dark:text-slate-400">
                        無法從伺服器取得 <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{ticker.toUpperCase()}</span> 的即時資料。<br />
                        這可能是暫時性的網路問題或 API 限制。
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={handleRetry}
                            disabled={isRetrying}
                            className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-700 dark:hover:bg-slate-600"
                        >
                            {isRetrying ? "重新載入中..." : "重試"}
                        </button>
                        <a
                            href="/"
                            className="inline-block px-6 py-2 bg-slate-100 text-slate-900 rounded-lg font-bold hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                        >
                            返回搜尋
                        </a>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="bg-white p-12 rounded-3xl border border-zinc-100 shadow-sm text-center max-w-md dark:bg-slate-900 dark:border-slate-800">
                <div className="text-5xl mb-4">🔍</div>
                <h1 className="text-2xl font-bold text-zinc-900 mb-2 dark:text-zinc-100">{t("stock.notFound.title")}</h1>
                <p className="text-zinc-500 mb-6 dark:text-zinc-400">
                    {t("stock.notFound.message")} ({ticker.toUpperCase()})
                </p>
                <a href="/" className="inline-block px-6 py-2 bg-black text-white rounded-lg font-bold hover:bg-slate-800 dark:bg-slate-700">
                    {t("stock.notFound.back")}
                </a>
            </div>
        </main>
    );
}
