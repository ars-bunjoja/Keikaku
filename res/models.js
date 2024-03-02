const { DataTypes } = require('sequelize');
const { sequelize } = require('./database');

const Item = sequelize.define('Item', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING
    },
    price: {
        type: DataTypes.NUMBER
    },
    // leadTime: {
    //     type: DataTypes.NUMBER
    // },
    // maxLeadTime: {
    //     type: DataTypes.NUMBER
    // }
}, { sequelize });

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING
    },
    price: {
        type: DataTypes.NUMBER
    }
}, { sequelize });

const ProductItem = sequelize.define('ProductItem', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    productID: {
        type: DataTypes.INTEGER,
        references: {
            model: Product,
            key: 'id'
        }
    },
    quantity: {
        type: DataTypes.INTEGER
    },
    itemID: {
        type: DataTypes.INTEGER,
        references: {
            model: Item,
            key: 'id'
        }
    }
}, { sequelize });


const DailyData = sequelize.define('dailyData', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    sales: {
        type: DataTypes.NUMBER
    },
    consumption: {
        type: DataTypes.NUMBER
    },
    stock: {
        type: DataTypes.NUMBER
    },
    itemID: {
        type: DataTypes.INTEGER,
        references: {
            model: Item,
            key: 'id'
        }
    }
})
// Item.hasMany(dailyData);
DailyData.belongsTo(Item, { foreignKey: 'itemID' });

Product.belongsToMany(Item, {
    foreignKey: 'productID',
    through: ProductItem
});
Item.belongsToMany(Product, {
    foreignKey: 'itemID',
    through: ProductItem
});


// sequelize.sync({ force: true });
module.exports = { Item, Product, ProductItem, DailyData };
