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
        <div className="bg-white border border-zinc-100 rounded-xl p-8 mb-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Briefcase size={16} className="text-zinc-400" />
                        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Your Position</h3>
                    </div>
                    <div className="flex items-baseline gap-4">
                        <span className="text-4xl font-extrabold text-zinc-900">
                            {shares.toLocaleString()} <span className="text-lg text-zinc-400 font-bold uppercase">Shares</span>
                        </span>
                        {shares > 0 && (
                            <span className="text-zinc-500 font-medium">
                                Value: <span className="text-zinc-900 font-bold">${marketValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
                                className="w-24 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="0.00"
                                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                            />
                            <button
                                onClick={handleSave}
                                className="bg-black text-white p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                            >
                                <Check size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="flex border border-zinc-200 rounded-lg overflow-hidden font-sans">
                                <button
                                    onClick={() => handleQuickAdd(-1)}
                                    disabled={shares <= 0}
                                    className="px-3 py-2 hover:bg-zinc-50 border-r border-zinc-200 disabled:opacity-20 transition-colors"
                                >
                                    <Minus size={16} />
                                </button>
                                <button
                                    onClick={() => handleQuickAdd(1)}
                                    className="px-3 py-2 hover:bg-zinc-50 transition-colors"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>

                            <button
                                onClick={() => {
                                    setInputValue(shares.toString());
                                    setIsEditing(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-900 text-sm font-bold rounded-lg border border-zinc-200 transition-colors"
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
