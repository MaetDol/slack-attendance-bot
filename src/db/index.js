const mysql = require('mysql');
const config = require('./config');
const logger = require('./logger');

console.log('create pool')
const pool = mysql.createPool( config );

function execute( query ) {
  return new Promise(( resolve, reject ) => 
    pool.query( query, (error, result, fields) => {
      logger.info(`Execute query: ${query}`);
      if( error ) { 
        logger.error(`Failed execute query: ${error}`);
        reject( error );
      }
      resolve( result );
    })
  );
}

const insert = {
  one({ ts, user, channel, consecutive, permalink, title }) {
    const query = `
      INSERT INTO attendance( ts, user, channel, consecutive, title, permalink )
      VALUES('${ts}', '${user}', '${channel}', ${consecutive}, ${pool.escape( title )}, '${permalink}')
    `;
    return execute( query );
  },
}

const select = {

  lastByUser({ user, channel }) {
    const matched = `
      channel = '${channel}' and
      user = '${user}' 
    `;
    const query = `
      SELECT * FROM attendance
      WHERE ${matched} AND
            id = (SELECT MAX(id)
                  FROM attendance
                  WHERE ${matched})
    `;
    return execute( query );
  },

  usersByDate({ channel, date }) {
    const query = `
      SELECT * FROM attendance
      WHERE channel = '${channel}' AND DATE(date) = DATE('${date}')
    `;
    return execute( query );
  },

  byUserAndToday({ user, channel }) {
    const query =`
      SELECT * FROM attendance
      WHERE channel = '${channel}' AND 
            user = '${user}' AND
            DATE(date) = DATE(now())
    `;
    return execute( query );
  },

  usersByChannel( channel ) {
    const query =`
      SELECT user, id FROM attendance
      WHERE channel = '${channel}'
      GROUP BY user
    `;
    return execute( query );
  },

  lastRecordByChannel( channel ) {
    const query = `
      SELECT data.*
      FROM attendance as data,
        (SELECT MAX(ts) as ts FROM attendance WHERE channel = '${channel}' GROUP BY user) as max_ts
      WHERE data.ts = max_ts.ts
    `;
    return execute( query );
  },

  firstRecordByChannel( channel ) {
    const query = `
      SELECT data.*
      FROM attendance as data,
        (SELECT MIN(ts) as ts FROM attendance WHERE channel = '${channel}' GROUP BY user) as min_ts
      WHERE data.ts = min_ts.ts
    `;
    return execute( query );
  },
};

const update = {
  one({ id, ts, permalink, title, date }) {
    const query = `
      UPDATE attendance 
      SET ts='${ts}', permalink='${permalink}', title=${pool.escape( title )}, date=${pool.escape( date )}
      WHERE id = ${id}
    `;
    return execute( query );
  }
};

module.exports = {
  test,
  insert,
  select,
  update,
};
