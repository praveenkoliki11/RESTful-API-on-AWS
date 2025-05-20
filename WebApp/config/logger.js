const { createLogger, transports, format } = require('winston');

const customFormat = format.combine(
    format.timestamp(),
    format.printf((info) => {
        //return `${info.timestamp} - [${info.level.toUpperCase().padEnd(7)}] : ${info.message}`
        return `[${info.level.toUpperCase().padEnd(7)}] : ${info.message}`
    }))

const logger = createLogger({
    format: customFormat,
    level: 'info',
    transports: [
        //new transports.Console({ level: 'info' }),
        new transports.File({ filename: 'csye6225-webapp.log' }),
    ]
});

module.exports = logger;