
import { getYahooQuote, getYahooChartByRange } from './lib/api/yahoo.js';

async function repro() {
    const symbol = '0050.TW';
    console.log(`--- Testing Quote for ${symbol} ---`);
    try {
        const quote = await getYahooQuote(symbol);
        console.log('Quote Result:', JSON.stringify(quote, null, 2));
    } catch (e) {
        console.error('Quote Error:', e);
    }

    console.log(`\n--- Testing Chart for ${symbol} (1M) ---`);
    try {
        const chart = await getYahooChartByRange(symbol, '1M');
        console.log('Chart Results Count:', chart ? chart.length : 0);
        if (chart && chart.length > 0) {
            console.log('Sample Data:', JSON.stringify(chart[0], null, 2));
        }
    } catch (e) {
        console.error('Chart Error:', e);
    }
}

repro();
