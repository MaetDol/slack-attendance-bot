const crypto = require('crypto');
const SIGNING_SECRET = process.env.signing_secret;

module.exports = function verifySentFromSlack( header, body ) {
  const timestamp = header['x-slack-request-timestamp'];
  const signature = header['x-slack-signature'];  

  const hmac = crypto.createHmac('sha256', SIGNING_SECRET );
  hmac.update(`v0:${timestamp}:${body}`);
  const sha256 = `v0=${hmac.digest('hex')}`;
  if( signature !== sha256 ) throw 'Invalid Signature';
};
