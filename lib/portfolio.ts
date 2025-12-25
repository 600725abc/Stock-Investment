"use client";

export interface PortfolioPosition {
    symbol: string;
    shares: number;
}

const STORAGE_KEY = "invest-track-portfolio";

export function getPortfolio(): PortfolioPosition[] {
    if (typeof window === "undefined") return [];
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("Error reading portfolio from localStorage", e);
        return [];
    }
}

export function getShares(symbol: string): number {
    const portfolio = getPortfolio();
    const position = portfolio.find(p => p.symbol === symbol.toUpperCase());
    return position ? position.shares : 0;
}

export function updateShares(symbol: string, shares: number) {
    if (typeof window === "undefined") return;
    try {
        const portfolio = getPortfolio();
        const upperSymbol = symbol.toUpperCase();
        const existingIndex = portfolio.findIndex(p => p.symbol === upperSymbol);

        if (existingIndex >= 0) {
            if (shares <= 0) {
                portfolio.splice(existingIndex, 1);
            } else {
                portfolio[existingIndex].shares = shares;
            }
        } else if (shares > 0) {
            portfolio.push({ symbol: upperSymbol, shares });
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
        // Dispatche custom event for other components to listen to
        window.dispatchEvent(new Event("portfolio-updated"));
    } catch (e) {
        console.error("Error updating portfolio in localStorage", e);
    }
}
