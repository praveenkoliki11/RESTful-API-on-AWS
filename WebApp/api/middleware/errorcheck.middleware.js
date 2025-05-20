const { apierror_logger } = require('./logger.middleware');

const errorcheck = async (err, req, res, next) => {
    //log
    apierror_logger(err.message);

    //Status code
    const statusCode = res.statusCode == 200 ? 500 : res.statusCode;
    res.status(res.statusCode)

    //Message
    res.json({
        success: false,
        message: err.message,
    });
}

module.exports = errorcheck;