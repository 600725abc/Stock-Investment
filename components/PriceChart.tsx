"use client";

import { useState, useEffect } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Loader2 } from "lucide-react";

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
    const [isLoading, setIsLoading] = useState(false);

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

        if (activeRange !== "1M" || data === initialData) {
            fetchChartData();
        }
    }, [activeRange, symbol]);

    return (
        <div className="bg-white rounded-xl border border-zinc-100 p-8 shadow-sm mb-6 relative">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-zinc-900">Price Chart</h2>
                <div className="flex bg-zinc-100 p-1 rounded-lg">
                    {ranges.map((range) => (
                        <button
                            key={range}
                            onClick={() => setActiveRange(range)}
                            disabled={isLoading}
                            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeRange === range
                                    ? "bg-white text-black shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-700"
                                } disabled:opacity-50`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[400px] w-full relative">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10 rounded-xl">
                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    </div>
                )}
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#a1a1aa', fontSize: 10 }}
                            dy={10}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            orientation="right"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#a1a1aa', fontSize: 10 }}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="price"
                            stroke="#10b981"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorPrice)"
                            animationDuration={800}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
