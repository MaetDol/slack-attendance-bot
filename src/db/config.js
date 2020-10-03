module.exports = {
  connectionLimit: 10,
  host: 'db',
  user: 'root',
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: 'slack_bot',
};
