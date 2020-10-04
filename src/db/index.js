const mysql = require('mysql');
const config = require('./config.js');

console.log('create pool')
const pool = mysql.createPool( config );

function test() {
  return new Promise(( resolve, reject ) => {
    pool.query('SELECT 1+1 AS solution', (error, result, fields) => {
      if( error ) reject( error );
      resolve( result );
    });
  });
}

function executeQuery( query, resolve, reject ) {
  pool.query( query, (error, result, fields) => {
    if( error ) reject( error );
    resolve( result );
  });
}

const insert = {
  one({ ts, user, channel, consecutive, permalink, title }) {
    const query = `
      INSERT INTO attendance( ts, user, channel, consecutive, title, permalink )
      VALUES('${ts}', '${user}', '${channel}', ${consecutive}, ${pool.escape( title )}, '${permalink}')
    `;
    return new Promise(( resolve, reject ) => 
      executeQuery( query, resolve, reject )
    );
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
    return new Promise(( resolve, reject ) => 
      executeQuery( query, resolve, reject )
    );
  },

  usersByDate({ channel, date }) {
    const query = `
      SELECT * FROM attendance
      WHERE channel = '${channel}' AND DATE(date) = DATE('${date}')
    `;
    return new Promise(( resolve, reject ) =>
      executeQuery( query, resolve, reject )
    );
  },

  byUserAndToday({ user, channel }) {
    const query =`
      SELECT * FROM attendance
      WHERE channel = '${channel}' AND 
            user = '${user}' AND
            DATE(date) = DATE(now())
    `;
    return new Promise(( resolve, reject ) =>
      executeQuery( query, resolve, reject )
    );
  },

  usersByChannel( channel ) {
    const query =`
      SELECT user, id FROM attendance
      WHERE channel = '${channel}'
      GROUP BY user
    `;
    return new Promise(( resolve, reject ) =>
      executeQuery( query, resolve, reject )
    );
  },
};

const update = {
  oneTimestamp({ id, ts, permalink, title, date }) {
    const query = `
      UPDATE attendance 
      SET ts='${ts}', permalink='${permalink}', title=${pool.escape( title )}, date=${pool.escape( date )}
      WHERE id = ${id}
    `;
    return new Promise(( resolve, reject ) => 
      executeQuery( query, resolve, reject )
    );
  }
};

module.exports = {
  test,
  insert,
  select,
  update,
};
