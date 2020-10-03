const eventRouter = require('./eventRouter');

function route( data ) {
  const parsed = JSON.parse( data );

  switch( parsed.type ) {
    case 'url_verification':
      return data;
    case 'event_callback':
      return eventRouter.route( parsed );
    default:
      console.log('Unkown type: ', parsed.type);
      return 'Unkown type: ' + parsed.type;
  }
}

module.exports = { route };
