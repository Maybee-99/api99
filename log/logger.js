const { createLogger, format, transports } = require('winston');
const path = require('path');

const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.printf(info => `[${info.timestamp}] ${info.level.toUpperCase()} - ${info.message}`)
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: path.join(__dirname, 'product-actions.log') })
  ]
});
logger.info('ເຊີເວີກຳລັງເລີ່ມຕົ້ນ');

module.exports = logger;
