const multer = require('multer')

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const { authCheck } = require('../middleware/authcheck.middleware');
const { addImage, getImageById, deleteImageById, getImages } = require('./image.controller')

const router = require('express').Router()

//authenticated
router.get('/product/:product_id/image', authCheck, getImages)
router.post('/product/:product_id/image', authCheck, upload.single('file'), addImage)
router.get('/product/:product_id/image/:image_id', authCheck, getImageById)
router.delete('/product/:product_id/image/:image_id', authCheck, deleteImageById)

module.exports = router;
