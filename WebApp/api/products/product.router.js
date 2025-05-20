const { addProduct, updateProductById, deleteProductById, getProductById, updateProductByIdPortion } = require('./product.controller')
const { authCheck } = require('../middleware/authcheck.middleware');
const router = require('express').Router()

//authenticated
router.post("/product", authCheck, addProduct)
router.put("/product/:product_id", authCheck, updateProductById)
router.patch("/product/:product_id", authCheck, updateProductByIdPortion)
router.delete("/product/:product_id", authCheck, deleteProductById)

//public
router.get("/product/:product_id", getProductById)

module.exports = router;
