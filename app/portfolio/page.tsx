"use client";

import Navbar from "@/components/Navbar";
import { getPortfolio, PortfolioPosition } from "@/lib/portfolio";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, TrendingUp, ChevronRight } from "lucide-react";

export default function PortfolioPage() {
    const [portfolio, setPortfolio] = useState<PortfolioPosition[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setPortfolio(getPortfolio());
        setIsLoading(false);

        const handleUpdate = () => setPortfolio(getPortfolio());
        window.addEventListener("portfolio-updated", handleUpdate);
        return () => window.removeEventListener("portfolio-updated", handleUpdate);
    }, []);

    if (isLoading) return null;

    return (
        <div className="flex flex-col min-h-screen bg-zinc-50/30">
            <Navbar />

            <main className="flex-1 w-full max-w-4xl mx-auto px-8 py-24">
                <div className="flex items-center gap-4 mb-10">
                    <div className="bg-black p-3 rounded-2xl text-white shadow-lg">
                        <Briefcase size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">Your Portfolio</h1>
                        <p className="text-zinc-500 font-medium">Tracking {portfolio.length} positions</p>
                    </div>
                </div>

                {portfolio.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-zinc-100 p-16 text-center shadow-sm">
                        <div className="bg-zinc-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <TrendingUp size={32} className="text-zinc-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Portfolio is Empty</h2>
                        <p className="text-zinc-500 mb-8 max-w-xs mx-auto">Start searching for stocks and add them to your position to track them here.</p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors"
                        >
                            Explore Market
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {portfolio.map((pos) => (
                            <Link
                                key={pos.symbol}
                                href={`/${pos.symbol}`}
                                className="group bg-white border border-zinc-100 p-6 rounded-2xl flex items-center justify-between hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-zinc-50 rounded-xl flex items-center justify-center text-xl font-black text-zinc-900 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                        {pos.symbol}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-zinc-900">{pos.symbol}</h3>
                                        <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">{pos.shares} Shares Held</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden md:block">
                                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Status</p>
                                        <div className="px-3 py-1 bg-zinc-50 rounded-full text-[10px] font-black uppercase text-zinc-500 border border-zinc-100">
                                            Active Position
                                        </div>
                                    </div>
                                    <ChevronRight className="text-zinc-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>

            <footer className="py-12 text-center text-zinc-400 text-sm font-sans">
                &copy; {new Date().getFullYear()} InvestTrack. Manage your holdings with ease.
            </footer>
        </div>
    );
}
