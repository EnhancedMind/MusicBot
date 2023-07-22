const Command = require('../../Structures/Command');

const { consoleLog } = require('../../Data/Log');
const { bot: { token, ownerID }, emoji: { success, info, error, loading }, response: { invalidPermissions } } = require('../../../config/config.json');

const queue = require('../../Data/queue');


module.exports = new Command({
	name: 'restart',
	aliases: [ ' ' ],
	description: "Restarts the bot's message client",
	async run(message, args, client) {
		if (message.author.id != ownerID) return message.channel.send(`${error} ${invalidPermissions}`);

		consoleLog('[INFO] Restarting message client...');

		const { id: responseId } = await message.channel.send(`${loading} Restarting message client...`);

		client.destroy();
		await client.login(token);

		consoleLog(`[INFO] ${client.user.username} message client is online and ready on ${client.guilds.cache.size} servers!`);
		
		const response = await message.channel.messages.fetch({ limit: 1, cache: false, around: responseId });
		if (response.has(responseId)) response.first().edit(`${success} Restarted message client!`);
		else message.channel.send(`${success} Restarted message client!`);
	}
});
