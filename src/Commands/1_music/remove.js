const Command = require('../../Structures/Command');

const queue = require('../../Data/queue');
const { emoji: { success, warning }, response: { missingArguments, invalidNumber, wrongChannel, noMusic } } = require('../../../config/config.json');


module.exports = new Command({
	name: 'remove',
	aliases: [ 'rm', 'delete', 'del' ],
	syntax: 'remove <position>',
	description: 'Removes a song from the queue.',
	async run(message, args, client) {
		const guildQueue = await queue.get(message.guild.id);
        if (!guildQueue) return message.channel.send(`${warning} ${noMusic}`);

        if (!message.member.voice.channel || guildQueue.connection.joinConfig.channelId != message.member.voice.channel.id) return message.channel.send(`${warning} ${wrongChannel}`);

		if (!args[0]) return message.channel.send(`${warning} ${missingArguments}`);

		if (isNaN(args[0])) return message.channel.send(`${warning} ${invalidNumber}`);

		if (args[0] < 0 || args[0] > guildQueue.songs.length - 1) return message.channel.send(`${warning} Please enter a number between 0 and ${guildQueue.songs.length - 1}`);

		const { title, requester, requester2} = guildQueue.songs[args[0]];
		message.channel.send(`${success} Removed **${title}** (requested by **${requester.username}**${requester2 && requester.id != requester2.id ? ` - ${requester2.username}`: ''})`);

		queue.remove(message.guild.id, args[0]);
	}
});
