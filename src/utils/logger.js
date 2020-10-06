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
    this.init( getKSTDate() );
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

  set date( date ) {
    this._date = {
      obj: date,
      string: toLocaleString( date )
    };
  }

  get date() {
    return this._date;
  }

  init( date ) {
    this.date = date;
    const {dir, file} = this.toPath( this.date.string.date );
    this.createPath( dir );
    this.writeStream = this.createWriteStream( dir + file );
  }

  info( data ) {
    const timestamp = getKSTDate();
    if( !isWrittenToday( this.date.obj ) ) {
      this.init( timestamp );
    }
    this.write(
      `${this.date.string.time} [INFO] ${data}\n`
    );
  }

  error( data ) {
    const timestamp = getKSTDate();
    if( !isWrittenToday( this.date.obj ) ) {
      this.init( timestamp );
    }
    this.write( 
      `${this.date.string.time} [ERROR] ${data}\n`
    );
  }

  write( msg ) {
    if( this.CONSOLE ) {
      console.log( msg );
    }
    this.writeStream.write( msg );
  }

}

module.exports = new Logger();
