const { DataTypes } = require('sequelize');
const {sequelize} = require('./database');

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
  }
}, {sequelize});

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
}, {sequelize});

const ProductItem = sequelize.define('ProductItem', {
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
}, {sequelize});

Product.belongsToMany(Item, {
  foreignKey: 'itemID',
  through: ProductItem
});
Item.belongsToMany(Product, {
  foreignKey: 'productID',
  through: ProductItem
});


// sequelize.sync();

module.exports = { Item, Product, ProductItem };
