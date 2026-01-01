import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

const CACHE: Record<string, { data: any, timestamp: number }> = {};
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

export async function getYahooQuote(symbol: string) {
    const cacheKey = `quote_${symbol}`;
    const now = Date.now();

    if (CACHE[cacheKey] && now - CACHE[cacheKey].timestamp < CACHE_TTL) {
        return CACHE[cacheKey].data;
    }

    try {
        const quote = await yahooFinance.quote(symbol);

        if (!quote) {
            console.warn(`No quote found for ${symbol}`);
            return null;
        }

        const data = {
            price: quote.regularMarketPrice,
            change: quote.regularMarketChange,
            changePercent: quote.regularMarketChangePercent,
            high: quote.regularMarketDayHigh,
            low: quote.regularMarketDayLow,
            name: quote.longName || quote.shortName || symbol,
            marketCap: formatMarketCap(quote.marketCap),
            currency: quote.currency || "USD"
        };

        CACHE[cacheKey] = { data, timestamp: now };
        return data;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Yahoo Quote Error for ${symbol}:`, message);
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
            period1,
            period2,
            interval
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

    try {
        const results = await yahooFinance.search(query, { quotesCount: 8 });

        if (!results || !results.quotes) {
            return [];
        }

        const data = results.quotes
            .filter((q): q is typeof q & { symbol: string } => !!q.symbol)
            .map((q) => ({
                symbol: q.symbol,
                name: q.longname || q.shortname || q.symbol,
                exchange: q.exchange || "",
                type: q.quoteType || ""
            }));

        CACHE[cacheKey] = { data, timestamp: now };
        return data;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Yahoo Search Error:`, message);
        return [];
    }
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
