
const YahooFinance = require('yahoo-finance2').default;

async function test() {
    console.log('--- Testing with "new YahooFinance()" ---');
    try {
        const yahooFinance = new YahooFinance();
        const symbol = '0050.TW';
        console.log(`Searching for ${symbol}...`);
        const quote = await yahooFinance.quote(symbol);
        console.log('Quote Result:', JSON.stringify({
            price: quote.regularMarketPrice,
            currency: quote.currency,
            exchange: quote.exchange,
            name: quote.longName
        }, null, 2));
    } catch (e) {
        console.error('Test Failed:', e.message);
        console.error('Stack:', e.stack);
    }
}

test();
