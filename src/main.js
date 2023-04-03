const { ignoreECONNRESET, terminateOnUncaughtException } = require('../config/config.json');

//not a terrible hack or anything :^)
if (ignoreECONNRESET) {
    process.on('uncaughtException', (err) => {
        if (err.code == 'ECONNRESET') {}  //ignore this error
        else if (terminateOnUncaughtException) throw err;
    });
}

if (!terminateOnUncaughtException) {
    process.on('uncaughtException', (err) => {
        console.error('Uncaught Exception: ', err.stack);
    });
}

const Client = require('./Structures/Client');
new Client().start();
