const { addUser, updateUserById, deleteUserById, getUserById, healthz } = require('./user.controller')
const { authCheck } = require('../middleware/authcheck.middleware');
const router = require("express").Router();

// public 
router.post("/user", addUser)
//router.get("/health", healthz);

//authenticated
router.get("/user/:id", authCheck, getUserById);
router.put("/user/:id", authCheck, updateUserById);

module.exports = router;
