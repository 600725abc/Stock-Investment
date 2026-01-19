
const YahooFinance = require('yahoo-finance2').default;

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
