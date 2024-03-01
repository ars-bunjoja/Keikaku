const { DataTypes } = require('sequelize');



function is_int(value) {
    return !isNaN(value) && (parseFloat(value) == parseInt(value))
}

module.exports = { is_int };

