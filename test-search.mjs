
import YahooFinance from 'yahoo-finance2';

async function testSearch() {
    const query = 'TSMC';
    try {
        const results = await YahooFinance.search(query, { quotesCount: 5 });
        console.log(JSON.stringify(results, null, 2));
    } catch (error) {
        console.error(error);
    }
}

testSearch();
