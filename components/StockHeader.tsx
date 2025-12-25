"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

interface StockHeaderProps {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    stats: {
        marketCap: string;
        dayHigh: string;
        dayLow: string;
    };
}

export default function StockHeader({ symbol, name, price, change, changePercent, stats }: StockHeaderProps) {
    const isPositive = change >= 0;

    return (
        <div className="bg-white rounded-xl border border-zinc-100 p-8 shadow-sm mb-6">
            <div className="flex flex-col mb-8">
                <div className="flex items-baseline gap-3 mb-1">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 uppercase">{symbol}</h1>
                    <span className="text-zinc-400 font-medium">{name}</span>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-5xl font-extrabold text-zinc-900">${price.toFixed(2)}</span>
                    <div className={`flex items-center gap-1.5 font-bold ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
                        {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                        <span>{isPositive ? "+" : ""}{change.toFixed(2)} ({isPositive ? "+" : ""}{changePercent.toFixed(2)}%)</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-6 border-t border-zinc-50">
                <div>
                    <p className="text-sm font-medium text-zinc-400 mb-1">Market Cap</p>
                    <p className="text-2xl font-bold text-zinc-900">{stats.marketCap}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-zinc-400 mb-1">Day High</p>
                    <p className="text-2xl font-bold text-zinc-900">${stats.dayHigh}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-zinc-400 mb-1">Day Low</p>
                    <p className="text-2xl font-bold text-zinc-900">${stats.dayLow}</p>
                </div>
            </div>
        </div>
    );
}
