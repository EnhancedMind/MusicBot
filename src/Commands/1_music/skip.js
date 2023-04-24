const Command = require('../../Structures/Command');

const queue = require('../../Data/queue');
const { emoji: { success, warning }, response: { invalidNumber, wrongChannel, noMusic } } = require('../../../config/config.json');


module.exports = new Command({
	name: 'skip',
	aliases: [ 's' ],
	syntax: 'skip <opt position>',
	description: 'Skips the current song or to a song.',
	async run(message, args, client) {
		const guildQueue = queue.get(message.guild.id);
        if (!guildQueue) return message.channel.send(`${warning} ${noMusic}`);

        if (!message.member.voice.channel || guildQueue.connection.joinConfig.channelId != message.member.voice.channel.id) return message.channel.send(`${warning} ${wrongChannel}`);

		if ( [ 'to', 't' ].includes(args[0] ? args[0].toLowerCase() : args[0]) ) {
			if (isNaN(args[1])) return message.channel.send(`${warning} ${invalidNumber}`);

			// if args[1] is less than 1 or more than queue length - 1 return message
			if (args[1] < 1 || args[1] > guildQueue.songs.length - 1) return message.channel.send(`${success} Please enter a number between 1 and ${guildQueue.songs.length - 1}`);

			const { title, requester, requester2 } = guildQueue.songs[args[1]];
			message.channel.send(`${success} Skipped to **${title}** (requested by **${requester.username}**${requester2 && requester.id != requester2.id ? ` - ${requester2.username}`: ''})`);

			queue.skipto(message.guild.id, args[1]);
		}
		else if (!args[0]) {
			const { title, requester, requester2 } = guildQueue.songs[0];
			message.channel.send(`${success} Skipped **${title}** (requested by **${requester.username}${requester2 && requester.id != requester2.id ? ` - ${requester2.username}`: ''}**)`);
			
			queue.skip(message.guild.id);
		}
		else {
			message.channel.send(`${warning} Invalid arguments. Please use \`skip\` or \`skip to <position>\``);
		}
	}
});
