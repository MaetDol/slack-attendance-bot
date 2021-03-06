const http = require('http');
const router = require('./router');
const logger = require('./utils/logger');
const verifySentFromSlack = require('./utils/verifySentFromSlack');

const CORS_SLACK = 'https://slack.com';
http.createServer(( req, res ) => {

  res.setHeader('Access-Control-Allow-Origin', '*');

  logger.info(`Request ${req.url}, ${req.method}\n\tFrom ${res.socket.remoteAddress}\n\tHeader ${JSON.stringify(req.headers)}`);
  const isSupportedRequest = req.method === 'POST' && req.url === '/';
  if( !isSupportedRequest ) {
    logger.error('Not supported request');
    res.writeHead(405);
    res.end();
    return;
  }

  let body = '';
  req.on('data', ch => body += ch );
  req.on('end', () => {
    logger.info(`Body: ${body}`);
    let responseBody = '';
    try {
      verifySentFromSlack( req.headers, body );

      responseBody = router.route( body );
      res.writeHead( 200 );
    } catch(e) {
      logger.error(`Raised error to root: ${e}`);
      res.writeHead( 500 );
    } finally {
      if( typeof responseBody !== 'string' ) {
        logger.error(`ResponseBody is not String type: ${responseBody}`);
        responseBody = '';
      }
      res.end( responseBody );
    }
  });

}).listen( 8079 );

logger.info('Server start');
