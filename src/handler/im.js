const api = require('../api');
const db = require('../db/');
const { getKSTDate } = require('../utils');

function handler(e) {
  const { text, channel: dmChannel } = e;
  if( isRequestAttendanceStatus(e) ) {
    const channel = text.match( channelRegex )[1];
    postAttendanceStatus( channel, dmChannel );
  }
}

const channelRegex = /<#([A-Z0-9]+)\|[^>]+>/;
function isRequestAttendanceStatus(e) {
  return !isSentByBot(e) && /진도/.test( e.text ) && channelRegex.test( e.text );
}

function isSentByBot(e) {
  return e.bot_id !== undefined && e.type === 'message';
}

async function postAttendanceStatus( channel, dmChannel ) {

  const { members: channelUsers }= await api.userList( channel );
  if( channelUsers === undefined ) {
    throw new Error('Channel not found');
  }
  const records = await db.select.usersByDate({
    channel,
    date: todayWithIndicator('-', '-')
  });
  const attendedUsers = records.filter( r => channelUsers.includes( r.user ));
  const absentedUsers = channelUsers.filter( 
    u => records.find( r => r.user === u ) === undefined 
  );

  api.postMessage({ 
    channel: dmChannel, 
    text: newStatusMessage( attendedUsers, absentedUsers ) 
  });
}

function newStatusMessage( attendedUsers, absentedUsers ) {
  const today = getKSTDate();
  const attended = attendedUsers.map(({ user, title, permalink }) => 
    `- <@${ user }>  :pencil2: <${ permalink }|${ title }>`).join('\n');
  const absented = absentedUsers.map( user => 
    `- <@${ user }>`).join('\n');

  return `${todayWithIndicator('년 ', '월 ', '일')}
￣￣￣￣￣￣￣￣￣￣
제출한 사람들
${ attended }


아직 제출 안 한 사람들
${ absented }`;
}

function todayWithIndicator( yi='', mi='', di='' ) {
  const d = getKSTDate();
  return d.getFullYear() + yi + (d.getMonth() +1) + mi + d.getDate() + di;
}

module.exports = handler;
