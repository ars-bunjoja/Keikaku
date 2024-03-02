const { DataTypes } = require('sequelize');



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

module.exports = { is_int };



