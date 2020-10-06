const http = require('http');
const router = require('./router');
const logger = require('./utils/logger');

http.createServer(( req, res ) => {

  res.setHeader('Access-Control-Allow-Origin', '*');

  logger.info(`Request ${url}, ${method}`);
  const isSupportedRequest = req.method === 'POST' && req.url === '/';
  if( !isSupportedRequest ) {
    console.log('Not supported request');
    res.writeHead(405);
    res.end();
    return;
  }

  let body = '';
  req.on('data', ch => body += ch );
  req.on('end', () => {
    console.log('POST: ', JSON.parse( body ));
    const responseBody = router.route( body );
    res.writeHead( 200 );
    res.end( body );
  });

}).listen( 8079 );

console.log('Server start');
