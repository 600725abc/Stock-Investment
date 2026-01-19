
const yahooFinance = require('yahoo-finance2').default;

async function test() {
    const symbol = 'AAPL';
    console.log(`--- Testing YahooFinance.quote for ${symbol} (CJS) ---`);
    try {
        const quote = await yahooFinance.quote(symbol);
        console.log('Quote:', JSON.stringify({
            price: quote.regularMarketPrice,
            currency: quote.currency
        }, null, 2));
    } catch (e) {
        console.error('Quote Error:', e);
    }
}

test();
