const mentionHandler = require('./handler/mention');
const imHandler = require('./handler/im');

function route({ event: e }) {

  if( isMention(e) ) {
    mentionHandler(e);
  } else if( isIM(e) ) {
    imHandler(e);
  } else {
    return 'Does not handled eventn type: ' + e.type;
  }

  return '';
}

function isMention(e) {
  return e.type === 'app_mention';
}

function isIM(e) {
  return e.type === 'message' && e.channel_type === 'im';
}

module.exports = {
  route
};
