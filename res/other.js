const { ItemData, DailyData } = require('./models');


async function addI(c) {
    await ItemData.create({
        itemID: 1,
        consumption: c,
        safetyStock: 5,
        reorderLevel: 3
    })
}

async function addSales(sale) {
    await DailyData.create({
        sales: sale
    })
}
let arr = [157415,193671,126308,156085,187145,192357,219053,153122,196886,198887,163610,147760,186284,188080,129662,146400,183546,157002,209320]
// arr.forEach(x => addSales(x))