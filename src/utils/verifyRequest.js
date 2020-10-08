const crypto = require('crypto');
const SIGNING_SECRET = process.env.signing_secret;

module.exports = function verify( timestamp, body ) {
  const hmac = crypto.createHmac('sha256', SIGNING_SECRET );
  hmac.update(`v0:${timestamp}:${body}`);
  return `v0=${hmac.digest('hex')}`;
};
