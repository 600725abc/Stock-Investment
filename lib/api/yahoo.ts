import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

export async function getYahooQuote(symbol: string) {
    try {
        const quote = await yahooFinance.quote(symbol);

        if (!quote) {
            console.warn(`No quote found for ${symbol}`);
            return null;
        }

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
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Yahoo Quote Error for ${symbol}:`, message);
        return null;
    }
}

export async function getYahooChart(symbol: string, period1: Date, period2: Date, interval: "1d" | "1wk" | "1mo" | "5m" | "1h" = "1d") {
    try {
        const result = await yahooFinance.chart(symbol, {
            period1,
            period2,
            interval
        });

        if (!result || !result.quotes || result.quotes.length === 0) {
            return null;
        }

        return result.quotes.map((q) => ({
            time: formatTimeLabel(q.date, interval),
            price: q.close
        })).filter((q) => q.price !== null && q.price !== undefined);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Yahoo Chart Error for ${symbol}:`, message);
        return null;
    }
}

export async function searchStocks(query: string) {
    try {
        const results = await yahooFinance.search(query, { quotesCount: 8 });

        if (!results || !results.quotes) {
            return [];
        }

        return results.quotes
            .filter((q): q is typeof q & { symbol: string } => !!q.symbol)
            .map((q) => ({
                symbol: q.symbol,
                name: q.longname || q.shortname || q.symbol,
                exchange: q.exchange || "",
                type: q.quoteType || ""
            }));
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
