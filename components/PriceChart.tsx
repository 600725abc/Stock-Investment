"use client";

import { useState, useEffect } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useTheme } from "next-themes";

interface ChartData {
    time: string;
    price: number;
}

interface PriceChartProps {
    symbol: string;
    initialData: ChartData[];
}

const ranges = ["1D", "1W", "1M", "3M", "1Y"];

export default function PriceChart({ symbol, initialData }: PriceChartProps) {
    const [activeRange, setActiveRange] = useState("1M");
    const [data, setData] = useState<ChartData[]>(initialData);
    const [isLoading, setIsLoading] = useState(initialData.length === 0);
    const [isError, setIsError] = useState(false);
    const { t } = useLanguage();
    const { theme } = useTheme();

    useEffect(() => {
        // Skip fetch if we have initial data and we're looking at the default 1M range
        if (activeRange === "1M" && initialData.length > 0 && data === initialData) {
            setIsLoading(false);
            return;
        }

        async function fetchChartData() {
            setIsLoading(true);
            setIsError(false);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

            try {
                const response = await fetch(`/api/stock/chart?symbol=${symbol}&range=${activeRange}`, {
                    signal: controller.signal
                });
                if (!response.ok) throw new Error("Failed to fetch");
                const newData = await response.json();
                if (Array.isArray(newData)) {
                    setData(newData);
                } else {
                    setIsError(true);
                }
            } catch (error: any) {
                if (error.name === 'AbortError') {
                    console.error("Fetch timed out");
                } else {
                    console.error("Failed to fetch chart data:", error);
                }
                setIsError(true);
            } finally {
                clearTimeout(timeoutId);
                setIsLoading(false);
            }
        }

        fetchChartData();
    }, [activeRange, symbol, initialData]);

    const isDark = theme === 'dark';

    return (
        <div className="fintech-card p-6 sm:p-8 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t("stock.chart.title")}</h3>

                {/* Segmented Control Style */}
                <div className="flex bg-slate-100 p-1 rounded-lg self-start sm:self-auto dark:bg-slate-800">
                    {ranges.map((range) => (
                        <button
                            key={range}
                            onClick={() => setActiveRange(range)}
                            disabled={isLoading}
                            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${activeRange === range
                                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100"
                                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                } disabled:opacity-50`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[300px] sm:h-[400px] w-full relative">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10 backdrop-blur-sm transition-all dark:bg-slate-900/60">
                        <Loader2 className="w-5 h-5 text-slate-900 animate-spin dark:text-slate-100" />
                    </div>
                )}
                {isError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 z-10 backdrop-blur-sm transition-all dark:bg-slate-900/60">
                        <p className="text-sm font-medium text-red-500 mb-2">Failed to load chart data</p>
                        <button
                            onClick={() => setActiveRange(activeRange)}
                            className="text-xs font-bold text-slate-900 underline dark:text-slate-100"
                        >
                            Try Again
                        </button>
                    </div>
                )}
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={isDark ? "#f8fafc" : "#0f172a"} stopOpacity={0.05} />
                                <stop offset="95%" stopColor={isDark ? "#f8fafc" : "#0f172a"} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#f1f5f9"} />
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                            dy={12}
                            minTickGap={30}
                        />
                        <YAxis
                            orientation="right"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                            domain={['auto', 'auto']}
                            width={45}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '8px',
                                border: 'none',
                                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                                padding: '12px 16px',
                                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                                color: isDark ? '#f8fafc' : '#0f172a'
                            }}
                            itemStyle={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 600 }}
                            labelStyle={{ color: '#64748b', marginBottom: 4, fontSize: '12px' }}
                            cursor={{ stroke: '#cbd5e1', strokeDasharray: '4 4' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="price"
                            stroke={isDark ? "#f8fafc" : "#0f172a"}
                            strokeWidth={2}
                            fill="url(#colorPrice)"
                            animationDuration={1000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
