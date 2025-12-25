"use client";

import { TrendingUp, Globe, Menu, X, Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";

interface SearchResult {
    symbol: string;
    name: string;
    exchange: string;
    type: string;
}

interface NavbarProps {
    showSearch?: boolean;
}

export default function Navbar({ showSearch = true }: NavbarProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { language, setLanguage, t } = useLanguage();

    // ... (keep useEffects same as before, just update styles in return)

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
            setQuery("");
            setMobileMenuOpen(false);
        }
    };

    const handleSelect = (symbol: string) => {
        router.push(`/${symbol}`);
        setIsOpen(false);
        setQuery("");
        setMobileMenuOpen(false);
    };

    const toggleLanguage = () => {
        setLanguage(language === "en" ? "zh" : "en");
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-100 dark:bg-slate-900/90 dark:border-slate-800 transition-colors">
            <div className="container-width h-16 flex items-center justify-between">
                {/* Brand */}
                <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white shadow-lg shadow-slate-900/20 dark:bg-slate-50 dark:text-slate-900">
                        <TrendingUp size={18} />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">InvestTrack</span>
                </Link>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-6">
                    <Link
                        href="/portfolio"
                        className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors dark:text-slate-400 dark:hover:text-slate-100"
                    >
                        {t("nav.portfolio")}
                    </Link>

                    {showSearch && (
                        <div ref={dropdownRef} className="relative">
                            <form onSubmit={handleSubmit} className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-slate-900 transition-colors" />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder={t("nav.search.placeholder")}
                                    onFocus={() => results.length > 0 && setIsOpen(true)}
                                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm w-[260px] focus:outline-none focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-50 transition-all placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:ring-slate-800 dark:focus:border-slate-600 dark:focus:bg-slate-900"
                                />
                            </form>
                            {/* Small result dropdown for navbar */}
                            {isOpen && results.length > 0 && (
                                <div className="absolute top-full right-0 mt-2 w-[320px] bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden z-50 py-1 dark:bg-slate-900 dark:border-slate-800 dark:shadow-slate-900/50">
                                    {results.map((result) => (
                                        <button
                                            key={result.symbol}
                                            onClick={() => handleSelect(result.symbol)}
                                            className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center justify-between dark:hover:bg-slate-800"
                                        >
                                            <div>
                                                <span className="font-bold text-slate-900 block text-sm dark:text-slate-100">{result.symbol}</span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400">{result.name}</span>
                                            </div>
                                            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded dark:bg-slate-800 dark:text-slate-400">{result.exchange}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="h-4 w-px bg-slate-200"></div>

                    <button
                        onClick={toggleLanguage}
                        className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors dark:text-slate-400 dark:hover:text-slate-100"
                    >
                        <Globe size={16} />
                        <span>{language === "en" ? "EN" : "中"}</span>
                    </button>

                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-700"></div>

                    <ThemeToggle />
                </div>

                {/* Mobile Icons */}
                <div className="flex items-center gap-4 md:hidden">
                    <button onClick={toggleLanguage} className="text-slate-600 dark:text-slate-400">
                        <Globe size={20} />
                    </button>
                    <ThemeToggle />
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-900">
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-slate-100 bg-white p-4 space-y-4 shadow-xl dark:bg-slate-900 dark:border-slate-800">
                    {showSearch && (
                        <form onSubmit={handleSubmit} className="relative">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={t("nav.search.placeholder")}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                            />
                            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white p-1.5 rounded-lg dark:bg-slate-700">
                                <Search size={14} />
                            </button>
                        </form>
                    )}
                    <Link
                        href="/portfolio"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full text-center py-3 font-semibold text-slate-700 bg-slate-50 rounded-xl dark:bg-slate-800 dark:text-slate-200"
                    >
                        {t("nav.portfolio")}
                    </Link>
                </div>
            )}
        </header>
    );
}
