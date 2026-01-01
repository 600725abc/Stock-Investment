import YahooFinance from "yahoo-finance2";
import fs from "fs";
import path from "path";

const yahooFinance = new YahooFinance();

// Load fallback symbols
let FALLBACK_SYMBOLS: any[] = [];
try {
    const filePath = path.join(process.cwd(), "lib/data/symbols.json");
    if (fs.existsSync(filePath)) {
        FALLBACK_SYMBOLS = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
} catch (error) {
    console.error("Error loading fallback symbols:", error);
}

const CACHE: Record<string, { data: any, timestamp: number }> = {};
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

const FINNHUB_API_KEY = "d5b0tjpr01qh7ajjopk0d5b0tjpr01qh7ajjopkg";

// Helper to convert symbols for Finnhub
function convertToFinnhubSymbol(symbol: string): string {
    // US stocks are same. Taiwan stocks usually 0050.TW
    return symbol.toUpperCase();
}

async function getFinnhubQuote(symbol: string) {
    const finnhubSymbol = convertToFinnhubSymbol(symbol);
    const url = `https://finnhub.io/api/v1/quote?symbol=${finnhubSymbol}&token=${FINNHUB_API_KEY}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Finnhub API Error");
        const data = await response.json();

        // Finnhub returns 'c' for current price, 'd' for change, 'dp' for change percentage
        // If 'c' is 0, it might be an invalid symbol or market closed with no data
        if (!data.c) return null;

        return {
            price: data.c,
            change: data.d,
            changePercent: data.dp,
            high: data.h,
            low: data.l,
            name: symbol, // Finnhub quote API doesn't return name, will be filled by fallback or caller
            marketCap: "N/A", // Quote API doesn't have market cap
            currency: symbol.includes(".TW") ? "TWD" : "USD"
        };
    } catch (error) {
        console.error("Finnhub Fetch Error:", error);
        return null;
    }
}

export async function getYahooQuote(symbol: string) {
    const cacheKey = `quote_${symbol}`;
    const now = Date.now();

    if (CACHE[cacheKey] && now - CACHE[cacheKey].timestamp < CACHE_TTL) {
        return CACHE[cacheKey].data;
    }

    // --- STRATEGY: Try Finnhub First for Price, then Yahoo for Details ---
    let finalData: any = null;

    try {
        // 1. Try to get price from Finnhub (Very Reliable)
        const fhQuote = await getFinnhubQuote(symbol);

        // 2. Try to get metadata (Name, Market Cap) from Yahoo
        let yQuote = null;
        try {
            yQuote = await yahooFinance.quote(symbol);
        } catch (e) {
            console.error("Yahoo Metadata Error:", e);
        }

        if (fhQuote) {
            finalData = {
                ...fhQuote,
                name: yQuote?.longName || yQuote?.shortName || symbol,
                marketCap: formatMarketCap(yQuote?.marketCap),
                currency: yQuote?.currency || fhQuote.currency
            };
        } else if (yQuote) {
            // Fallback to pure Yahoo if Finnhub failed
            finalData = {
                price: yQuote.regularMarketPrice,
                change: yQuote.regularMarketChange,
                changePercent: yQuote.regularMarketChangePercent,
                high: yQuote.regularMarketDayHigh,
                low: yQuote.regularMarketDayLow,
                name: yQuote.longName || yQuote.shortName || symbol,
                marketCap: formatMarketCap(yQuote.marketCap),
                currency: yQuote.currency || "USD"
            };
        }

        if (finalData) {
            CACHE[cacheKey] = { data: finalData, timestamp: now };
            return finalData;
        }

        return null;
    } catch (error: unknown) {
        console.error(`Global Quote Error for ${symbol}:`, error);
        return null;
    }
}

export async function getYahooChart(symbol: string, period1: Date, period2: Date, interval: "1d" | "1wk" | "1mo" | "5m" | "1h" = "1d") {
    const cacheKey = `chart_${symbol}_${interval}_${period1.getTime()}_${period2.getTime()}`;
    const now = Date.now();

    if (CACHE[cacheKey] && now - CACHE[cacheKey].timestamp < 5 * 60 * 1000) {
        return CACHE[cacheKey].data;
    }

    try {
        const result = await yahooFinance.chart(symbol, {
            period1: period1,
            period2: period2,
            interval: interval
        });

        if (!result || !result.quotes || result.quotes.length === 0) {
            return null;
        }

        const data = result.quotes.map((q) => ({
            time: formatTimeLabel(q.date, interval),
            price: q.close
        })).filter((q) => q.price !== null && q.price !== undefined);

        CACHE[cacheKey] = { data, timestamp: now };
        return data;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Yahoo Chart Error for ${symbol}:`, message);
        return null;
    }
}

export async function getYahooChartByRange(symbol: string, range: string = "1M") {
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

    return getYahooChart(symbol, from, to, interval);
}

export async function searchStocks(query: string) {
    const cacheKey = `search_${query.toLowerCase()}`;
    const now = Date.now();

    if (CACHE[cacheKey] && now - CACHE[cacheKey].timestamp < 24 * 60 * 60 * 1000) {
        return CACHE[cacheKey].data;
    }

    let results: any[] = [];
    try {
        const searchResults = await yahooFinance.search(query, { quotesCount: 8 });
        if (searchResults && searchResults.quotes) {
            results = searchResults.quotes
                .filter((q): q is typeof q & { symbol: string } => !!q.symbol)
                .map((q) => ({
                    symbol: q.symbol,
                    name: q.longname || q.shortname || q.symbol,
                    exchange: q.exchange || "",
                    type: q.quoteType || ""
                }));
        }
    } catch (error: unknown) {
        console.error(`Yahoo Search Error (falling back):`, error instanceof Error ? error.message : String(error));
    }

    // Fallback to local list if API fails or returns nothing
    if (results.length === 0 && FALLBACK_SYMBOLS.length > 0) {
        const lowerQuery = query.toLowerCase();
        results = FALLBACK_SYMBOLS.filter(s =>
            s.symbol.toLowerCase().includes(lowerQuery) ||
            s.name.toLowerCase().includes(lowerQuery)
        ).slice(0, 8);
    }

    if (results.length > 0) {
        CACHE[cacheKey] = { data: results, timestamp: now };
    }

    return results;
}

function formatTimeLabel(date: Date | undefined, interval: string): string {
    if (!date) return "";
    if (interval === "5m" || interval === "1h") {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString();
}

function formatMarketCap(value: number | undefined): string {
    if (!value) return "N/A";
    if (value >= 1e12) return (value / 1e12).toFixed(2) + "T";
    if (value >= 1e9) return (value / 1e9).toFixed(2) + "B";
    if (value >= 1e6) return (value / 1e6).toFixed(2) + "M";
    return value.toLocaleString();
}
