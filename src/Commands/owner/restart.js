const Command = require('../../Structures/Command');

const { consoleLog } = require('../../Data/Log');
const { bot: { token, ownerID }, emoji: { success, info, error, loading }, response: { invalidPermissions } } = require('../../../config/config.json');

const queue = require('../../Data/queue');


module.exports = new Command({
	name: 'restart',
	aliases: [ 'reboot' ],
	description: "Restarts the bot's client",
	async run(message, args, client) {
		if (message.author.id != ownerID) return message.channel.send(`${error} ${invalidPermissions}`);

		consoleLog('[INFO] Restarting...');

		await message.channel.send(`${loading} Restarting...`);

		const queues = queue.get();
		for (const [guildID, guildQueue] of Object.entries(queues)) {
			guildQueue.textChannel.send(`${info} The bot is restarting, destroying connection...`);
            guildQueue.updater.emitter.emit('end');
			guildQueue.connection.destroy();
			queue.delete(guildID);
		}
		// wait for all connections to be destroyed and updaters to be ended
		await new Promise(resolve => setTimeout(resolve, 2500));

		client.destroy();
		await client.login(token);

		consoleLog(`[INFO] ${client.user.username} is online and ready on ${client.guilds.cache.size} servers!`);
		
		const response = await message.channel.messages.fetch({ limit: 1 });
		try {
			response.first().edit(`${success} Restarted!`);
		}
		catch (error) {
			consoleLog(`[WARN] Restart response edit error`, error);
			message.channel.send(`${success} Restarted!`);
		}
	}
});
