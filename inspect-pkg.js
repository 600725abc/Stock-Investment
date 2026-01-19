
const yf = require('yahoo-finance2');
console.log('Keys of require("yahoo-finance2"):', Object.keys(yf));
if (yf.default) {
    console.log('Keys of require("yahoo-finance2").default:', Object.keys(yf.default));
}
console.log('Type of yf:', typeof yf);
console.log('Type of yf.default:', typeof yf.default);
