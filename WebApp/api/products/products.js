// const user = require('../users/users')

module.exports = (sequelize, DataTypes) => {

    Product = sequelize.define("products", {
        product_id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true

        },
        name: {
            type: DataTypes.STRING,
        },
        description: {
            type: DataTypes.TEXT,
        },
        sku: {
            type: DataTypes.STRING,
            unique: true
        },
        manufacturer: {
            type: DataTypes.STRING,
        },
        quantity: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
    },
        {
            timestamps: true,
            createdAt: 'date_added',
            updatedAt: 'date_last_updated',
        }
    )

    return Product
}