const { sequelize } = require('./database');
const { Item, Product, ProductItem } = require('./models');


async function createItem(item_name, item_price) {
    let item = await Item.create({
        name: item_name,
        price: item_price
    })
    await item.save();
    return JSON.stringify(item)
}
async function updateItem(pk, item_name, item_price) {
    let item = await Item.findByPk(pk);
    item.name = item_name;
    item.price = item_price;
    await item.save();
    return JSON.stringify(item);
}
async function listItems() {
    let items = await Item.findAll();
    return JSON.stringify(items);   
}
async function listItem(pk) {
    let item = await Item.findByPk(pk);
    return JSON.stringify(item);
}
async function deleteItem(pk) {
    let item = await Item.findByPk(pk);
    await item.destroy();
    return JSON.stringify(item);
}



async function createProduct(items, product) {
    let prod = await Product.create({
        name: product.name,
        price: product.price
    })
    await prod.save();
    for (let i = 0; i < items.length; i++) {
        let productItem = await ProductItem.create({
            productID: prod.id,
            itemID: items[i].id,
            quantity: items[i].qty
        });
        await productItem.save();
    }
    return JSON.stringify(prod);
}
async function updateProduct(pk, items, product) {
    let prod = await Product.findByPk(pk);
    prod.name = product.name;
    prod.price = product.price;
    await prod.save();
    for (let i = 0; i < items.length; i++) {
        let productItem = await ProductItem.create({
            productID: prod.id,
            itemID: items[i].id,
            quantity: items[i].qty
        })
        await productItem.save();
    }
    return JSON.stringify(prod);
}





async function main() {
    
}
main()
