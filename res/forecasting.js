const ARIMA = require('arima')

const ts = Array(24).fill(0).map((_, i) => i + Math.random() / 5)
const arima = new ARIMA({
    p: 2,
    d: 1,
    q: 2,
    verbose: false
}).train(ts)
// Predict next 12 values
// const [pred, errors] = arima.predict(12)



const sarima = new ARIMA({
    p: 2,
    d: 1,
    q: 2,
    P: 1,
    D: 0,
    Q: 1,
    s: 12,
    verbose: false
}).train(ts)
const [pred, errors] = sarima.predict(12)
