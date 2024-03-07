const { DataTypes } = require('sequelize');
const { ProductItem, Product, Item, DailyData, ItemData } = require('./models');
const { p_arima } = require('./forecasting');


function is_int(value) {
    return !isNaN(value) && (parseFloat(value) == parseInt(value))
}

function safety_stock(maxSale, maxLT, avgSale, avgLT) {
    return (maxSale * maxLT) - (avgSale * avgLT);
}

function reorder_level(avgSale, avgLT, stockLevel) {
    return (avgSale * avgLT) + stockLevel;
}

function optimum_level(safetyStock, reorderLevel) {
    return (safetyStock + reorderLevel);
}

async function products_ratio(products, totalSales) {
    let productsRatio = [];
    for (let i = 0; i < products.length; i++) {
        let product = await Product.findByPk(products[i].id);
        let productRatio = Math.round((product.price * products[i].qty) / totalSales);
        productsRatio.push({
            product: products[i].id,
            ratio: productRatio
        });
    }
    return productsRatio;
}

async function products_quantity(sale, products_ratio) {
    let productsQunatities = [];
    for (let i = 0; i < products_ratio.length; i++) {
        let product = await Product.findByPk(products_ratio[i].id);
        let productQuantity = Math.round((sale * products_ratio[i].ratio) / product.price);
        productsQunatities.push({
            product: products_ratio[i].id,
            quantity: productQuantity
        })
    }
    return productsQunatities
}

async function items_list(products) {
    let items = [];
    for (let i = 0; i < products.length; i++) {
        let productItems = await ProductItem.findAll({
            where: {
                productID: products[i].id
            }
        })
        for (let j = 0; j < productItems.length; j++) {
            items.push(productItems[j].itemID);
        }
    }
    return items.filter((value, index, self) => self.indexOf(value) === index);
}

async function item_consumption(itemID, products) {
    let consumption = 0;
    for (let i = 0; i < products.length; i++) {
        let productItems = await ProductItem.findAll({
            where: {
                productID: products[i].id
            }
        })
        for (let j = 0; j < productItems.length; j++) {
            if (productItems[j].itemID == itemID) {
                consumption += (productItems[j].quantity * products[i].qty);
            }
        }
    }
    return consumption;
}

async function decrease_stock(itemID, qty, safetyStock, reorderLevel) {
    let item = await Item.findByPk(itemID);
    item.stock = item.stock - qty;
    await item.save();

    await ItemData.create({
        consumption: qty,
        itemID: itemID,
        safetyStock: safetyStock,
        reorderLevel: reorderLevel
    });
}

async function add_sale(sale) {
    await DailyData.create({
        sales: sale
    })
}

async function get_mrp_variables(itemID, lastConsumption) {
    let item = await Item.findByPk(itemID);
    let previousConsumptions = await ItemData.findAll({
        where: {
            itemID: itemID
        }
    });
    if (previousConsumptions.length == 0) {
        return [0, 0, 0, 0];
    }
    previousConsumptions.push({ consumption: lastConsumption });
    previousConsumptions.sort((a, b) => a.consumption - b.consumption);
    let totalConsumption = 0;
    for (let i = 0; i < previousConsumptions.length; i++) {
        totalConsumption += previousConsumptions[i].consumption;
    }
    let maxConsumption = previousConsumptions[previousConsumptions.length - 1].consumption;
    let avgConsumption = totalConsumption / previousConsumptions.length;
    let safetyStock = safety_stock(maxConsumption, item.maxLeadTime, avgConsumption, item.leadTime);
    let reorderLevel = reorder_level(avgConsumption, item.leadTime, safetyStock);
    let consumptionTimeInDays = reorderLevel / avgConsumption;
    let currentStock = item.stock;
    await decrease_stock(itemID, lastConsumption, safetyStock, reorderLevel);
    return [consumptionTimeInDays, currentStock, reorderLevel, safetyStock];
}


async function generate_po(productsList, lastStockDates) {
    let itemsThatUsedInProducts = await items_list(productsList);
    let itemsConsumption = [];
    for (let i = 0; i < itemsThatUsedInProducts.length; i++) {
        let consumption = await item_consumption(itemsThatUsedInProducts[i], productsList);
        let [stockDays, currentStock, reorderLevel, safetyStock] = await get_mrp_variables(itemsThatUsedInProducts[i], consumption);
        let thisItemDate = lastStockDates[i].filter(x => x.id == itemsThatUsedInProducts[i]) || new Date();
        thisItemDate.setDate(thisItemDate.getDate() + stockDays);
        let po_qty = (safetyStock + reorderLevel) - currentStock;
        itemsConsumption.push({
            id: itemsThatUsedInProducts[i],
            consumption: consumption,
            po: { qty: po_qty, date: thisItemDate }
        });
    }
    return itemsConsumption;
}

async function hidden_layer(productsList, current_sale) {
    let purchaseOrders = [];
    let previousSales = await DailyData.findAll();
    previousSales = previousSales.map(x => x.sales);
    previousSales.push(current_sale);
    let futureSales = p_arima(previousSales);
    let productsRatio = await products_ratio(productsList, current_sale);
    let currentItemsDate = []
    for (let i = 0; i < futureSales.length; i++) {
        let productsQuantity = await products_quantity(futureSales[i], productsRatio);
        let purchaseOrder = await generate_po(productsQuantity);
        currentItemsDate = purchaseOrder.map(x => [x.id, x.po.date]);
        purchaseOrders.push(purchaseOrder);
    }
    return purchaseOrders;
};

module.exports = { is_int, hidden_layer };