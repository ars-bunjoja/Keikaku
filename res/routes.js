const router = require('express').Router();
const { Item, Product, ProductItem, DailyData } = require('./models');


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



// Item
router.post('/item', async (req, res) => {
    let item = await Item.create({
        name: req.body.name,
        price: req.body.price
    });
    return res.json({
        data: item,
        error: false
    });
})
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
    for(let i = 0; i < req.body.items.length; i++) {
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
    for(let i = 0; i < productItems.length; i++) {
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