const { format } = require('date-fns');

function getKSTDate() {
  return new Date();
}

function getYesterday() {
  const yesterday = getKSTDate();
  return yesterday.setDate( yesterday.getDate() - 1 );
}

function isWrittenToday( date ) {
  return toLocaleDateString( getKSTDate() ) === toLocaleDateString( date );
}

function isWrittenYesterday( date ) {
  return toLocaleDateString( getYesterday() ) === toLocaleDateString( date );
}

function toLocaleDateString( d ) { 
  return format( d, 'yyyy-MM-dd', {timezone: 'Asia/Seoul'});
}

function toLocaleTimeString( d ) {
  return format( d, 'kk:mm:ss', {timezone: 'Asia/Seou'});
}

function toLocaleString( d ) {
  return {
    date: toLocaleDateString( d ),
    time: toLocaleTimeString( d ),
  };
}

function formattingDate( date, y, m, d='' ) {
  return format( date, `yyyy${y}MM${m}dd${d}` );
}

module.exports = {
  getKSTDate,
  getYesterday,
  isWrittenToday,
  isWrittenYesterday,
  toLocaleDateString,
  toLocaleTimeString,
  toLocaleString,
  formattingDate,
};
