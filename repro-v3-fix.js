
const YahooFinance = require('yahoo-finance2').default;

async function test() {
    console.log('--- Yahoo Finance v3 Test ---');
    try {
        const yf = new YahooFinance();
        console.log('Instance created.');

        const symbol = '0050.TW';
        console.log(`Fetching quote for ${symbol}...`);

        const quote = await yf.quote(symbol);
        if (quote) {
            console.log('SUCCESS!');
            console.log('Price:', quote.regularMarketPrice);
            console.log('Currency:', quote.currency);
        } else {
            console.log('FAIL: Quote returned null');
        }
    } catch (e) {
        console.log('ERROR CAUGHT:');
        console.log('Message:', e.message);
        // Avoid printing full stack if it's too long, just the first few lines
        console.log('Stack snippet:', e.stack.split('\n').slice(0, 5).join('\n'));
    }
}

test();
