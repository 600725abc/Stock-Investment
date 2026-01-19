
const yahooFinance = require('yahoo-finance2').default;

async function test() {
    console.log('Testing Yahoo Finance singleton methods...');
    try {
        // If yahooFinance is a class, this will fail.
        // If it's the singleton, it will work.
        const quote = await yahooFinance.quote('AAPL');
        console.log('Success! AAPL Price:', quote.regularMarketPrice);

        const twQuote = await yahooFinance.quote('0050.TW');
        console.log('Success! 0050.TW Price:', twQuote.regularMarketPrice);
    } catch (e) {
        console.error('Test Failed:', e.message);
        if (e.message.includes('default')) {
            console.log('Likely incorrect initialization.');
        }
    }
}

test();
