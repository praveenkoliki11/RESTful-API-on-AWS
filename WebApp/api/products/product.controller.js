const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3')
const db = require('../../config/sequelize')
const dotenv = require('dotenv');
const asyncHandler = require('express-async-handler');
const { apicall_logger, apierror_logger, apisuccess_logger } = require('../middleware/logger.middleware');
const { counter_metric } = require('../middleware/mertic.middleware')

//create main model
const Product = db.products
const User = db.users
const Image = db.images

const bucket_name = process.env.BUCKET_NAME;
const bucket_region = process.env.BUCKET_REGION;

const s3 = new S3Client({
    region: bucket_region,
});

var StatsD = require('node-statsd'),
    client = new StatsD();

//1. create product(need owner id)
const addProduct = asyncHandler(async (req, res) => {
    //set a Timer
    const start = Date.now();

    const api_name = "addProduct"

    counter_metric(api_name)
    apicall_logger(api_name)

    if (!req.body.name || !req.body.description || !req.body.sku || !req.body.manufacturer || req.body.quantity === null) {

        error_message = "name, description, sku, manufacturer and quantity required "
        apierror_logger(error_message)

        res.status(400)
        const duration = Date.now() - start
        client.timing(`API[${api_name}]_response_time_ms`, duration)

        throw new Error(error_message)
    }

    //Product SKU should be unique. Adding 2nd product with the same SKU should return an error.
    const productwithSameSKU = await Product.findOne({
        where: {
            sku: req.body.sku
        }
    })

    if (productwithSameSKU) {
        error_message = "cannot add a product whose SKU already used"
        apierror_logger(error_message)
        res.status(400)
        const duration = Date.now() - start
        client.timing(`API[${api_name}]_response_time_ms`, duration)

        throw new Error(error_message)
    }

    const { name, description, sku, manufacturer, quantity } = req.body;

    if (Object.keys(req.body).length > 5) {

        error_message = "only name, description, sku, manufacturer and quantity are allowed"
        apierror_logger(error_message)

        res.status(400)
        const duration = Date.now() - start
        client.timing(`API[${api_name}]_response_time_ms`, duration)

        throw new Error(error_message)
    }

    //quantity: 0-100, no decimal
    if (typeof quantity == 'string' || quantity > 100 || quantity < 0 || quantity - Math.floor(quantity) !== 0) {

        error_message = "quantity should be Integer in scope [0,100]"
        apierror_logger(error_message)
        res.status(400)
        const duration = Date.now() - start
        client.timing(`API[${api_name}]_response_time_ms`, duration)

        throw new Error(error_message)
    }

    //avoid all the exception
    let info = {
        //id: req.body.id,
        name: req.body.name,
        description: req.body.description,
        sku: req.body.sku,
        manufacturer: req.body.manufacturer,
        quantity: req.body.quantity,
        //date_added: Sequelize.NOW,
        //date_last_updated: Sequelize.NOW,
        owner_user_id: system_user.id
    }

    const product = await Product.create(info)

    let showINFO = {
        product_id: product.id,
        name: product.name,
        description: product.description,
        sku: product.sku,
        manufacturer: product.manufacturer,
        quantity: product.quantity,
        date_added: product.date_added,
        date_last_updated: product.date_last_updated,
        owner_user_id: product.owner_user_id
    }

    apisuccess_logger(api_name)
    res.status(201).json({
        success: 1,
        message: "Product created",
        data: showINFO
    })
    const duration = Date.now() - start
    client.timing(`API[${api_name}]_response_time_ms`, duration)

    return
})

//2. get single product
const getProductById = asyncHandler(async (req, res) => {
    //set a Timer
    const start = Date.now();

    const api_name = "getProductById"
    apicall_logger(api_name)
    counter_metric(api_name)

    let product = await Product.findOne({
        where: {
            product_id: req.params.product_id
        }
    })

    //if product ID doesn't exist
    if (!product) {
        error_message = "product ID doesn't exist"
        apierror_logger(error_message)
        res.status(400)
        const duration = Date.now() - start
        client.timing(`API[${api_name}]_response_time_ms`, duration)
        throw new Error(error_message)
    }

    apisuccess_logger(api_name)
    res.status(200).json({
        success: 1,
        message: "OK",
        data: product
    })
    const duration = Date.now() - start
    client.timing(`API[${api_name}]_response_time_ms`, duration)

    return
})

