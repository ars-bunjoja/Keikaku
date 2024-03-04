const { ItemData } = require('./models');
const { decreaseStock } = require('./utils');


async function addI(c) {
    await ItemData.create({
        itemID: 1,
        consumption: c,
        safetyStock: 5,
        reorderLevel: 3
    })
}

decreaseStock(1, 5)