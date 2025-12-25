"use client";

import { Clock } from "lucide-react";

interface NewsItem {
    id: string;
    title: string;
    summary: string;
    source: string;
    timeAgo: string;
    url: string;
}

interface NewsListProps {
    news: NewsItem[];
}

export default function NewsList({ news }: NewsListProps) {
    return (
        <div className="bg-white rounded-xl border border-zinc-100 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-zinc-900 mb-8">Latest News</h2>

            <div className="flex flex-col gap-8">
                {news.map((item, index) => (
                    <div key={item.id} className={`flex flex-col gap-3 ${index !== news.length - 1 ? "pb-8 border-b border-zinc-50" : ""}`}>
                        <a
                            href={item.url}
                            target="_blank"
                            className="text-lg font-bold text-zinc-900 hover:text-emerald-500 transition-colors leading-snug"
                        >
                            {item.title}
                        </a>

                        <p className="text-zinc-500 leading-relaxed text-sm">
                            {item.summary}
                        </p>

                        <div className="flex items-center gap-4 text-xs font-semibold text-zinc-400">
                            <span className="uppercase tracking-wider">{item.source}</span>
                            <div className="flex items-center gap-1">
                                <Clock size={12} />
                                <span>{item.timeAgo}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
