const logger = require('./logger')

function err( msg ) {
  logger.error( msg );
  throw msg;
}

module.exports = {
  err,
};
