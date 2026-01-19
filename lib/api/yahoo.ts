import yahooFinance from "yahoo-finance2";
import fs from "fs";
import path from "path";

// yahoo-finance2 v3+ exports the singleton as the default export

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

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

// Helper to detect market type
function getMarketType(symbol: string): 'US' | 'TW' | 'CRYPTO' | 'OTHER' {
    const upperSymbol = symbol.toUpperCase();
    if (upperSymbol.endsWith('.TW')) return 'TW';
    if (upperSymbol.includes('-USD')) return 'CRYPTO';
    if (/^[A-Z]{1,5}$/.test(upperSymbol)) return 'US'; // Simple US stock pattern
    return 'OTHER';
}

// Helper to convert symbols for Finnhub (only used for US stocks)
function convertToFinnhubSymbol(symbol: string): string {
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
            name: symbol, // Will be filled by Yahoo metadata
            marketCap: "N/A",
            currency: "USD"
        };
    } catch (error) {
        console.error("Finnhub Fetch Error:", error);
        return null;
    }
}

async function getYahooQuoteData(symbol: string) {
    try {
        const quote = await yahooFinance.quote(symbol);
        if (!quote) return null;

        return {
            price: quote.regularMarketPrice,
            change: quote.regularMarketChange,
            changePercent: quote.regularMarketChangePercent,
            high: quote.regularMarketDayHigh,
            low: quote.regularMarketDayLow,
            name: quote.longName || quote.shortName || symbol,
            marketCap: formatMarketCap(quote.marketCap),
            currency: quote.currency || "USD"
        };
    } catch (error) {
        console.error("Yahoo Quote Error:", error);
        return null;
    }
}

export async function getYahooQuote(symbol: string) {
    const cacheKey = `quote_${symbol}`;
    const now = Date.now();

    if (CACHE[cacheKey] && now - CACHE[cacheKey].timestamp < CACHE_TTL) {
        return CACHE[cacheKey].data;
    }

    const marketType = getMarketType(symbol);
    let finalData: any = null;

    try {
        if (marketType === 'US') {
            // --- US STOCKS: Try Finnhub first (more reliable), fallback to Yahoo ---
            const fhQuote = await getFinnhubQuote(symbol);

            if (fhQuote) {
                // Got price from Finnhub, try to enrich with Yahoo metadata
                try {
                    const yQuote = await yahooFinance.quote(symbol);
                    if (yQuote) {
                        finalData = {
                            ...fhQuote,
                            name: yQuote.longName || yQuote.shortName || symbol,
                            marketCap: formatMarketCap(yQuote.marketCap),
                            currency: yQuote.currency || "USD"
                        };
                    } else {
                        finalData = fhQuote;
                    }
                } catch (e) {
                    // Yahoo metadata failed, use Finnhub data as-is
                    finalData = fhQuote;
                }
            } else {
                // Finnhub failed, fallback to pure Yahoo
                finalData = await getYahooQuoteData(symbol);
            }
        } else {
            // --- TAIWAN/CRYPTO/OTHER: Use Yahoo Finance directly ---
            finalData = await getYahooQuoteData(symbol);
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

    const marketType = getMarketType(symbol);
    let chartData: any[] | null = null;

    try {
        if (marketType === 'US') {
            // --- US STOCKS: Try Finnhub for historical data ---
            console.log(`[CHART] Attempting Finnhub for US stock: ${symbol}`);
            chartData = await getFinnhubChart(symbol, period1, period2, interval);

            if (chartData && chartData.length > 0) {
                console.log(`[CHART] Finnhub success for ${symbol}: ${chartData.length} data points`);
            } else {
                console.log(`[CHART] Finnhub returned no data for ${symbol}, falling back to Yahoo`);
                chartData = await getYahooChartData(symbol, period1, period2, interval);
            }
        } else {
            // --- TAIWAN/CRYPTO/OTHER: Use Yahoo directly ---
            console.log(`[CHART] Using Yahoo for non-US stock: ${symbol} (type: ${marketType})`);
            chartData = await getYahooChartData(symbol, period1, period2, interval);
        }

        if (chartData && chartData.length > 0) {
            CACHE[cacheKey] = { data: chartData, timestamp: now };
            return chartData;
        }

        console.error(`[CHART] No valid chart data for ${symbol}`);
        return null;
    } catch (error: unknown) {
        console.error(`[CHART] Chart Error for ${symbol}:`, error);
        return null;
    }
}

async function getFinnhubChart(symbol: string, period1: Date, period2: Date, interval: "1d" | "1wk" | "1mo" | "5m" | "1h") {
    // Map our intervals to Finnhub's resolution format
    const resolutionMap: Record<string, string> = {
        "5m": "5",
        "1h": "60",
        "1d": "D",
        "1wk": "W",
        "1mo": "M"
    };

    const resolution = resolutionMap[interval] || "D";
    const from = Math.floor(period1.getTime() / 1000);
    const to = Math.floor(period2.getTime() / 1000);
    const url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`;

    console.log(`[FINNHUB] Requesting: ${symbol}, resolution: ${resolution}, from: ${new Date(from * 1000).toISOString()}, to: ${new Date(to * 1000).toISOString()}`);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`[FINNHUB] HTTP Error: ${response.status} ${response.statusText}`);
            throw new Error("Finnhub Chart API Error");
        }
        const data = await response.json();

        console.log(`[FINNHUB] Response status: ${data.s}, data points: ${data.t?.length || 0}`);

        // Finnhub returns arrays: t (timestamps), c (close prices), o, h, l, v
        if (data.s === 'no_data' || !data.t || !data.c) {
            console.log(`[FINNHUB] No data available: status=${data.s}`);
            return null;
        }

        const chartData = data.t.map((timestamp: number, index: number) => ({
            time: formatTimeLabel(new Date(timestamp * 1000), interval),
            price: data.c[index]
        })).filter((item: any) => item.price !== null && item.price !== undefined);

        console.log(`[FINNHUB] Successfully processed ${chartData.length} data points`);
        return chartData;
    } catch (error) {
        console.error("[FINNHUB] Chart Fetch Error:", error);
        return null;
    }
}

async function getYahooChartData(symbol: string, period1: Date, period2: Date, interval: "1d" | "1wk" | "1mo" | "5m" | "1h") {
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
                    type: q.quoteType || "",
                    currency: q.currency || q.financialCurrency || ""
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
