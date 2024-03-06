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
