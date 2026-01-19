
const YahooFinance = require('yahoo-finance2').default;

async function test() {
    console.log('--- Yahoo Finance v3 Test (No Notices) ---');
    try {
        const yf = new YahooFinance();
        // Try to suppress notices if possible via options
        yf._setOpts({ logger: { info: () => { }, warn: () => { }, error: console.error, dir: () => { } } });

        const symbol = '0050.TW';
        console.log(`Fetching quote for ${symbol}...`);

        // Use a timeout
        const timeout = setTimeout(() => {
            console.log('TIMEOUT: API call took too long');
            process.exit(1);
        }, 10000);

        const quote = await yf.quote(symbol);
        clearTimeout(timeout);

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
    }
}

test();
