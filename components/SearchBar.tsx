"use client";

import { Search, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface SearchResult {
    symbol: string;
    name: string;
    exchange: string;
    type: string;
}

interface SearchBarProps {
    placeholder?: string;
    className?: string;
    onSelect?: (symbol: string) => void;
    autoFocus?: boolean;
}

export default function SearchBar({ placeholder, className = "", onSelect, autoFocus = false }: SearchBarProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
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
        if (query.trim().length < 1) {
            setResults([]);
            setIsOpen(false);
            setIsError(false);
            setActiveIndex(-1);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            setIsError(false);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            try {
                const response = await fetch(`/api/stock/search?q=${encodeURIComponent(query)}`, {
                    signal: controller.signal
                });
                if (!response.ok) throw new Error("Search failed");
                const data = await response.json();
                if (Array.isArray(data)) {
                    setResults(data);
                    setIsOpen(true);
                    setActiveIndex(-1);
                }
            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    console.error("Search error:", error);
                    setIsError(true);
                }
            } finally {
                clearTimeout(timeoutId);
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen || results.length === 0) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
                break;
            case "ArrowUp":
                e.preventDefault();
                setActiveIndex(prev => (prev > 0 ? prev - 1 : 0));
                break;
            case "Enter":
                e.preventDefault();
                if (activeIndex >= 0) {
                    handleSelect(results[activeIndex].symbol);
                } else if (query.trim()) {
                    handleSelect(query.toUpperCase());
                }
                break;
            case "Escape":
                setIsOpen(false);
                break;
        }
    };

    const handleSelect = (symbol: string) => {
        setIsOpen(false);
        setQuery("");
        if (onSelect) {
            onSelect(symbol);
        } else {
            router.push(`/${symbol}`);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            handleSelect(query.toUpperCase());
        }
    };

    return (
        <div ref={dropdownRef} className={`relative w-full ${className}`}>
            <form onSubmit={handleSubmit} className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors dark:text-slate-500 dark:group-focus-within:text-slate-100" size={20} />
                <input
                    type="text"
                    autoFocus={autoFocus}
                    placeholder={placeholder || t("home.search.placeholder")}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => results.length > 0 && setIsOpen(true)}
                    className="w-full pl-12 pr-12 py-4 text-lg bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-slate-50 focus:border-slate-300 transition-all dark:bg-slate-900 dark:text-white dark:border-slate-800 dark:focus:ring-slate-800 dark:focus:border-slate-700"
                />
                {isLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                    </div>
                )}
            </form>

            {isError && (
                <div className="absolute top-full mt-2 w-full bg-white border border-red-100 rounded-xl shadow-2xl p-4 text-center z-50 dark:bg-slate-900 dark:border-red-900/30">
                    <p className="text-sm text-red-500 font-medium">Failed to connect to server.</p>
                </div>
            )}

            {isOpen && results.length > 0 && !isError && (
                <div className="absolute top-full mt-2 w-full bg-white border border-slate-100 rounded-xl shadow-2xl overflow-hidden z-50 py-1 dark:bg-slate-900 dark:border-slate-800 dark:shadow-slate-950/50">
                    <div className="max-h-[320px] overflow-y-auto">
                        {results.map((result, index) => (
                            <button
                                key={result.symbol}
                                onClick={() => handleSelect(result.symbol)}
                                onMouseEnter={() => setActiveIndex(index)}
                                className={`w-full px-5 py-3 text-left transition-colors flex flex-col border-b border-slate-50 last:border-0 dark:border-slate-800 ${index === activeIndex
                                        ? "bg-slate-50 dark:bg-slate-800"
                                        : "hover:bg-slate-50 dark:hover:bg-slate-800"
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-0.5">
                                    <span className="font-bold text-slate-900 dark:text-slate-100">
                                        {result.name} ({result.symbol})
                                    </span>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                                        {result.exchange}
                                    </span>
                                </div>
                                <span className="text-xs text-slate-400 font-medium dark:text-slate-500 uppercase">
                                    {result.type}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
