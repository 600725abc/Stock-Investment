import Navbar from "@/components/Navbar";
import { TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center -mt-16">
        <div className="flex flex-col items-center max-w-2xl px-8 text-center">
          <div className="mb-8 bg-zinc-50 p-6 rounded-full text-zinc-400">
            <TrendingUp size={48} />
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl mb-4">
            Track Your Investments
          </h1>

          <p className="text-lg text-zinc-500 mb-8 max-w-lg">
            Enter a stock ticker symbol above to view real-time price charts and the latest company news
          </p>
        </div>
      </main>

      <footer className="py-8 text-center text-zinc-400 text-sm border-t border-zinc-50 font-sans">
        &copy; {new Date().getFullYear()} InvestTrack. All market data is delayed.
      </footer>
    </div>
  );
}
