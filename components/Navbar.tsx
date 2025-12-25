"use client";

import { TrendingUp, Search } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
    const [ticker, setTicker] = useState("");
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (ticker.trim()) {
            router.push(`/${ticker.toUpperCase()}`);
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-white border-b border-zinc-100 shadow-sm">
            <Link href="/" className="flex items-center gap-2">
                <div className="bg-black p-1.5 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-zinc-900">InvestTrack</span>
            </Link>

            <div className="flex items-center gap-6">
                <Link href="/portfolio" className="text-sm font-medium text-zinc-500 hover:text-black transition-colors">
                    Portfolio
                </Link>
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Enter ticker (e.g., AAPL)"
                            value={ticker}
                            onChange={(e) => setTicker(e.target.value)}
                            className="w-[200px] md:w-[300px] px-4 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                        <Search size={16} />
                        <span className="hidden md:inline">Search</span>
                    </button>
                </form>
            </div>
        </nav>
    );
}