//3. update product(need owner id)
const updateProductById = asyncHandler(async (req, res) => {
    //set a Timer
    const start = Date.now();

    const api_name = "updateProductById"
    apicall_logger(api_name)
    counter_metric(api_name)


    const { name, description, sku, manufacturer, quantity } = req.body;

    if (!name || !description || !sku || !manufacturer || quantity === null) {

        error_message = "name, description, sku, manufacturer and quantity required, they can't be null"
        apierror_logger(error_message)
        res.status(400)
        const duration = Date.now() - start
        client.timing(`API[${api_name}]_response_time_ms`, duration)
        throw new Error(error_message)
    }
    if (Object.keys(req.body).length > 5) {
        error_message = "only name, description, sku, manufacturer and quantity are allowed"
        apierror_logger(error_message)
        res.status(400)
        const duration = Date.now() - start
        client.timing(`API[${api_name}]_response_time_ms`, duration)
        throw new Error(error_message)
    }

    let productForCheck = await Product.findOne({
        where: {
            product_id: req.params.product_id
        }
    })

    //if SKU has changed
    if (req.body.sku && (req.body.sku !== productForCheck.sku)) {
        const productwithSameSKU = await Product.findOne({
            where: {
                sku: req.body.sku
            }
        })

        if (productwithSameSKU) {
            error_message = "cannot update a product with the SKU already exist"
            apierror_logger(error_message)
            res.status(400)
            const duration = Date.now() - start
            client.timing(`API[${api_name}]_response_time_ms`, duration)
            throw new Error(error_message)
        }
    }

    //quantity: 0-100, no decimal
    if (typeof quantity == 'string' || (quantity > 100 || quantity < 0 || quantity - Math.floor(quantity) !== 0)) {
        error_message = "quantity should be Integer in scope [0,100]"

        apierror_logger(error_message)
        res.status(400)
        const duration = Date.now() - start
        client.timing(`API[${api_name}]_response_time_ms`, duration)
        throw new Error(error_message)
    }

    //success
    const product = await Product.update({
        name: req.body.name,
        description: req.body.description,
        manufacturer: req.body.manufacturer,
        quantity: req.body.quantity,
        sku: req.body.sku || sku
        //date_last_updated: Sequelize.NOW,

    }, { where: { product_id: req.params.product_id } })

    apisuccess_logger(api_name)
    res.status(204).json({
        success: 1,
        message: "product updated",
        data: product
    })
    const duration = Date.now() - start
    client.timing(`API[${api_name}]_response_time_ms`, duration)

    return
})

//4. delete product(need user id)
const deleteProductById = asyncHandler(async (req, res) => {

    //set a Timer
    const start = Date.now();
    const api_name = "deleteProductById"
    apicall_logger(api_name)
    counter_metric(api_name)

    //avoid all the exception
    const image = await Image.findAll(
        {
            where: {
                product_id: req.params.product_id
            }
        }
    )

    //first: delete every image under this product

    var i = 0
    while (i < image.length) {
        const deleteObjectParams = {
            Bucket: bucket_name,
            Key: image[i].file_name
        }
        const command = new DeleteObjectCommand(deleteObjectParams);
        await s3.send(command)
        await Image.destroy(
            {
                where: {
                    file_name: image[i].file_name
                }
            }
        )
        i++
    }

    await Product.destroy(
        { where: { product_id: req.params.product_id } })

    apisuccess_logger(api_name)
    res.status(204).json({
        success: 1,
        message: "product delete success"
    })
    const duration = Date.now() - start
    client.timing(`API[${api_name}]_response_time_ms`, duration)

    return
})

//5. update partial product(need owner id)
const updateProductByIdPortion = asyncHandler(async (req, res) => {
    //set a Timer
    const start = Date.now();

    const api_name = "updateProductByIdPortion"
    apicall_logger(api_name)
    counter_metric(api_name)

    const { name, description, sku, manufacturer, quantity } = req.body;

    let productForCheck = await Product.findOne({
        where: {
            product_id: req.params.product_id
        }
    })

    //if SKU has changed
    if (sku && (sku !== productForCheck.sku)) {
        const productwithSameSKU = await Product.findOne({
            where: {
                sku: req.body.sku
            }
        })

        if (productwithSameSKU) {
            error_message = "cannot update a product with the SKU already exist"
            apierror_logger(error_message)
            res.status(400)
            const duration = Date.now() - start
            client.timing(`API[${api_name}]_response_time_ms`, duration)
            throw new Error(error_message)
        }
    }
    //quantity: 0-100, no decimal
    if (quantity) {
        if (typeof quantity == 'string' || quantity > 100 || quantity < 0 || quantity - Math.floor(quantity) !== 0) {
            error_message = "quantity should be Integer in scope [0,100]"
            apierror_logger(error_message)
            res.status(400)
            const duration = Date.now() - start
            client.timing(`API[${api_name}]_response_time_ms`, duration)
            throw new Error(error_message)
        }
    }

    const product = await Product.update({
        name: req.body.name || name,
        description: req.body.description || description,
        sku: req.body.sku || sku,
        manufacturer: req.body.manufacturer || manufacturer,
        quantity: req.body.quantity || quantity,

    }, { where: { product_id: req.params.product_id } })

    apisuccess_logger(api_name)
    res.status(204).json({
        success: 1,
        message: "product updated",
        //data: product
    })
    const duration = Date.now() - start
    client.timing(`API[${api_name}]_response_time_ms`, duration)

    return
})

module.exports = {
    addProduct,
    getProductById,
    updateProductById,
    deleteProductById,
    updateProductByIdPortion
}

