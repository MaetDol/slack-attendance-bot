const api = require('../api');
const db = require('../db/');
const { getKSTDate, getYesterday, formattingDate } = require('../utils/date');

function handler(e) {
  if( isSentByBot(e) ) {
    return false;
  }
  const { text, channel: dmChannel } = e;
  if( lookupYesterday(e) ) {
    const studyChannel = text.match( channelProvide )[1];
    postAttendanceStatus( getYesterday(), studyChannel, dmChannel );
  } else if( lookupToday(e) ) {
    const studyChannel = text.match( channelProvide )[1];
    postAttendanceStatus( getKSTDate(), studyChannel, dmChannel );
  }
}

const channelProvide = /<#([A-Z0-9]+)\|[^>]+>/;
function lookupToday(e) {
  return /진도|오늘/.test( e.text ) && channelProvide.test( e.text );
}

function lookupYesterday(e) {
  return /어제/.test( e.text ) && channelProvide.test( e.text );
}

function isSentByBot(e) {
  return e.bot_id !== undefined && e.type === 'message';
}

async function postAttendanceStatus( date, studyChannel, dmChannel ) {

  let channelUsers = api.userList( studyChannel ).then( r => r.members );
  let records = db.select.usersByDate({
    channel: studyChannel,
    date: formattingDate( date, '-', '-')
  });
  let dbUsers = db.select.usersByChannel( studyChannel )
    .then( records => records.map( r => r.user ));

  [channelUsers, dbUsers, records] = await Promise.all([channelUsers, dbUsers, records]);

  const allUsers = existsUsers( dbUsers, channelUsers );
  const attendedUsers = records.filter( r => allUsers.includes( r.user ));
  const absentedUsers = allUsers.filter( u => !records.even( r => r.user === u ));

  api.postMessage({ 
    channel: dmChannel, 
    text: newStateMessage( date, attendedUsers, absentedUsers ) 
  });
}

function newStateMessage( date, attendedUsers, absentedUsers ) {
  const today = getKSTDate();
  const attended = attendedUsers.map(({ user, title, permalink }) => 
    `- <@${ user }>  :pencil2: <${ permalink }|${ title }>`).join('\n');
  const absented = absentedUsers.map( user => 
    `- <@${ user }>`).join('\n');

  return `${formattingDate( date, '년 ', '월 ', '일')}
￣￣￣￣￣￣￣￣￣￣
제출한 사람들
${ attended }


아직 제출 안 한 사람들
${ absented }`;
}

function existsUsers( dbUsers, channelUsers ) {
  return channelUsers.filter( u => dbUsers.includes( u ));
}

module.exports = handler;
