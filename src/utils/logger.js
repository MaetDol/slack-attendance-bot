const fs = require('fs');
const { 
  toLocaleString,
  getKSTDate,
  isWrittenToday,
} = require('./date');

class Logger {
  
  constructor() {
    this.CONSOLE = process.env.CONSOLE;
    this.LOG_DIR = process.env.LOG_DIR;
    this.init();
  }

  init() {
    const {date} = toLocaleString( getKSTDate() );
    const {dir, file} = this.path = this.toPath( date );
    this.createPath( dir );
    this.writeStream = this.createWriteStream( dir + file );
  }

  createPath( path ) {
    const begin = path.match(/^\.*\/.{0}/);
    let dir = './';
    if( begin ) {
      path = path.slice( begin[0].length, path.length );
      dir = begin[0];
    }
    
    const pathes = path.split('/');
    pathes.forEach( p => {
      dir += '/' + p;
      if( !fs.existsSync( dir )) {
        fs.mkdirSync( dir );
      }
    });
  }

  createWriteStream( path ) {
    return fs.createWriteStream( path, {flags: 'a'} );
  }

  toPath( dateString ) {
    const [y, m, d] = dateString.split('-');
    return {
      dir: `${this.LOG_DIR}/${y}/${m}/`,
      file: `${d}.log`,
    };
  }

  get date() {
    const date = getKSTDate();
    return {
      obj: date,
      string: toLocaleString( date ),
    };
  }


  info( data ) {
    this.write(` [INFO] ${data}\n`);
  }

  error( data ) {
    this.write(` [ERROR] ${data}\n`);
  }

  write( msg ) {
    const ts = getKSTDate();
    const {time} = toLocaleString( ts );
    if( !isWrittenToday(ts) ) this.init();

    const log = time + msg;
    if( this.CONSOLE ) console.log( log );
    this.writeStream.write( log );
  }

}

module.exports = new Logger();
