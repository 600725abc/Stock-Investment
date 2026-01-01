import { NextRequest, NextResponse } from "next/server";
import { getYahooChartByRange } from "@/lib/api/yahoo";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get("symbol");
    const range = searchParams.get("range") || "1M";

    if (!symbol) {
        return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
    }

    try {
        const candles = await getYahooChartByRange(symbol, range);

        if (!candles) {
            return NextResponse.json({ error: "Failed to fetch chart data" }, { status: 500 });
        }

        return NextResponse.json(candles);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
