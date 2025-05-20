const { genSaltSync, hashSync } = require("bcrypt");
const db = require('../../config/sequelize')
const asyncHandler = require('express-async-handler');
const { apicall_logger, apierror_logger, apisuccess_logger } = require('../middleware/logger.middleware');
const { counter_metric } = require('../middleware/mertic.middleware')
const User = db.users
var StatsD = require('node-statsd'),
    client = new StatsD();

//main work

//1. create user
const addUser = asyncHandler(async (req, res) => {

    //set a Timer
    const start = Date.now();

    const api_name = "addUser"

    counter_metric(api_name)

    apicall_logger(api_name)


    const { username, password, first_name, last_name } = req.body;

    if (!username || !password || !first_name || !last_name) {

        error_message = "username, password, first name and last name required"

        apierror_logger(error_message)

        res.status(400)
        const duration = Date.now() - start
        client.timing(`API[${api_name}]_response_time_ms`, duration)
        throw new Error(error_message)
    }

    //check username's format
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if (!username.match(emailRegex)) {
        error_message = "non-email username cannot be used for account creation"

        apierror_logger(error_message)

        res.status(400)
        const duration = Date.now() - start
        client.timing(`API[${api_name}]_response_time_ms`, duration)
        throw new Error(error_message)
    }

    //Application must return 400 Bad Request HTTP response code when a user account with the email address already exists.

    const userWithSameUsername = await User.findOne({
        where: {
            username: username
        }
    })

    if (userWithSameUsername) {
        error_message = "the username already exist"

        apierror_logger(error_message)

        res.status(400)
        const duration = Date.now() - start
        client.timing(`API[${api_name}]_response_time_ms`, duration)

        throw new Error(error_message)
    }

    //encrypt password
    const salt = genSaltSync(10);
    const salted_password = hashSync(req.body.password, salt);

    //avoid all the exception
    let info = {
        //id: req.body.id,
        name: req.body.name,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        password: salted_password,
        username: req.body.username,
    }

    const user = await User.create(info)

    const data = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        account_created: user.account_created,
        account_updated: user.account_updated,
    }
    apisuccess_logger(api_name)

    res.status(201).json({
        success: 1,
        message: data
    })
    const duration = Date.now() - start
    client.timing(`API[${api_name}]_response_time_ms`, duration)

    return
})

//2. get single user(Authenticate needed)
const getUserById = asyncHandler(async (req, res) => {

    //set a Timer
    const start = Date.now();

    const api_name = "getUserById"
    counter_metric(api_name)
    apicall_logger(api_name)

    const id = req.params.id;

    let user = await User.findOne({
        where: {
            id: id
        }
    })

    const data = {
        id: id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        account_created: user.account_created,
        account_updated: user.account_updated,
    }

    apisuccess_logger(api_name)
    res.status(200).json({
        success: 1,
        message: "OK",
        data: data
    })

    const duration = Date.now() - start
    client.timing(`API[${api_name}]_response_time_ms`, duration)
    return
})

//3. update user(Authenticate needed)
const updateUserById = asyncHandler(async (req, res) => {
    //set a Timer
    const start = Date.now();

    const api_name = "updateUserById"
    apicall_logger(api_name)
    counter_metric(api_name)

    const body = req.body;
    const { first_name, last_name, password, username } = body;


    if (!first_name || !last_name || !password) {

        error_message = "need first name, last name and password for updating"
        apierror_logger(error_message)

        res.status(400)
        const duration = Date.now() - start
        client.timing(`API[${api_name}]_response_time_ms`, duration)
        throw new Error(error_message)
    }

    //Attempt to update any other field should return 400 Bad Request HTTP response code.

    if (Object.keys(body).length >= 4 && !username) {

        error_message = "Only first name, last name and password are allowed to changed"
        apierror_logger(error_message)
        res.status(400)
        const duration = Date.now() - start
        client.timing(`API[${api_name}]_response_time_ms`, duration)

        throw new Error(error_message)
    }

    //encrypt password
    const salt = genSaltSync(10);
    const salted_password = hashSync(body.password, salt);

    const user = await User.update({
        //name: req.body.name,
        first_name: first_name,
        last_name: last_name,
        password: salted_password,
        //date_last_updated: Sequelize.NOW,

    }, { where: { id: req.params.id } })

    if (!user) {

        error_message = "user not found"
        apierror_logger(error_message)

        res.status(404)

        const duration = Date.now() - start
        client.timing(`API[${api_name}]_response_time_ms`, duration)

        throw new Error(error_message)
    }

    apisuccess_logger(api_name)
    res.status(204).json({
        success: 1,
        message: "user updated",
        data: user
    })

    const duration = Date.now() - start
    client.timing(`API[${api_name}]_response_time_ms`, duration)

    return
})

const healthz = asyncHandler((req, res) => {

    //set a Timer
    const start = Date.now();

    const api_name = "healthz"
    counter_metric(api_name)

    apicall_logger(api_name)
    apisuccess_logger(api_name)

    res.status(200).json({
        message: "healthz success"
    });

    const duration = Date.now() - start
    client.timing(`API[${api_name}]_response_time_ms`, duration)

    return
})

module.exports = {
    addUser,
    getUserById,
    updateUserById,
    healthz
}