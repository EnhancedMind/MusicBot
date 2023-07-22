const Command = require('../../Structures/Command');

const { consoleLog } = require('../../Data/Log');
const { bot: { ownerID }, emoji: { info, error }, response: { invalidPermissions } } = require('../../../config/config.json');

const queue = require('../../Data/queue');


module.exports = new Command({
	name: 'shutdown',
    aliases: [ 'gosleep', 'poweroff' ],
	description: 'Safely shuts down the bot',
	async run(message, args, client) {
		if (message.author.id != ownerID) return message.channel.send(`${error} ${invalidPermissions}`);
        consoleLog('[INFO] Powering off...');
        await message.channel.send(`${info} Shutting down...`);

        // destroy all connections
        const queues = await queue.get();
        if (queues) {
            for (const [guildID, guildQueue] of Object.entries(queues)) {
                client.channels.cache.get(guildQueue.textChannelId).send(`${info} The bot is shutting down, destroying connection...`);
                queue.delete(guildID);
            }
            // wait for all connections to be destroyed and updaters to be ended
            await new Promise(resolve => setTimeout(resolve, 2500));
        }


        client.destroy();
        process.exit(0);
}
});
