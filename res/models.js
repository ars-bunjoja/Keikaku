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
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    price: {
        type: DataTypes.NUMBER,
        allowNull: false
    },
    stock: {
        type: DataTypes.NUMBER,
        allowNull: false
    },
    leadTime: {
        type: DataTypes.NUMBER,
        allowNull: false
    },
    maxLeadTime: {
        type: DataTypes.NUMBER,
        allowNull: false
    }
}, { sequelize });

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    price: {
        type: DataTypes.NUMBER,
        allowNull: false
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
        allowNull: false,
        references: {
            model: Product,
            key: 'id'
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    itemID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Item,
            key: 'id'
        }
    }
}, { sequelize });

const DailyData = sequelize.define('DailyData', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    sales: {
        type: DataTypes.NUMBER,
        allowNull: false
    }
});

const ItemData = sequelize.define('ItemData', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    consumption: {
        type: DataTypes.NUMBER,
        allowNull: false
    },
    safetyStock: {
        type: DataTypes.NUMBER,
        allowNull: false
    },
    reorderLevel: {
      type: DataTypes.NUMBER,
      allowNull: false  
    },
    itemID: {
        type: DataTypes.INTEGER,
        references: {
            model: Item,
            key: 'id'
        }
    }
})

ItemData.belongsTo(Item, { foreignKey: 'itemID' });
Product.belongsToMany(Item, {
    foreignKey: 'productID',
    through: ProductItem
});
Item.belongsToMany(Product, {
    foreignKey: 'itemID',
    through: ProductItem
});
module.exports = { Item, Product, ProductItem, DailyData, ItemData, sequelize };