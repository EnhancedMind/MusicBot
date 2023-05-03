const Event = require('../Structures/Event');

const { consoleLog } = require('../Data/Log');


module.exports = new Event('rateLimited', async (client, info) => {
    consoleLog(`[WARN] Rate limited event emmited!`, info);
});
