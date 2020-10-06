const { format } = require('date-fns');
const logger = require('./logger');

function getKSTDate() {
  return new Date();
}

function getYesterday() {
  const yesterday = getKSTDate();
  return yesterday.setDate( yesterday.getDate() - 1 );
}

function isWrittenToday( date ) {
  return toLocalDateString( getKSTDate() ) === toLocalDateString( date );
}

function isWrittenYesterday( date ) {
  return toLocalDateString( getYesterday() ) === toLocalDateString( date );
}

function toLocalDateString( d ) { 
  return format( d, 'yyyy-MM-dd', {timezone: 'Asia/Seoul'});
}

function toLocalTimeString( d ) {
  return format( d, 'kk:mm:ss', {timezone: 'Asia/Seou'});
}

function toLocalString( d ) {
  return {
    date: toLocalDateString( d ),
    time: toLocalTimeString( d ),
  };
}

function err( msg ) {
  logger.error( msg );
  throw msg;
}

module.exports = {
  getKSTDate,
  getYesterday,
  isWrittenToday,
  isWrittenYesterday,
  toLocalDateString,
  toLocalTimeString,
  toLocalString,
  err,
};
