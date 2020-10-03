const { format } = require('date-fns');

function getKSTDate() {
  return new Date();
}

function isWrittenToday( date ) {
  return toLocalDateString( getKSTDate() ) === toLocalDateString( date );
}

function isWrittenYesterday( date ) {
  const yesterday = getKSTDate();
  yesterday.setDate( yesterday.getDate() - 1 );
  return toLocalDateString( yesterday ) === toLocalDateString( date );
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

module.exports = {
  getKSTDate,
  isWrittenToday,
  isWrittenYesterday,
  toLocalDateString,
  toLocalTimeString,
  toLocalString,
};
