const https = require('https');
const { err } = require('./utils/default');
const logger = require('./utils/logger');

const baseUrl = 'slack.com';
const token = process.env.xoxb_token;

function request( type, params, resolve=()=>{}, reject=()=>{} ) {
  let query = '';
  for( let key in params ) {
    query += `${key}=${encodeURIComponent( params[key] )}&`;
  }

  const options = {
    hostname: baseUrl,
    path: `/api/${type}?${query}`,
    method: 'POST',
  };
  let data = '';
  return new Promise(( resolve, reject ) => 
    https.request( options, res => {
      res.on('data', d => data += d );
      res.on('end', _=> resolve(data) );
    })
      .on('error', e => reject(e) )
      .end()

    ).then( response => {
      logger.info(`Response from ${type}\nResponse: ${response}`);
      return JSON.parse( response );

    }).then( data => {
      if( data.ok ) return data;
      throw data.error;

    }).catch( e => err(`Requested ${type} with query ${query}\nbut got an error: ${e}`) );
}

function addReaction({ channel, emoji: name, timestamp }) {
  return request('reactions.add', {
    token,
    channel,
    name,
    timestamp,
  });
}

function removeReaction({ channel, emoji: name, timestamp }) {
  return request('reactions.remove', {
    token,
    channel,
    name,
    timestamp,
  });
}

async function userList( channel ) {
  return request('conversations.members', {
    token,
    channel,
  }).then( d => {
    if( d.members === undefined ) err(`api.userList: Channel not found: ${channel}`);
    return d;
  });
}

function postMessage({ channel, text }) {
  return request('chat.postMessage', {
    token,
    text,
    channel,
  });
}

function getPermalink({ channel, timestamp: message_ts }) {
  return request('chat.getPermalink', {
    token,
    channel,
    message_ts,
  });
}

module.exports = {
  addReaction,
  removeReaction,
  userList,
  postMessage,
  getPermalink,
};
