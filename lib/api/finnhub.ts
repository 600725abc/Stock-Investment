const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";
const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY || process.env.FINNHUB_API_KEY;

export async function getStockQuote(symbol: string) {
    if (!API_KEY) {
        console.warn("FINNHUB_API_KEY is not defined. Using mock data.");
        return null;
    }

    try {
        const response = await fetch(`${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${API_KEY}`, {
            next: { revalidate: 60 } // Cache for 1 minute
        });
        const data = await response.json();

        // Finnhub returns 0 for price if symbol is invalid
        if (data.c === 0) return null;

        return {
            price: data.c,
            change: data.d,
            changePercent: data.dp,
            high: data.h,
            low: data.l,
            open: data.o,
            previousClose: data.pc
        };
    } catch (error) {
        console.error("Finnhub Quote Fetch Error:", error);
        return null;
    }
}

export async function getStockNews(symbol: string) {
    if (!API_KEY) return null;

    try {
        const today = new Date().toISOString().split('T')[0];
        const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const response = await fetch(
            `${FINNHUB_BASE_URL}/company-news?symbol=${symbol}&from=${lastMonth}&to=${today}&token=${API_KEY}`,
            { next: { revalidate: 3600 } } // Cache for 1 hour
        );
        const data = await response.json();

        if (!Array.isArray(data)) return null;

        return data.slice(0, 8).map((item: any) => ({
            id: item.id.toString(),
            title: item.headline,
            summary: item.summary || item.headline,
            source: item.source,
            timeAgo: new Date(item.datetime * 1000).toLocaleDateString() + ' ' + new Date(item.datetime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            url: item.url
        }));
    } catch (error) {
        console.error("Finnhub News Fetch Error:", error);
        return null;
    }
}

export async function getStockCandles(symbol: string, resolution: string, from: number, to: number) {
    if (!API_KEY) return null;

    try {
        const response = await fetch(
            `${FINNHUB_BASE_URL}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${API_KEY}`
        );
        const data = await response.json();

        if (data.s !== "ok") return null;

        return data.t.map((timestamp: number, index: number) => ({
            time: resolution === 'D' || resolution === 'W'
                ? new Date(timestamp * 1000).toLocaleDateString()
                : new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            price: data.c[index]
        }));
    } catch (error) {
        console.error("Finnhub Candles Error:", error);
        return null;
    }
}
