const db = require('./index.js');
const { dateDistance } = require('../utils/date');

module.exports = async function updateAllConsecutive() {
  const records = await db.select.all();
  records.sort( by(['channel', 'user', 'ts']) );
  records.forEach( r => r.consecutive=1 );

  records.forEach(( r, idx, records ) => {
    const prev = records[idx-1];
    const isFirstRecordOfUser = idx === 0 || 
      prev.channel !== r.channel ||
      prev.user !== r.user;
    if( isFirstRecordOfUser ) return;

    const a = Number( r.ts ) * 1000,
          b = Number( prev.ts ) * 1000;
    if( dateDistance( a, b ) === 1 ) {
      r.consecutive += prev.consecutive;
    }
  });

  records.forEach( r => db.update.consecutive( r ));
}

function by( props ) {
  return (a, b) => {
    for( let p of props ) {
      if( a[p] > b[p] ) {
        return 1;
      } else if( a[p] < b[p] ) {
        return -1;
      }
    }
    return 0;
  };
}
