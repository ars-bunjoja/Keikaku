const Sequelize = require('sequelize');

const dbPath = "sqlite.db"

const sequelize = new Sequelize(dbPath, '', '', {
    host: 'localhost',
    dialect: 'sqlite',
    storage: 'sqlite.db',
});

async function connect() {
    try {
        return await sequelize.authenticate();
    } catch (err) {
        if (err.name === 'SequelizeConnectionError') {
            console.error('Database file not found or connection failed.');
            return await sequelize.sync({ force: true });
        } else {
            console.error('Error connecting to database:', err.message);
        }
    }
}

module.exports = { sequelize, connect };