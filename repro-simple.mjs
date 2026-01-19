
import yahooFinance from 'yahoo-finance2';

async function test() {
    const symbol = '0050.TW';
    console.log(`--- Testing yahooFinance.quote for ${symbol} ---`);
    try {
        // Test with the default export directly
        const quote = await yahooFinance.quote(symbol);
        console.log('Quote:', JSON.stringify({
            price: quote.regularMarketPrice,
            currency: quote.currency,
            exchange: quote.exchange,
            name: quote.longName
        }, null, 2));
    } catch (e) {
        console.error('Quote Error:', e);
        // If it still fails with the initialization error, show the full error
        console.error('Error stack:', e.stack);
    }

    console.log(`\n--- Testing YahooFinance.chart for ${symbol} ---`);
    try {
        const to = new Date();
        const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const chart = await yahooFinance.chart(symbol, {
            period1: from,
            period2: to,
            interval: '1d'
        });
        console.log('Chart Count:', chart?.quotes?.length || 0);
    } catch (e) {
        console.error('Chart Error:', e);
    }
}

test();
