const api = require('../api');
const db = require('../db/');
const df = require('date-fns');
const { getKSTDate, getYesterday } = require('../utils');

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

  const { members: channelUsers }= await api.userList( studyChannel );
  if( channelUsers === undefined ) {
    throw new Error('Channel not found');
  }
  const records = await db.select.usersByDate({
    channel: studyChannel,
    date: dateFormatiing( date, '-', '-')
  });
  const attendedUsers = records.filter( r => channelUsers.includes( r.user ));
  const absentedUsers = channelUsers.filter( 
    u => records.find( r => r.user === u ) === undefined 
  );

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

  return `${dateFormatiing( date, '년 ', '월 ', '일')}
￣￣￣￣￣￣￣￣￣￣
제출한 사람들
${ attended }


아직 제출 안 한 사람들
${ absented }`;
}

function dateFormatiing( d, yi='', mi='', di='' ) {
  return df.format( d, `yyyy${yi}MM${mi}dd${di}` );
}

module.exports = handler;
