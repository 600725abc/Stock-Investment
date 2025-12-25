"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "zh";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    en: {
        // Navbar
        "nav.portfolio": "Portfolio",
        "nav.search.placeholder": "Ticker or code (e.g., AAPL, 2330)",
        "nav.search.button": "Search",

        // Home
        "home.title": "Track Your Investments",
        "home.subtitle": "View real-time price charts and the latest news",
        "home.search.placeholder": "Enter ticker or code (e.g., AAPL, 2330, 0700.HK)",
        "home.search.hint": "Enter the stock ticker symbol, not company name",
        "home.footer": "InvestTrack. All market data is delayed.",
        "home.features.charts": "Real-time Charts",
        "home.features.news": "Latest News",
        "home.features.global": "Global Markets",

        // Stock Page
        "stock.notFound.title": "Stock Not Found",
        "stock.notFound.message": "We couldn't find data for this ticker. Please enter a valid stock ticker symbol (e.g., AAPL, TSLA, 2330.TW).",
        "stock.notFound.back": "Back to Search",
        "stock.chart.title": "Price Chart",
        "stock.news.title": "Latest News",
        "stock.stats.marketCap": "Market Cap",
        "stock.stats.dayHigh": "Day High",
        "stock.stats.dayLow": "Day Low",
        "stock.stats.change": "Change",

        // Portfolio
        "portfolio.title": "My Portfolio",
        "portfolio.empty": "No stocks in your portfolio yet.",
        "portfolio.add": "Add to Portfolio",
        "portfolio.remove": "Remove",
        "portfolio.shares": "Shares",
        "portfolio.avgCost": "Avg Cost",
        "portfolio.totalValue": "Total Value",
        "portfolio.gain": "Gain/Loss",

        // Footer
        "footer.source": "Market data provided by Yahoo Finance. News via Google News."
    },
    zh: {
        // Navbar (Traditional Chinese)
        "nav.portfolio": "投資組合",
        "nav.search.placeholder": "代碼（如：AAPL、2330）",
        "nav.search.button": "搜尋",

        // Home (Traditional Chinese)
        "home.title": "追蹤您的投資",
        "home.subtitle": "查看即時價格圖表和最新新聞",
        "home.search.placeholder": "輸入股票代碼（如：AAPL、2330、0700.HK）",
        "home.search.hint": "請輸入股票代碼，而非公司名稱",
        "home.footer": "InvestTrack。所有市場數據存在延遲。",
        "home.features.charts": "即時圖表",
        "home.features.news": "最新新聞",
        "home.features.global": "全球市場",

        // Stock Page (Traditional Chinese)
        "stock.notFound.title": "未找到股票",
        "stock.notFound.message": "找不到此代碼的資料。請輸入有效的股票代碼（如：AAPL、TSLA、2330.TW）。",
        "stock.notFound.back": "返回搜尋",
        "stock.chart.title": "價格走勢",
        "stock.news.title": "最新新聞",
        "stock.stats.marketCap": "市值",
        "stock.stats.dayHigh": "日最高價",
        "stock.stats.dayLow": "日最低價",
        "stock.stats.change": "漲跌幅",

        // Portfolio (Traditional Chinese)
        "portfolio.title": "我的投資組合",
        "portfolio.empty": "您的投資組合中暫無股票。",
        "portfolio.add": "加入投資組合",
        "portfolio.remove": "移除",
        "portfolio.shares": "股數",
        "portfolio.avgCost": "平均成本",
        "portfolio.totalValue": "總價值",
        "portfolio.gain": "損益",

        // Footer (Traditional Chinese)
        "footer.source": "市場數據由 Yahoo Finance 提供。新聞來自 Google News。"
    }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>("en");

    const t = (key: string): string => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
