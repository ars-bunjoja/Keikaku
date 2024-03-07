const ARIMA = require('arima')
const { DailyData } = require('./models');

function p_arima(ts) {
    // const ts = [108700,126150,106820,128970,124470,108950,123110,115480,
    //             115540,122710,127020,127260,154480,105840,101270,103160,138620,
    //             115800,111260,100540];
    const sarimax = new ARIMA({
        p: 2,
        d: 0,
        q: 1,
        // P: 3,
        // D: 0,
        // Q: 2,
        // S: 12,
        verbose: false
    }).fit(ts);
    const [pred, errors] = sarimax.predict(6);
    return pred;
}

// TS: 108700, Actual: 127260, Pred: 102722.77049124325

async function predict_sarimax(exog, exognew) {
    let previousSales = await DailyData.findAll();
    if (previousSales.length < 10) {
        return 0
    }
    let ts = previousSales.map(x => x.sales);
    const sarimax = new ARIMA({
        p: 1,
        d: 0,
        q: 1,
        transpose: true,
        verbose: false
    }).fit(ts, exog);
    const [pred, errors] = sarimax.predict(12, exognew);
}

module.exports = { p_arima, predict_sarimax }