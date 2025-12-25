"use client";

import { useState, useEffect } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

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
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        async function fetchChartData() {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/stock/chart?symbol=${symbol}&range=${activeRange}`);
                const newData = await response.json();
                if (Array.isArray(newData)) {
                    setData(newData);
                }
            } catch (error) {
                console.error("Failed to fetch chart data:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchChartData();
    }, [activeRange, symbol]);

    return (
        <div className="fintech-card p-6 sm:p-8 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                <h3 className="text-lg font-bold text-slate-900">{t("stock.chart.title")}</h3>

                {/* Segmented Control Style */}
                <div className="flex bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
                    {ranges.map((range) => (
                        <button
                            key={range}
                            onClick={() => setActiveRange(range)}
                            disabled={isLoading}
                            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${activeRange === range
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                                } disabled:opacity-50`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[300px] sm:h-[400px] w-full relative">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10 backdrop-blur-sm transition-all">
                        <Loader2 className="w-5 h-5 text-slate-900 animate-spin" />
                    </div>
                )}
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0f172a" stopOpacity={0.05} />
                                <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                            dy={12}
                            minTickGap={30}
                        />
                        <YAxis
                            orientation="right"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                            domain={['auto', 'auto']}
                            width={45}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '8px',
                                border: 'none',
                                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                                padding: '12px 16px',
                                backgroundColor: '#ffffff',
                                color: '#0f172a'
                            }}
                            itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                            labelStyle={{ color: '#64748b', marginBottom: 4, fontSize: '12px' }}
                            cursor={{ stroke: '#cbd5e1', strokeDasharray: '4 4' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="price"
                            stroke="#0f172a" /* Slate 900 for the line itself */
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
