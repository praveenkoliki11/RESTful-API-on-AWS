const { Sequelize, DataTypes } = require('sequelize')
// const logger = require('./logger')

const sequelize = new Sequelize(
    `${process.env.DB_NAME}`, //`csye6225`    local_database and cloud database are same
    `${process.env.DB_USERNAME}`, //user
    `${process.env.DB_PASSWORD}`, //password
    {
        host: `${process.env.DB_HOSTNAME}`,
        dialect: 'mysql',
        logging: false,
        port: 3306,

        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
)

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

db.users = require('../api/users/users')(sequelize, DataTypes)
db.products = require('../api/products/products')(sequelize, DataTypes)
db.images = require('../api/images/images')(sequelize, DataTypes)

//One-to-many relationship
db.users.hasMany(db.products, {
    foreignKey: 'owner_user_id'
});
db.products.hasMany(db.images, {
    foreignKey: 'product_id'
});


db.sequelize.sync({
    force: true
}).then(() => {
    console.log('re-sync done!')
}).catch((err) => {
    console.error('Error connecting to database: ', err);
    console.log("Connection failed");
})

module.exports = db