
const yf = require('yahoo-finance2');
console.log('yf keys:', Object.keys(yf));
console.log('yf.default type:', typeof yf.default);
if (typeof yf.default === 'function') {
    console.log('yf.default keys:', Object.keys(yf.default));
}
console.log('yf.yahooFinance type:', typeof yf.yahooFinance);
if (yf.yahooFinance) {
    console.log('yf.yahooFinance keys:', Object.keys(yf.yahooFinance).filter(k => k === 'quote' || k === 'chart'));
}
