const { DataTypes } = require('sequelize');
const { ProductItem, Product, Item, DailyData } = require('./models');


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
    let product = await Product.findByPk(productID);
    return Math.round((product.price/totalSales)*100);
}

async function itemsList(products) {
    let items = [];
    for(let i = 0; i < products.length; i++) {
        let product = await Product.findByPk(products[i]);
        let productItems = await ProductItem.findAll({
            where: {
                productID: products[i]
            }
        })
        for(let j = 0; j < productItems.length; j++) {
            items.push(productItems[j].itemID);
        }
    }
    return items;
}

async function itemConsumption(itemID, products) {
    let item = await Item.findByPk(itemID);
    let consumption = 0;
    for(let i = 0; i < products.length; i++) {
        let product = await Product.findByPk(products[i]);
        let productItems = await ProductItem.findAll({
            where: {
                productID: products[i]
            }
        })
        for(let j = 0; j < productItems.length; j++) {
            if(productItems[j].itemID == itemID) {
                consumption += productItems[j].quantity;
            }
        }
    }
}


function test() {
    
}



module.exports = { is_int };



