"use client";

import {
    Home,
    BarChart2,
    Briefcase,
    Newspaper,
    Settings,
    Star,
    Circle
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getPortfolio } from "@/lib/portfolio";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const navItems = [
    { icon: Home, label: "Dashboard", href: "/" },
    { icon: BarChart2, label: "Market", href: "/market" },
    { icon: Briefcase, label: "Portfolio", href: "/portfolio" },
    { icon: Newspaper, label: "News", href: "/news" },
    { icon: Settings, label: "Settings", href: "/settings" },
];

const watchlist = [
    { symbol: "AAPL", color: "text-blue-400" },
    { symbol: "TSLA", color: "text-red-400" },
    { symbol: "MSFT", color: "text-green-400" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [portfolioCount, setPortfolioCount] = useState(0);

    useEffect(() => {
        const updateCount = () => {
            setPortfolioCount(getPortfolio().length);
        };
        updateCount();
        window.addEventListener("portfolio-updated", updateCount);
        window.addEventListener("storage", updateCount);
        return () => {
            window.removeEventListener("portfolio-updated", updateCount);
            window.removeEventListener("storage", updateCount);
        };
    }, []);

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-950 border-r border-slate-900 flex flex-col p-6 z-50">
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="bg-emerald-500/10 p-2 rounded-lg">
                    <Home className="w-6 h-6 text-emerald-500" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">InvestTrack</span>
            </div>

            <nav className="flex-1 flex flex-col gap-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-emerald-500/10 text-emerald-500"
                                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </div>
                            {item.label === "Portfolio" && portfolioCount > 0 && (
                                <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-md min-w-[20px] text-center">
                                    {portfolioCount}
                                </span>
                            )}
                        </Link>
                    );
                })}

                <div className="mt-10 mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Watchlist
                </div>
                {watchlist.map((item) => (
                    <Link
                        key={item.symbol}
                        href={`/${item.symbol}`}
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            {item.symbol}
                        </div>
                        <Circle className={cn("w-2 h-2 fill-current", item.color)} />
                    </Link>
                ))}
            </nav>

            <div className="mt-auto px-3 py-4 bg-slate-900/50 rounded-xl border border-slate-800/50">
                <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500">Market Status</span>
                    <div className="flex items-center gap-1.5 text-emerald-500 font-bold">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Open
                    </div>
                </div>
            </div>
        </aside>
    );
}
