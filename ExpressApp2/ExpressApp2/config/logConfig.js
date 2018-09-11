var winston = require('winston');
var winstonDaily = require('winston-daily-rotate-file');
var moment = require('moment');

const _logDir = 'C:/logs/server/LOGFILE.log';
//const _logDir = 'C:/Users/cbadmin/Desktop/ExpressApp2/ExpressApp2/logs/LOGFILE.log';

module.exports.CreateLogger = function () {

    var appenders = [];

    appenders.push(new winston.transports.DailyRotateFile({
        //prepend: true,  //현재 버전에서 제공안함.
        datePattern: 'YYYY-MM-DD',
        json: false,
        filename: _logDir,
        timestamp: function () {    //로그 작성시 날짜 포맷
            return moment().format('YYYY-MM-DD HH:mm:ss.SSS ZZ')
        },
        formatter: function (options) {
            return options.timestamp() + ' ' + options.message;
        }
    }));
    /*
    appenders.push(new winston.transports.Console({
        json: false,
        timestamp: function () {    //로그 작성시 날짜 포맷
            return new Date().toFormat('YYYY-MM-DD HH24:MI:SS')
        },
        formatter: function (options) {
            return options.timestamp() + ' ' + options.message;
        }
    }));
    */
    try{
        var logger = new winston.Logger({
            level: 'debug',
            transports: appenders
        });
    }
    catch(e) {
        Debug.write(e);
    }

    return logger;
};
