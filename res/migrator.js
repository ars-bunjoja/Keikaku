const fs = require('fs');
const bom = fs.readFileSync('./bom.csv', 'utf-8');
const { Item, Product, ProductItem, sequelize } = require('./models');

function generateID(item) {
    let id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return {
        id: id,
        name: item.name,
        price: item.price,
        maxLT: item.maxLT,
        avgLT: item.avgLT
    }
}

async function BomCsvMigrate(data) {
    let rows = data.split('\n');
    let whole = [];
    let items = [], products = [];
    for (let i = 0; i < rows.length - 1; i++) {
        whole.push(rows[i].replace("\r", "").split(','));
    }
    let transposed = whole.map(arr => arr.map((val, i) => whole.map(row => row[i])));
    transposed = transposed[0];
    for (let i = 0; i < whole[0].length - 4; i++) {
        let product = {
            name: whole[0][i],
            price: whole[0][i + 1],
            items: []
        }
        for (let j = 1; j < whole.length; j++) {
            if (whole[j][i].length > 1) {
                product.items.push({
                    name: whole[j][i],
                    qty: whole[j][i + 1],
                });
            }
        }
        products.push(product);
        i = i + 1;
    }
    for (let i = 1; i < whole.length; i++) {
        for (let j = 0; j < whole[i].length - 4; j++) {
            if (whole[i][j].length > 1) {
                items.push(whole[i][j]);
                j = j + 1;
            }
        }
    }
    items = items.filter((item, index) => items.indexOf(item) === index);
    for(let i = 1; i < transposed[transposed.length-1].length; i++) {
        items[i-1] = {
            name: items[i-1],
            price: transposed[transposed.length-4][i],
            maxLT: transposed[transposed.length-3][i],
            avgLT: transposed[transposed.length-2][i],
            stock: transposed[transposed.length-1][i]
        }
        let database_item = await Item.create({
            name: items[i-1].name,
            price: items[i-1].price,
            maxLeadTime: items[i-1].maxLT,
            leadTime: items[i-1].avgLT,
            stock: items[i-1].stock
        })
        await database_item.save();
        items[i-1].id = database_item.id;
    }
    products.forEach(product => {
        product.items.forEach(productItem => {
            items.forEach(item => {
                if(productItem.name == item.name) {
                    productItem.id = item.id;
                }
            })
        })
    })
    for(let i = 0; i < products.length; i++) {
        let database_product = await Product.create({
            name: products[i].name,
            price: products[i].price
        });
        await database_product.save();
        for(let j = 0; j < products[i].items.length; j++) {
            let database_product_item = await ProductItem.create({
                productID: database_product.id,
                itemID: products[i].items[j].id,
                quantity: products[i].items[j].qty
            })
            await database_product_item.save();
        }
    }
}

async function migrate() {
    await sequelize.sync({ force: true });
    await BomCsvMigrate(bom);
}
// main();

module.exports = {
    migrate
}