"use client";

import { Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface SearchResult {
    symbol: string;
    name: string;
    exchange: string;
    type: string;
}

export default function HomeSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { t } = useLanguage();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (query.length < 1) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/stock/search?q=${encodeURIComponent(query)}`);
                const data = await response.json();
                if (Array.isArray(data)) {
                    setResults(data);
                    setIsOpen(true);
                }
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/${query.toUpperCase()}`);
            setIsOpen(false);
        }
    };

    const handleSelect = (symbol: string) => {
        router.push(`/${symbol}`);
        setIsOpen(false);
    };

    return (
        <div ref={dropdownRef} className="relative w-full max-w-lg mx-auto">
            <form onSubmit={handleSubmit} className="flex gap-3">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors dark:text-slate-500 dark:group-focus-within:text-slate-100" size={20} />
                    <input
                        type="text"
                        placeholder={t("home.search.placeholder")}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => results.length > 0 && setIsOpen(true)}
                        className="hero-input w-full pl-12 pr-4 py-4 text-lg bg-white shadow-sm dark:bg-slate-900 dark:text-white dark:shadow-slate-900/50 dark:border-slate-800"
                    />
                    {isLoading && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin dark:border-slate-700 dark:border-t-slate-200" />
                        </div>
                    )}
                </div>
                <button
                    type="submit"
                    className="btn-primary px-8 py-4 text-base font-semibold shadow-xl shadow-slate-900/10 dark:shadow-slate-900/20"
                >
                    {t("nav.search.button")}
                </button>
            </form>

            {/* Hint */}
            <p className="mt-3 text-sm text-slate-400 text-center font-medium dark:text-slate-500">
                {t("home.search.hint")}
            </p>

            {/* Results Dropdown - Floating Card */}
            {isOpen && results.length > 0 && (
                <div className="absolute top-full mt-3 w-full bg-white border border-slate-100 rounded-xl shadow-2xl overflow-hidden z-20 dark:bg-slate-900 dark:border-slate-800 dark:shadow-slate-950/50">
                    <div className="max-h-[320px] overflow-y-auto">
                        {results.map((result) => (
                            <button
                                key={result.symbol}
                                onClick={() => handleSelect(result.symbol)}
                                className="w-full px-5 py-4 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 group dark:hover:bg-slate-800 dark:border-slate-800"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-slate-900 text-lg group-hover:text-slate-700 dark:text-slate-100 dark:group-hover:text-slate-300">{result.symbol}</span>
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">{result.exchange}</span>
                                    </div>
                                    <span className="text-xs text-slate-400 font-medium dark:text-slate-500">{result.type}</span>
                                </div>
                                <p className="text-sm text-slate-500 truncate font-medium dark:text-slate-400">{result.name}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
