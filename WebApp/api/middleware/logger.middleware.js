const logger = require('../../config/logger');

//custom logger
const apicall_logger = async (req, res) => {
    logger.info({
        message: `API [${req}] called `
    });
}

//custom logger
const apierror_logger = async (req, res) => {
    logger.error({
        message: `${req}`
    });
}

const apisuccess_logger = async (req, res) => {
    logger.info({
        message: `[${req}] success `
    });
}



module.exports = {
    apicall_logger,
    apierror_logger,
    apisuccess_logger
}