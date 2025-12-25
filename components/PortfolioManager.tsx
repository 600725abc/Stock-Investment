"use client";

import React, { useState, useEffect } from "react";
import { Briefcase, Plus, Minus, Check, Edit2 } from "lucide-react";
import { getShares, updateShares } from "@/lib/portfolio";

interface PortfolioManagerProps {
    symbol: string;
    currentPrice: number;
}

export default function PortfolioManager({ symbol, currentPrice }: PortfolioManagerProps) {
    const [shares, setShares] = useState<number>(0);
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        setShares(getShares(symbol));
    }, [symbol]);

    const handleSave = () => {
        const numValue = parseFloat(inputValue);
        if (!isNaN(numValue) && numValue >= 0) {
            updateShares(symbol, numValue);
            setShares(numValue);
            setIsEditing(false);
            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 2000);
            window.dispatchEvent(new Event("portfolio-updated"));
        }
    };

    const handleQuickAdd = (amount: number) => {
        const newShares = Math.max(0, shares + amount);
        updateShares(symbol, newShares);
        setShares(newShares);
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 2000);
        window.dispatchEvent(new Event("portfolio-updated"));
    };

    const marketValue = shares * currentPrice;

    return (
        <div className="bg-white border border-slate-100 rounded-xl p-8 mb-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 transition-colors">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Briefcase size={16} className="text-slate-500 dark:text-slate-400" />
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">Your Position</h3>
                    </div>
                    <div className="flex items-baseline gap-4">
                        <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                            {shares.toLocaleString()} <span className="text-lg text-slate-500 font-bold uppercase dark:text-slate-400">Shares</span>
                        </span>
                        {shares > 0 && (
                            <span className="text-slate-500 font-medium dark:text-slate-400">
                                Value: <span className="text-slate-900 font-bold dark:text-slate-200">${marketValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <input
                                autoFocus
                                type="number"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                placeholder="0.00"
                                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                            />
                            <button
                                onClick={handleSave}
                                className="bg-slate-900 text-white p-2 rounded-lg hover:bg-slate-800 transition-colors dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                            >
                                <Check size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="flex border border-slate-200 rounded-lg overflow-hidden font-sans dark:border-slate-700">
                                <button
                                    onClick={() => handleQuickAdd(-1)}
                                    disabled={shares <= 0}
                                    className="px-3 py-2 hover:bg-slate-50 border-r border-slate-200 disabled:opacity-20 transition-colors dark:hover:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                                >
                                    <Minus size={16} />
                                </button>
                                <button
                                    onClick={() => handleQuickAdd(1)}
                                    className="px-3 py-2 hover:bg-slate-50 transition-colors dark:hover:bg-slate-800 dark:text-slate-300"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>

                            <button
                                onClick={() => {
                                    setInputValue(shares.toString());
                                    setIsEditing(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-900 text-sm font-bold rounded-lg border border-slate-200 transition-colors dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
                            >
                                <Edit2 size={16} />
                                <span>Edit</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {isSuccess && (
                <div className="mt-4 text-xs font-bold text-emerald-500 uppercase tracking-widest animate-pulse">
                    ✓ Position updated effectively
                </div>
            )}
        </div>
    );
}
