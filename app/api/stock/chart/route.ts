import { NextRequest, NextResponse } from "next/server";
import { getYahooChart } from "@/lib/api/yahoo";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get("symbol");
    const range = searchParams.get("range") || "1M";

    if (!symbol) {
        return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
    }

    const to = new Date();
    let from: Date;
    let interval: '5m' | '1h' | '1d' | '1wk' | '1mo' = '1d';

    switch (range) {
        case "1D":
            from = new Date(Date.now() - 24 * 60 * 60 * 1000);
            interval = "5m";
            break;
        case "1W":
            from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            interval = "1h";
            break;
        case "1M":
            from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            interval = "1d";
            break;
        case "3M":
            from = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
            interval = "1d";
            break;
        case "1Y":
            from = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
            interval = "1wk";
            break;
        default:
            from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            interval = "1d";
    }

    try {
        const candles = await getYahooChart(symbol, from, to, interval);

        if (!candles) {
            return NextResponse.json({ error: "Failed to fetch chart data" }, { status: 500 });
        }

        return NextResponse.json(candles);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
