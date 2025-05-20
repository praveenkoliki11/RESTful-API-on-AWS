const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3')
const dotenv = require('dotenv')
const asyncHandler = require('express-async-handler');
const crypto = require('crypto')
const { apicall_logger, apierror_logger, apisuccess_logger } = require('../middleware/logger.middleware');
const { counter_metric } = require('../middleware/mertic.middleware')

const db = require('../../config/sequelize')

//create main model
const Image = db.images
const User = db.users
const Product = db.products

const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

const bucket_name = process.env.BUCKET_NAME;
const bucket_region = process.env.BUCKET_REGION;

const s3 = new S3Client({
    region: bucket_region,
})

var StatsD = require('node-statsd'),
    client = new StatsD();

//main work

//1. create Image(need owner id)
const addImage = asyncHandler(async (req, res) => {
    //set a Timer
    const start = Date.now();
    const api_name = "addImage"
    apicall_logger(api_name)
    counter_metric(api_name)
    if (!req.file) {
        error_message = "file is required"
        apierror_logger(error_message)

        res.status(400);

        const duration = Date.now() - start
        client.timing(`API[${api_name}]_response_time_ms`, duration)
        throw new Error(error_message)
    }

    const file_name = randomImageName()

    let product_id = req.params.product_id

    //check the uploading file type
    //You must add support for popular file types such as jpeg, jpg, png, etc.
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedMimes.includes(req.file.mimetype)) {
        error_message = "only image file is allowed"
        apierror_logger(error_message)

        res.status(400)
        const duration = Date.now() - start
        client.timing(`API[${api_name}]_response_time_ms`, duration)
        throw new Error(error_message)
    }

    const params = {
        Bucket: bucket_name,
        Key: file_name,
        Body: req.file.buffer,
        Metadata: {
            'Content-Type': req.file.mimetype,
        }
    }

    const command = new PutObjectCommand(params)

    await s3.send(command);

    //store in mysql
    const image = await Image.create({
        product_id: Number(product_id),
        file_name: file_name,
        s3_bucket_path: `s3://${params.Bucket}/${params.Key}`
    })

    let showINFO = {
        image_id: image.image_id,
        product_id: image.product_id,
        file_name: image.file_name,
        date_created: image.date_created,
        s3_bucket_path: image.s3_bucket_path
    }

    apisuccess_logger(api_name)
    res.status(201).json({
        success: 1,
        message: "Image created",
        data: showINFO
    })
    const duration = Date.now() - start
    client.timing(`API[${api_name}]_response_time_ms`, duration)

    return
})

//2. get single Image by ID
const getImageById = asyncHandler(async (req, res) => {
    //set a Timer
    const start = Date.now();
    const api_name = "getImageById"
    apicall_logger(api_name)
    counter_metric(api_name)
    let product_id = req.params.product_id
    let image_id = req.params.image_id

    let image = await Image.findOne({
        where: {
            image_id: image_id,
            product_id: product_id
        }
    })

    //if image ID doesn't exist
    if (!image) {
        error_message = "no such image ID under this product"
        apierror_logger(error_message)
        res.status(400)
        const duration = Date.now() - start
        client.timing(`API[${api_name}]_response_time_ms`, duration)
        throw new Error(error_message)
    }

    let showINFO = {
        image_id: image.image_id,
        product_id: image.product_id,
        file_name: image.file_name,
        date_created: image.date_created,
        s3_bucket_path: image.s3_bucket_path
    }

    apisuccess_logger(api_name)
    res.status(200).json({
        success: 1,
        message: "OK",
        data: showINFO
    })
    const duration = Date.now() - start
    client.timing(`API[${api_name}]_response_time_ms`, duration)

    return
})

//3. get List of All Images Uploaded
const getImages = asyncHandler(async (req, res) => {
    //set a Timer
    const start = Date.now();
    const api_name = "getImages"
    apicall_logger(api_name)
    counter_metric(api_name)
    let product_id = req.params.product_id

    let image = await Image.findAll({
        where: {
            product_id: product_id
        }
    })

    //if image ID doesn't exist
    if (!image) {
        error_message = "no such image ID under this product"
        apierror_logger(error_message)

        res.status(400)
        const duration = Date.now() - start
        client.timing(`API[${api_name}]_response_time_ms`, duration)
        throw new Error(error_message)
    }

    var i = 0
    const showINFO_list = []
    while (i < image.length) {
        let showINFO = {
            image_id: image[i].image_id,
            product_id: image[i].product_id,
            file_name: image[i].file_name,
            date_created: image[i].date_created,
            s3_bucket_path: image[i].s3_bucket_path
        }
        showINFO_list.push(showINFO)
        i++
    }

    apisuccess_logger(api_name)
    res.status(200).json({
        success: 1,
        message: "OK",
        data: showINFO_list
    })
    const duration = Date.now() - start
    client.timing(`API[${api_name}]_response_time_ms`, duration)

    return
})

//4. delete Image(need user id)
const deleteImageById = asyncHandler(async (req, res) => {
    //set a Timer
    const start = Date.now();
    const api_name = "deleteImageById"
    apicall_logger(api_name)
    counter_metric(api_name)
    let product_id = req.params.product_id
    let image_id = req.params.image_id

    const imageForCheck = await Image.findOne(
        {
            where: {
                image_id: image_id,
                product_id: product_id
            }
        })

    //if image ID doesn't exist
    if (!imageForCheck) {
        error_message = "image ID not found"
        apierror_logger(error_message)

        res.status(404)

        const duration = Date.now() - start
        client.timing(`API[${api_name}]_response_time_ms`, duration)
        throw new Error(error_message)
    }

    const deleteObjectParams = {
        Bucket: bucket_name,
        Key: imageForCheck.file_name
    }

    const command = new DeleteObjectCommand(deleteObjectParams);
    await s3.send(command)

    await Image.destroy(
        {
            where: {
                image_id: image_id,
                product_id: product_id
            }
        })

    apisuccess_logger(api_name)
    res.status(204).json({
        success: 1,
        message: "image delete success"
    })
    const duration = Date.now() - start
    client.timing(`API[${api_name}]_response_time_ms`, duration)

    return
})

module.exports = {
    addImage,
    getImageById,
    deleteImageById,
    getImages
}

