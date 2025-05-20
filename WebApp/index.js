require('dotenv').config();//this line is for the test!
const { healthz } = require('./api/users/user.controller')
const express = require('express');
const errorcheck = require('./api/middleware/errorcheck.middleware')
const app = express();

const logger = require('./config/logger');
const StatsD = require('node-statsd');

const productRouter = require('./api/products/product.router');
const userRouter = require("./api/users/user.router");
const imageRouter = require("./api/images/image.router");
app.use(express.json());

const version = "v1"

app.use(`/${version}`, userRouter);
app.use(`/${version}`, productRouter);
app.use(`/${version}`, imageRouter);

app.use(errorcheck);

app.get("/healthz", healthz)

const PORT = process.env.APP_PORT || 8000

app.listen(PORT, () => {
    logger.info(`Server up and running on PORT: ${PORT} `);
    console.log(`Server up and running on PORT: ${PORT} `);
});


module.exports = app;
