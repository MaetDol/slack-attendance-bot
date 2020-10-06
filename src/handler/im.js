const api = require('../api');
const db = require('../db/');
const { getKSTDate, getYesterday, formattingDate, dateDistance } = require('../utils/date');

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

  let submittedUsers = db.select.usersByDate({
    channel: studyChannel,
    date: formattingDate( date, '-', '-')
  });
  let dbUsers = db.select.attendInfosByChannel( studyChannel );
  let channelUserNames = api.userList( studyChannel ).then( r => r.members );

  [
    submittedUsers, 
    dbUsers, 
    channelUserNames, 
  ] = await Promise.all([submittedUsers, dbUsers, channelUserNames]);

  const allUsers = dbUsers
    .filter( du => channelUserNames.includes( du.user ))
    .map( u => {
      const totalDate = dateDistance( u.first*1000, u.last*1000 ) + 1;
      const attendRate = parseInt( u.count / totalDate * 100 );
      return { ...u, attendRate };
    });
  const attendedUsers = allUsers
    .filter( au => hasUser( au, submittedUsers ))
    .map( u => {
      const submitInfo = submittedUsers.find( s => s.user === u.user );
      return { ...u, ...submitInfo };
    });
  const absentedUsers = allUsers.filter( au => !hasUser( au, submittedUsers ));

  api.postMessage({ 
    channel: dmChannel, 
    text: newStateMessage( date, attendedUsers, absentedUsers ) 
  });
}

function newStateMessage( date, attendedUsers, absentedUsers ) {
  const today = getKSTDate();
  const attended = attendedUsers.map(({ user, title, permalink, attendRate, consecutive }) => 
`<@${ user }> :calendar: 출석률 ${attendRate}%, :fire: ${consecutive}일 연속!
:pencil2: <${ permalink }|${ title }>`).join('\n');

  const absented = absentedUsers.map(({ user, attendRate }) => 
`<@${ user }> :calendar: 출석률 ${attendRate}%`).join('\n');

  return `
${formattingDate( date, '년 ', '월 ', '일')}
￣￣￣￣￣￣￣￣￣￣
제출한 사람들
${ attended }


아직 제출 안 한 사람들
${ absented }
--------------------
`;
}

function hasUser( user, array ) {
  return array.some( u => u.user === user.user );
}

function existsUsers( dbUsers, channelUsers ) {
  return channelUsers.filter( u => dbUsers.includes( u ));
}

module.exports = handler;
