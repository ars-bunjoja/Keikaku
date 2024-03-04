const { DataTypes } = require('sequelize');
const { ProductItem, Product, Item, DailyData, ItemData } = require('./models');


function is_int(value) {
    return !isNaN(value) && (parseFloat(value) == parseInt(value))
}

function safetyStock(maxSale, maxLT, avgSale, avgLT) {
    return (maxSale*maxLT) - (avgSale*avgLT);
}

function reorderLevel(avgSale, avgLT, stockLevel) {
    return (avgSale*avgLT) + stockLevel;
}

function optimumLevel(safetyStock, reorderLevel) {
    return (safetyStock + reorderLevel);
}

async function productRatio(productID, totalSales) {
    let product = await Product.findByPk(productID.id);
    return Math.round(((product.price*productID.qty)/totalSales)*100);
}

async function itemsList(products) {
    let items = [];
    for(let i = 0; i < products.length; i++) {
        let productItems = await ProductItem.findAll({
            where: {
                productID: products[i].id
            }
        })
        for(let j = 0; j < productItems.length; j++) {
            items.push(productItems[j].itemID);
        }
    }
    return items;
}

async function itemConsumption(itemID, products) {
    let consumption = 0;
    for(let i = 0; i < products.length; i++) {
        let productItems = await ProductItem.findAll({
            where: {
                productID: products[i].id
            }
        })
        for(let j = 0; j < productItems.length; j++) {
            if(productItems[j].itemID == itemID) {
                consumption += (productItems[j].quantity*products[i].qty);
            }
        }
    }
    return consumption;
}

async function decreaseStock(itemID, qty) {
    let item = await Item.findByPk(itemID);
    item.stock = item.stock - qty;
    await item.save();
    let previousConsumptions = await ItemData.findAll({
        where: {
            itemID: itemID
        }
    });

    await ItemData.create({
        consumption: qty,
        itemID: itemID,
        safetyStock: 0,
        reorderLevel: 0
    });

    if(previousConsumptions.length == 0) {
        return [0, 0, 0, 0];
    }

    previousConsumptions.sort((a, b) => a.consumption - b.consumption);
    console.log(previousConsumptions);
    let totalConsumption = 0;
    for(let i = 0; i < previousConsumptions.length; i++) {
        totalConsumption += previousConsumptions[i].consumption;
    }
    let maxConsumption = previousConsumptions[previousConsumptions.length-1].dataValues.consumption;
    let avgConsumption = totalConsumption/previousConsumptions.length;
    let SafetyStock = safetyStock(maxConsumption, item.maxLeadTime, avgConsumption, item.leadTime);
    let ReorderLevel = reorderLevel(avgConsumption, item.leadTime, SafetyStock);
    let consumptionTimeInDays = ReorderLevel/avgConsumption;
    let currentStock = item.stock;
    return [consumptionTimeInDays, currentStock, ReorderLevel, SafetyStock];
}

module.exports = { is_int, itemsList, itemConsumption, productRatio, decreaseStock };