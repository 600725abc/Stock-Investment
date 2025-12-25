import { NextRequest, NextResponse } from "next/server";
import { searchStocks } from "@/lib/api/yahoo";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.length < 1) {
        return NextResponse.json([]);
    }

    try {
        const results = await searchStocks(query);
        return NextResponse.json(results);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
