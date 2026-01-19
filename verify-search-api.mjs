
import YahooFinance from 'yahoo-finance2';

async function verifySearch() {
    const queries = ['AAPL', '2330.TW', 'BTC-USD'];
    console.log('--- Verifying Search API Currency Data ---');

    for (const query of queries) {
        try {
            const results = await YahooFinance.search(query, { quotesCount: 1 });
            if (results && results.quotes && results.quotes.length > 0) {
                const q = results.quotes[0];
                console.log(`Query: ${query}`);
                console.log(`Symbol: ${q.symbol}`);
                console.log(`Name: ${q.longname || q.shortname}`);
                console.log(`Exchange: ${q.exchange}`);
                console.log(`Currency: ${q.currency || 'MISSING'}`);
                console.log('---');
            }
        } catch (error) {
            console.error(`Error searching for ${query}:`, error);
        }
    }
}

verifySearch();
