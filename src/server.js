const http = require('http');
const router = require('./router');
const logger = require('./utils/logger');
const verify = require('./utils/verifyRequest');

const CORS_SLACK = 'https://slack.com';
http.createServer(( req, res ) => {

  res.setHeader('Access-Control-Allow-Origin', '*');

  const isSupportedRequest = req.method === 'POST' && req.url === '/';
  if( !isSupportedRequest ) {
    logger.log('Not supported request');
    res.writeHead(405);
    res.end();
    return;
  }

  let body = '';
  req.on('data', ch => body += ch );
  req.on('end', () => {
    logger.info(`Request ${req.url}, ${req.method}\n\tFrom ${res.socket.remoteAddress}\n\tHeader ${JSON.stringify(req.headers)}\n\tBody ${body}`);
    let responseBody = '';
    try {
      const timestamp = req.headers['x-slack-request-timestamp'];
      const isInvalidRequest = verify( timestamp, body ) !== req.headers['x-slack-signature'];  
      if( isInvalidRequest ) throw `Invalid request`;

      responseBody = router.route( body );
      res.writeHead( 200 );
    } catch(e) {
      logger.error(`Raised error to root: ${e}`);
      res.writeHead( 500 );
    } finally {
      res.end( responseBody );
    }
  });

}).listen( 8079 );

logger.info('Server start');
