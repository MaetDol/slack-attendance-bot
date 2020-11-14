const { escape: escapeSql } = require('mysql');
const api = require('../api');
const db = require('../db');
const { isWrittenToday, isWrittenYesterday } = require('../utils/date');

async function handler({ user, channel, ts, text }) {
  const lastData = await db.select.lastByUser({ user, channel });
  const isDataExists = lastData.length !== 0;

  const title = getTitle( text );
  const permalink = await api.getPermalink({ channel, timestamp: ts }).then( r => r.permalink );
  if( isDataExists && isWrittenToday( lastData[0].date )) {
    db.update.one({ id: lastData[0].id, ts, permalink, title });
    if( lastData[0].ts !== ts ) {
      removeReaction({ channel, ts: lastData[0].ts });
      addReaction({ channel, ts });
    }
  } else {
    let consecutive = 1;
    if( isDataExists && isWrittenYesterday( lastData[0].date ) ) {
      consecutive = lastData[0].consecutive +1;
    }
    await db.insert.one({
      ts,
      user,
      channel,
      consecutive,
      title,
      permalink,
    });
    addReaction({ channel, ts });
  }
}

function getTitle( text ) {
  const MAX_LENGTH = 37;
  // Remove mention, new line
  const mention = /^<@U[A-Z0-9]+>\s*/;
  let result = text.replace( mention, '' ).replace(/\n/g, ' ');
  // Remove grater than, less than signs(link)
  const link = /<[^>|]+\|([^>]+)>|<([^>]+)>/;
  while( link.test( result ) ) {
    const matched = result.match( link );
    if( matched[1] ) {
      result = result.replace( matched[0], matched[1] );
    } else if( matched[2] ) {
      result = result.replace( matched[0], ' ' );
    }
    result = result.trim();
  }

  if( result.length >= MAX_LENGTH ) {
    return result.slice( 0, MAX_LENGTH ) + '...';
  } else if( result.length === 0 ) {
    return '제목 없음';
  }
  return result;
}

function removeReaction({ channel, ts }) {
  api.removeReaction({
    channel,
    emoji: 'ballot_box_with_check',
    timestamp: ts,
  });
}

function addReaction({ channel, ts }) {
 api.addReaction({
    channel,
    emoji: 'ballot_box_with_check',
    timestamp: ts,
  });
}

module.exports = handler;
