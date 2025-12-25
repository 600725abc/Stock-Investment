import Navbar from "@/components/Navbar";
import StockHeader from "@/components/StockHeader";
import PriceChart from "@/components/PriceChart";
import NewsList from "@/components/NewsList";
import PortfolioManager from "@/components/PortfolioManager";
import { getYahooQuote } from "@/lib/api/yahoo";
import { getGoogleNews } from "@/lib/api/news";

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
            stats: {
                marketCap: quote.marketCap,
                dayHigh: quote.high?.toFixed(2) || "N/A",
                dayLow: quote.low?.toFixed(2) || "N/A",
            },
            news: news || []
        };
    } catch (error: any) {
        console.error("Failed to fetch stock data:", error.message);
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
                <main className="flex-1 flex flex-col items-center justify-center p-8">
                    <div className="bg-white p-12 rounded-3xl border border-zinc-100 shadow-sm text-center max-w-md">
                        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Stock Not Found</h1>
                        <p className="text-zinc-500 mb-6">We couldn't find data for "{ticker.toUpperCase()}". Please check the symbol and try again.</p>
                        <a href="/" className="inline-block px-6 py-2 bg-black text-white rounded-lg font-bold">Back to Search</a>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-zinc-50/30">
            <Navbar />

            <main className="flex-1 w-full max-w-5xl mx-auto px-8 py-24">
                <StockHeader
                    symbol={data.symbol}
                    name={data.name}
                    price={data.price}
                    change={data.change}
                    changePercent={data.changePercent}
                    stats={data.stats}
                />

                <PortfolioManager symbol={data.symbol} currentPrice={data.price} />

                <div className="space-y-6">
                    <PriceChart symbol={data.symbol} initialData={[]} />
                    <NewsList news={data.news} />
                </div>
            </main>

            <footer className="py-12 text-center text-zinc-400 text-sm border-t border-zinc-100 bg-white font-sans">
                &copy; {new Date().getFullYear()} InvestTrack. World market data via Yahoo Finance & Google News.
            </footer>
        </div>
    );
}
