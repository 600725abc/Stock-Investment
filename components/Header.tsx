"use client";

import { Search, Star, Command } from "lucide-react";
import { useState, useEffect } from "react";
import SearchModal from "./SearchModal";

export default function Header() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsSearchOpen(true);
            }
            if (e.key === "/") {
                e.preventDefault();
                setIsSearchOpen(true);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <header className="flex items-center justify-between px-10 py-6">
            <button
                onClick={() => setIsSearchOpen(true)}
                className="relative group flex-1 max-w-xl text-left"
            >
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <Search className="w-5 h-5 group-hover:text-emerald-500 transition-colors" />
                </div>
                <div className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-3 pl-12 pr-12 text-sm text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-medium flex items-center">
                    Search stocks or type a ticker...
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-1.5 py-1 bg-slate-800 rounded-md border border-slate-700 text-[10px] font-bold text-slate-400">
                    <Command className="w-3 h-3" />
                    <span>K</span>
                </div>
            </button>

            <div className="flex items-center gap-4">
                <button className="p-3 bg-slate-900/50 border border-slate-800 rounded-2xl text-amber-400 hover:bg-slate-800 transition-colors group">
                    <Star className="w-5 h-5 group-hover:fill-amber-400 transition-all" />
                </button>

                <div className="flex items-center gap-3 ml-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 border-2 border-slate-900 shadow-xl" />
                </div>
            </div>

            <SearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
            />
        </header>
    );
}
