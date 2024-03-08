const router = require('express').Router();
const { Item, Product, ProductItem, DailyData, ItemData } = require('./models');
const { hidden_layer, item_consumption, items_list, products_ratio } = require('./utils');
const { migrate } = require('./migrator');


router.get('', (req, res) => {
    let routes = [
        { name: "Item", url: "/item" }
    ]
    res.status(200).send({
        data: {
            message: "All systems good!",
            routes: routes
        },
        error: false
    });
})


router.post('/migrate-bom', async (req, res) => {
    if (req.body.bom) {
        await migrate();
        return res.json({
            data: {
                message: "Success"
            },
            error: false
        })
    }
    return res.json({
        data: {
            message: "Failed"
        },
        error: true
    })
})


router.post('/input', async (req, res) => {
    let pos = await hidden_layer(req.body.products, req.body.sales);
    res.json({
        data: {
            pos: pos
        },
        error: false
    })
});


router.post('/sales', async (req, res) => {
    let dailyData = await DailyData.create({
        sales: req.body.sales
    });
    await dailyData.save();
    return res.json({
        data: dailyData,
        error: false
    })
})


router.post("/consumption", async (req, res) => {
    let products = req.body.products;
    if(products.length == 0){
        return res.json({
            data: [],
            error: false
        })
    }
    let productsRatio = await products_ratio(products, req.body.sales);
    let itemsThatUsedInProducts = await items_list(products);
    let itemsConsumption = [];
    for (let i = 0; i < itemsThatUsedInProducts.length; i++) {
        let item = await Item.findByPk(itemsThatUsedInProducts[i]);
        let consumption = await item_consumption(itemsThatUsedInProducts[i], products)
        itemsConsumption.push({
            id: itemsThatUsedInProducts[i],
            name: item.name,
            price: item.price * consumption,
            consumption: consumption
        })
    }
    return res.json({
        data: {
            items: itemsConsumption,
            products: productsRatio
        },
        error: false
    })
})


// Item
router.post('/item', async (req, res) => {
    let item = await Item.create({
        name: req.body.name,
        price: req.body.price,
        maxLeadTime: req.body.maxLT,
        avgLeadTime: req.body.avgLT,
        stock: req.body.stock
    });
    return res.json({
        data: item,
        error: false
    });
});
router.post('/itemData', async (req, res) => {
    let item_data = await ItemData.create({
        itemID: req.body.itemID,
        consumption: req.body.consumption
    })
    return res.json({
        data: item_data,
        error: false
    })
});
router.get('/item', async (req, res) => {
    let item = await Item.findByPk(req.query.id);
    return res.json({
        data: item,
        error: false
    });
})
router.get('/items', async (req, res) => {
    let items = await Item.findAll();
    return res.json({
        data: items,
        error: false
    });
})


// Product
router.post('/product', async (req, res) => {
    let product = await Product.create({
        name: req.body.name,
        price: req.body.price
    });
    await product.save();
    product = {
        id: product.id,
        name: product.name,
        price: product.price,
        items: []
    }
    for (let i = 0; i < req.body.items.length; i++) {
        let productItem = await ProductItem.create({
            productID: product.id,
            itemID: Number(req.body.items[i].id),
            quantity: Number(req.body.items[i].qty)
        });
        await productItem.save();
        product.items.push(productItem);
    }
    return res.json({
        data: product,
        error: false
    });
})
router.get('/product', async (req, res) => {
    let productItems = await ProductItem.findAll({
        where: {
            productID: req.query.id
        }
    });
    let product = await Product.findByPk(req.query.id);
    product = {
        id: product.id,
        name: product.name,
        price: product.price,
        items: []
    };
    for (let i = 0; i < productItems.length; i++) {
        let item = await Item.findByPk(productItems[i].itemID);
        product.items.push({
            id: item.id,
            name: item.name,
            qty: productItems[i].quantity,
            price: item.price,
            final_price: item.price * productItems[i].quantity
        })
    }
    return res.json({
        data: product,
        error: false
    })
})
router.get('/products', async (req, res) => {
    let products = await Product.findAll();
    for (let i = 0; i < products.length; i++) {
        let productItems = await ProductItem.findAll({
            where: {
                productID: products[i].id
            }
        });
        products[i] = {
            id: products[i].id,
            name: products[i].name,
            price: products[i].price,
            items: []
        };
        for (let j = 0; j < productItems.length; j++) {
            let item = await Item.findByPk(productItems[j].itemID);
            products[i].items.push({
                id: item.id,
                name: item.name,
                qty: productItems[j].quantity,
                price: item.price,
                final_price: item.price * productItems[j].quantity
            })
        }
    }
    return res.json({
        data: products,
        error: false
    })
})




// DailyData
router.post('/dailydata', async (req, res) => {
    let dailyData = await DailyData.create({
        sales: req.body.sales,
        consumption: req.body.consumption,
        stock: req.body.stock,
        itemID: req.body.itemID
    });
    return res.json({
        data: dailyData,
        error: false
    })
})



module.exports = router