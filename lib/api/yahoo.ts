const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export async function getYahooQuote(symbol: string) {
    try {
        const response = await fetch(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbol)}`, {
            headers: { 'User-Agent': USER_AGENT }
        });

        if (!response.ok) {
            console.error(`Yahoo API error: ${response.status} ${response.statusText}`);
            return null;
        }

        const data = await response.json();

        if (!data.quoteResponse || !data.quoteResponse.result || data.quoteResponse.result.length === 0) {
            console.warn(`No result found for ${symbol}`);
            return null;
        }

        const result = data.quoteResponse.result[0];

        return {
            price: result.regularMarketPrice,
            change: result.regularMarketChange,
            changePercent: result.regularMarketChangePercent,
            high: result.regularMarketDayHigh,
            low: result.regularMarketDayLow,
            name: result.longName || result.shortName || symbol,
            marketCap: formatMarketCap(result.marketCap)
        };
    } catch (error: any) {
        console.error(`Yahoo Quote Fetch Error for ${symbol}:`, error.message);
        return null;
    }
}

export async function getYahooChart(symbol: string, period1: Date, period2: Date, interval: string = '1d') {
    try {
        const p1 = Math.floor(period1.getTime() / 1000);
        const p2 = Math.floor(period2.getTime() / 1000);

        const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?period1=${p1}&period2=${p2}&interval=${interval}`, {
            headers: { 'User-Agent': USER_AGENT }
        });

        if (!response.ok) return null;

        const data = await response.json();

        if (!data.chart || !data.chart.result || !data.chart.result[0]) return null;

        const result = data.chart.result[0];
        const timestamps = result.timestamp || [];
        const indicators = result.indicators.quote[0];
        const closePrices = indicators.close || [];

        return timestamps.map((t: number, i: number) => ({
            time: formatTimeLabel(t, interval),
            price: closePrices[i]
        })).filter((q: any) => q.price !== null);
    } catch (error: any) {
        console.error(`Yahoo Chart Fetch Error for ${symbol}:`, error.message);
        return null;
    }
}

function formatTimeLabel(timestamp: number, interval: string) {
    const date = new Date(timestamp * 1000);
    if (interval === '5m' || interval === '1h') {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString();
}

function formatMarketCap(value: number | undefined) {
    if (!value) return "N/A";
    if (value >= 1e12) return (value / 1e12).toFixed(2) + "T";
    if (value >= 1e9) return (value / 1e9).toFixed(2) + "B";
    if (value >= 1e6) return (value / 1e6).toFixed(2) + "M";
    return value.toLocaleString();
}
