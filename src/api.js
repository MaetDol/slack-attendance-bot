const https = require('https');
const logger = require('./logger');

const baseUrl = 'slack.com';
const token = process.env.xoxb_token;

function request( type, params, resolve=()=>{}, reject=()=>{} ) {
  let query = '';
  for( let key in params ) {
    query += `${key}=${encodeURIComponent( params[key] )}&`;
  }

  return new Promise(( resolve, reject ) => 
    https.request({
      hostname: baseUrl,
      path: `/api/${type}?${query}`,
      method: 'POST',
    }, res => res.on('data', d => {
      logger.info(d);
      resolve(d);
    }))
      .on('error', e => reject(e) )
      .end()
  )
    .then( response => JSON.parse( response ))
    .then( data => {
      if( data.ok ) {
        logger.info(`Got response from ${type} with query ${query}\n response: ${data}`);
        return data;
      }
      throw new Error( data.error );
    })
    .catch( e => logger.error(`Requested ${type} with query ${query}\n but got an error: ${e}`) );
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
