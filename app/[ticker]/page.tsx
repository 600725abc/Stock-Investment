import Navbar from "@/components/Navbar";
import StockHeader from "@/components/StockHeader";
import PriceChart from "@/components/PriceChart";
import NewsList from "@/components/NewsList";
import PortfolioManager from "@/components/PortfolioManager";
import { getYahooQuote } from "@/lib/api/yahoo";
import { getGoogleNews } from "@/lib/api/news";
import StockNotFound from "./StockNotFound";
import StockFooter from "./StockFooter";

const getStockData = async (ticker: string) => {
    const symbol = ticker.toUpperCase();

    try {
        const [quote, news] = await Promise.all([
            getYahooQuote(symbol),
            getGoogleNews(symbol)
        ]);

        if (!quote) throw new Error("Stock not found or API error");

        return {
            symbol,
            name: quote.name,
            price: quote.price || 0,
            change: quote.change || 0,
            changePercent: quote.changePercent || 0,
            currency: quote.currency || "USD",
            stats: {
                marketCap: quote.marketCap,
                dayHigh: quote.high?.toFixed(2) || "N/A",
                dayLow: quote.low?.toFixed(2) || "N/A",
            },
            news: news || []
        };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Failed to fetch stock data:", message);
        return null;
    }
};

export default async function StockPage({ params }: { params: Promise<{ ticker: string }> }) {
    const { ticker } = await params;
    const data = await getStockData(ticker);

    if (!data) {
        return (
            <div className="flex flex-col min-h-screen bg-zinc-50/30">
                <Navbar />
                <StockNotFound ticker={ticker} />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-zinc-50/30">
            <Navbar />

            <main className="container-width py-12 mt-16 sm:mt-20">
                <StockHeader
                    symbol={data.symbol}
                    name={data.name}
                    price={data.price}
                    change={data.change}
                    changePercent={data.changePercent}
                    currency={data.currency}
                    stats={data.stats}
                />

                <PortfolioManager symbol={data.symbol} currentPrice={data.price} />

                <div className="space-y-6">
                    <PriceChart symbol={data.symbol} initialData={[]} />
                    <NewsList news={data.news} />
                </div>
            </main>

            <StockFooter />
        </div>
    );
}
