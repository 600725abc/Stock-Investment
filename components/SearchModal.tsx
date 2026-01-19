"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, TrendingUp, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Stock {
    symbol: string;
    name: string;
    exchange?: string;
    currency?: string;
    type?: string;
}

const POPULAR_STOCKS: Stock[] = [
    { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", currency: "USD" },
    { symbol: "TSLA", name: "Tesla, Inc.", exchange: "NASDAQ", currency: "USD" },
    { symbol: "NVDA", name: "NVIDIA Corporation", exchange: "NASDAQ", currency: "USD" },
    { symbol: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ", currency: "USD" },
    { symbol: "AMZN", name: "Amazon.com, Inc.", exchange: "NASDAQ", currency: "USD" },
    { symbol: "GOOGL", name: "Alphabet Inc.", exchange: "NASDAQ", currency: "USD" },
];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    const [results, setResults] = useState<Stock[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (query.trim().length < 1) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/stock/search?q=${encodeURIComponent(query)}`);
                if (response.ok) {
                    const data = await response.json();
                    setResults(data);
                }
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const displayStocks = query.trim() === "" ? POPULAR_STOCKS : results;

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
            setQuery("");
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === "Escape") onClose();
            if (e.key === "ArrowDown") {
                setSelectedIndex(prev => (prev + 1) % filteredStocks.length);
            }
            if (e.key === "ArrowUp") {
                setSelectedIndex(prev => (prev - 1 + filteredStocks.length) % filteredStocks.length);
            }
            if (e.key === "Enter") {
                if (query.trim() && !filteredStocks.length) {
                    handleSelect(query.toUpperCase());
                } else if (filteredStocks[selectedIndex]) {
                    handleSelect(filteredStocks[selectedIndex].symbol);
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, filteredStocks, selectedIndex, query]);

    const handleSelect = (symbol: string) => {
        router.push(`/${symbol}`);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 backdrop-blur-sm bg-slate-950/60 transition-all duration-300">
            <div
                className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center px-4 py-4 border-b border-slate-800">
                    <Search className="w-5 h-5 text-slate-400 mr-3" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search stocks or type a ticker..."
                        className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder-slate-500"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                    />
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {filteredStocks.length > 0 ? (
                        <div className="space-y-1">
                            <p className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                                <span>{query.trim() === "" ? "Popular Stocks" : "Search Results"}</span>
                                {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                            </p>
                            {displayStocks.map((stock, index) => (
                                <button
                                    key={stock.symbol}
                                    onClick={() => handleSelect(stock.symbol)}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all ${index === selectedIndex ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-lg bg-slate-950 flex items-center justify-center mr-3 border border-slate-800">
                                            <span className="text-xs font-bold text-white">{stock.symbol.slice(0, 2)}</span>
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-sm tracking-tight flex items-center">
                                                {stock.symbol}
                                                {stock.currency && (
                                                    <span className="ml-2 text-[10px] text-slate-500 font-medium">
                                                        {stock.currency}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-500 flex items-center truncate max-w-[200px]">
                                                {stock.name}
                                                {stock.exchange && (
                                                    <>
                                                        <span className="mx-1.5 opacity-30">•</span>
                                                        <span className="text-[10px] uppercase opacity-60 tracking-wider font-semibold">{stock.exchange}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {index === selectedIndex && (
                                        <div className="text-[10px] font-bold text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-700">
                                            ENTER
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-500">
                            <p className="mb-2">No results for &quot;{query}&quot;</p>
                            <button
                                onClick={() => handleSelect(query.toUpperCase())}
                                className="text-white font-bold hover:underline"
                            >
                                Go to {query.toUpperCase()} &rarr;
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-slate-950 px-4 py-3 flex items-center justify-between border-t border-slate-800">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center text-[10px] text-slate-500">
                            <kbd className="bg-slate-800 px-1.5 py-0.5 rounded mr-1.5 border border-slate-700 text-white">↑↓</kbd>
                            Navigate
                        </div>
                        <div className="flex items-center text-[10px] text-slate-500">
                            <kbd className="bg-slate-800 px-1.5 py-0.5 rounded mr-1.5 border border-slate-700 text-white">Enter</kbd>
                            Select
                        </div>
                    </div>
                    <div className="text-[10px] text-slate-600 font-medium">
                        Tip: Press <kbd className="text-slate-500">/</kbd> to search from anywhere
                    </div>
                </div>
            </div>
        </div>
    );
}
