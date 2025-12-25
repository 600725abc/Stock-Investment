"use client";

import { TrendingUp, Plus, Minus } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface StockHeaderProps {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    currency?: string;
    stats: {
        marketCap: string;
        dayHigh: string;
        dayLow: string;
    };
}

export default function StockHeader({ symbol, name, price, change, changePercent, currency = "USD", stats }: StockHeaderProps) {
    const isPositive = change > 0;
    const isNegative = change < 0;
    const { t } = useLanguage();

    // Symbols for currencies
    const getCurrencySymbol = (curr: string) => {
        const symbols: Record<string, string> = {
            USD: "$", TWD: "NT$", HKD: "HK$", CNY: "¥", JPY: "¥", EUR: "€", GBP: "£", KRW: "₩"
        };
        return symbols[curr] || "$";
    };

    const currencySymbol = getCurrencySymbol(currency);
    const formattedPrice = price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Using neutral/brand color for the indicator, relying on icon for direction
    const ChangeIcon = isPositive ? Plus : (isNegative ? Minus : Minus);

    return (
        <section className="mb-8">
            <div className="fintech-card p-8 sm:p-10 mb-8">
                {/* Top Row: Meta information */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-slate-900">
                            <span className="font-bold text-xs">{currency}</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{symbol}</h1>
                            <p className="text-sm text-slate-500 font-medium">{name}</p>
                        </div>
                    </div>
                </div>

                {/* Hero Section: Price */}
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-4 sm:gap-6 mb-8">
                    <div className="flex items-start">
                        <span className="text-3xl font-medium text-slate-400 mr-1 mt-2">{currencySymbol}</span>
                        <span className="text-6xl sm:text-7xl font-bold text-slate-900 tracking-tighter">
                            {formattedPrice}
                        </span>
                    </div>

                    {/* Change Indicator - Visual pill, but clear typography */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                        <ChangeIcon size={16} className="text-slate-900" />
                        <span className="text-lg font-semibold text-slate-900">
                            {Math.abs(change).toFixed(2)}
                            <span className="ml-1.5 text-slate-500 font-medium text-base">
                                ({Math.abs(changePercent).toFixed(2)}%)
                            </span>
                        </span>
                    </div>
                </div>

                {/* Key Stats - Clean Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-slate-100">
                    <div>
                        <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">{t("stock.stats.marketCap")}</p>
                        <p className="text-lg font-semibold text-slate-700">{stats.marketCap}</p>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">{t("stock.stats.dayHigh")}</p>
                        <p className="text-lg font-semibold text-slate-700">{currencySymbol}{parseFloat(stats.dayHigh).toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">{t("stock.stats.dayLow")}</p>
                        <p className="text-lg font-semibold text-slate-700">{currencySymbol}{parseFloat(stats.dayLow).toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">{t("stock.stats.change")}</p>
                        {/* Neutral representation of change stat */}
                        <p className="text-lg font-semibold text-slate-700">
                            {change > 0 ? "+" : ""}{change.toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
