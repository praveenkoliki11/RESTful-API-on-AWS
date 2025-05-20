const { compareSync } = require("bcrypt");
const { apierror_logger } = require('./logger.middleware');
const db = require('../../config/sequelize')

const User = db.users
const Product = db.products
const Image = db.images

//get system user id
const authCheck = async (req, res, next) => {
    //no auth
    if (!req.get("authorization")) {

        error_message = "Authentication failed: no auth"
        apierror_logger(error_message)

        return res.status(401).json({
            success: 0,
            message: error_message
        })
    }

    const credentials = Buffer.from(req.get("authorization").split(' ')[1], 'base64').
        toString().
        //ownername:password
        split(':')
    //['ownername':'password']

    system_username = credentials[0]
    password = credentials[1]

    if (!system_username || !password) {

        error_message = "Authentication failed: username and password required"
        apierror_logger(error_message)

        return res.status(400).json({
            success: 0,
            message: error_message
        })
    }

    system_user = await User.findOne({
        where: {
            username: system_username
        }
    })

    //owner not found
    //console.log("system_user id: ", system_user.id);
    if (!system_user) {

        error_message = "Authentication failed: username doesn't exist"
        apierror_logger(error_message)

        return res.status(401).json({
            success: 0,
            message: error_message
        })
    }

    //password unmatched
    if (!compareSync(password, system_user.password)) {
        error_message = "Authentication failed: wrong password"
        apierror_logger(error_message)

        return res.status(401).json({
            success: 0,
            message: error_message
        })
    }

    //403 issue
    if (req.params.id) {
        if (system_user.id != req.params.id) {

            // console.log("system_user.id: ", system_user.id)
            // console.log("req.params.id: ", req.params.id)

            error_message = "couldn't reach other user's data"
            apierror_logger(error_message)

            return res.status(403).json({
                success: 0,
                message: error_message
            })
        }
    }

    if (req.params.product_id) {

        let productForCheck = await Product.findOne({
            where: {
                product_id: req.params.product_id
            }
        })

        if (!productForCheck) {
            error_message = "product not found"
            apierror_logger(error_message)

            return res.status(404).json({
                success: 0,
                message: error_message
            })
        }

        if (system_user.id != productForCheck.owner_user_id) {
            error_message = "couldn't reach other user's data"
            apierror_logger(error_message)

            return res.status(403).json({
                success: 0,
                message: error_message
            })
        }
    }

    if (req.params.image_id) {
        let image = await Image.findAll({
            where: {
                product_id: req.params.product_id
            }
        })

        //if image ID doesn't exist
        if (!image) {
            error_message = "no such image ID under this product"
            apierror_logger(error_message)

            res.status(400).json({
                success: 0,
                message: error_message
            })

            return
        }
    }

    next();
}

module.exports = {
    authCheck,
}
