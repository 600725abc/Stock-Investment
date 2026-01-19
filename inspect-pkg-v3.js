
const yf = require('yahoo-finance2');
console.log('--- require("yahoo-finance2") ---');
console.log('Type:', typeof yf);
console.log('Keys:', Object.keys(yf));

if (yf.default) {
    console.log('\n--- .default ---');
    console.log('Type:', typeof yf.default);
    console.log('Keys:', Object.keys(yf.default));

    try {
        console.log('Testing .default.quote("AAPL")...');
        // We don't actually await it, just see if it's a function
        console.log('Is quote a function?', typeof yf.default.quote === 'function');
    } catch (e) {
        console.log('Error accessing .default.quote:', e.message);
    }
}

// Check other exports if they exist
const namedExports = Object.keys(yf).filter(k => k !== 'default');
namedExports.forEach(k => {
    console.log(`\n--- Named Export: ${k} ---`);
    console.log('Type:', typeof yf[k]);
});
