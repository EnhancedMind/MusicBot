const Command = require('../../Structures/Command');

const queue = require('../../Data/queue');
const { emoji: { success, warning, error }, response: { wrongChannel, noMusic } } = require('../../../config/config.json');


module.exports = new Command({
	name: 'repeat',
	aliases: [ 'loop' ],
	syntax: 'repeat [off | all | single]',
	description: 'Repeats the current song or the whole queue.',
	async run(message, args, client) {
		const guildQueue = await queue.get(message.guild.id);
        if (!guildQueue) return message.channel.send(`${warning} ${noMusic}`);

        if (!message.member.voice.channel || guildQueue.connection.joinConfig.channelId != message.member.voice.channel.id) return message.channel.send(`${warning} ${wrongChannel}`);

		if (!args[0] && guildQueue.repeat || args[0] && args[0].toLowerCase() == 'off') {
			queue.repeat(message.guild.id, false);
			return message.channel.send(`${success} Repeating is now disabled.`);
		}
		else if (!args[0] || args[0] && args[0].toLowerCase() == 'all') {
			queue.repeat(message.guild.id, 'all');
			return message.channel.send(`${success} The whole queue is now repeating!`);
		}
		else if (args[0] && args[0].toLowerCase() == 'single') {
			queue.repeat(message.guild.id, 'single');
			return message.channel.send(`${success} The current song is now repeating!`);
		}
		message.channel.send(`${error} The arguments you provided are invalid.`);
	}
});
