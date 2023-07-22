const Command = require('../../Structures/Command');

const queue = require('../../Data/queue');
const { emoji: { success, warning }, response: { noMusic } } = require('../../../config/config.json');
const { consoleLog } = require('../../Data/Log');


module.exports = new Command({
	name: 'save',
	aliases: [ 'grab', 'yoink' ],
	description: 'Sends the currently playing song to your DMs.',
	async run(message, args, client) {
		const guildQueue = await queue.get(message.guild.id);
        if (!guildQueue) return message.channel.send(`${warning} ${noMusic}`);

		try {
			message.author.send(`${success} You saved the track **${guildQueue.songs[0].title}** (${guildQueue.songs[0].url}) from the server **${message.guild.name}**`);
			message.channel.send(`${success} I sent the song to your DMs!`);
		}
		catch (error) {
			consoleLog('[WARN] Could not send DM to user', error);
			message.channel.send(`${warning} I couldn't send you a DM.`);
		}
	}
});
