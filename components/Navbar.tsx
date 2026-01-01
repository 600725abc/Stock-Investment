"use client";

import { TrendingUp, Globe, Menu, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import SearchBar from "@/components/SearchBar";

interface NavbarProps {
    showSearch?: boolean;
}

export default function Navbar({ showSearch = true }: NavbarProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const router = useRouter();
    const { language, setLanguage, t } = useLanguage();

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
                        <SearchBar
                            className="w-[300px]"
                            placeholder={t("nav.search.placeholder")}
                        />
                    )}

                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-700"></div>

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
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-900 dark:text-slate-100">
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-slate-100 bg-white p-4 space-y-4 shadow-xl dark:bg-slate-900 dark:border-slate-800">
                    {showSearch && (
                        <SearchBar
                            autoFocus
                            placeholder={t("nav.search.placeholder")}
                            onSelect={(symbol) => {
                                setMobileMenuOpen(false);
                                router.push(`/${symbol}`);
                            }}
                        />
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
