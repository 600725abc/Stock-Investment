"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

interface NewsItem {
    id: string;
    title: string;
    summary?: string;
    source: string;
    timeAgo: string;
    url?: string;
}

interface NewsListProps {
    news: NewsItem[];
}

export default function NewsList({ news }: NewsListProps) {
    const { t } = useLanguage();

    if (!news || news.length === 0) {
        return (
            <div className="fintech-card p-6 sm:p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Related News</h3>
                <p className="text-slate-400 italic">No news available at the moment.</p>
            </div>
        );
    }

    return (
        <div className="fintech-card p-6 sm:p-10 mb-12">
            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4 dark:border-slate-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Related News</h3>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Press & Media</span>
            </div>

            <div className="flex flex-col gap-10">
                {news.map((item) => (
                    <article key={item.id} className="group flex flex-col items-start gap-3">
                        {/* Meta Top Line */}
                        <div className="flex items-center gap-3 text-xs font-medium text-slate-400 dark:text-slate-500">
                            <span className="text-slate-900 font-bold uppercase tracking-wide dark:text-slate-200">{item.source}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                            <span>{item.timeAgo}</span>
                        </div>

                        {/* Title */}
                        {/* Title */}
                        <a
                            href={item.url || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-slate-600 transition-colors leading-snug dark:text-slate-100 dark:group-hover:text-slate-300"
                        >
                            {item.title}
                        </a>

                        {/* Summary */}
                        {item.summary && item.summary !== item.title && (
                            <p className="text-slate-500 text-sm sm:text-base leading-relaxed line-clamp-2 max-w-3xl dark:text-slate-400">
                                {item.summary}
                            </p>
                        )}

                        {/* Read More Link (Subtle) */}
                        <div className="mt-1">
                            <a href={item.url || "#"} target="_blank" className="text-sm font-semibold text-slate-900 hover:text-slate-600 border-b border-slate-200 hover:border-slate-400 transition-all pb-0.5 dark:text-slate-200 dark:hover:text-white dark:border-slate-700 dark:hover:border-slate-500">
                                Read full story
                            </a>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
