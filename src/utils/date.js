const { format } = require('date-fns');
const A_DAY = 60*60*24*1000;

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

function dateDistance( a, b ) {
  const a_date = new Date( toLocaleDateString( a ));
  const b_date = new Date( toLocaleDateString( b ));
  const distance = Math.ceil( (b_date - a_date) / A_DAY );
  return Math.abs( distance );
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
  dateDistance,
};
