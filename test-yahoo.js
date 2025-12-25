const yahooFinance = require('yahoo-finance2').default;

async function test() {
    try {
        const quote = await yahooFinance.quote('AAPL');
        console.log('Success! Quote:', quote.regularMarketPrice);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

test();
