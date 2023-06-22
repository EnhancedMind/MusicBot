const { ignoreECONNRESET, terminateOnUncaughtException } = require('../config/config.json');

process.on('unhandledRejection', (err) => {
    if (err.name == 'DiscordAPIError[10008]') console.error('Unhandled Rejection: ', err);
    else throw err;
});

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
