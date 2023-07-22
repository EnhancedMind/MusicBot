const Command = require('../../Structures/Command');

const queue = require('../../Data/queue');
const { emoji: { success, warning, error }, response: { missingArguments, invalidNumber, wrongChannel, noMusic } } = require('../../../config/config.json');


module.exports = new Command({
	name: 'move',
	aliases: [ 'mv' ],
	syntax: 'move <from> <to>',
	description: 'Moves a song from one position to another.',
	async run(message, args, client) {
		const guildQueue = await queue.get(message.guild.id);
        if (!guildQueue) return message.channel.send(`${warning} ${noMusic}`);

        if (!message.member.voice.channel || guildQueue.connection.joinConfig.channelId != message.member.voice.channel.id) return message.channel.send(`${warning} ${wrongChannel}`);

		if (args.length < 2) return message.channel.send(`${warning} ${missingArguments}`);
		if (isNaN(args[0]) || isNaN(args[1])) return message.channel.send(`${error} ${invalidNumber}`);

		if (args[0] > guildQueue.songs.length - 1 || args[1] > guildQueue.songs.length - 1) return message.channel.send(`${error} ${invalidNumber}`);
		
		message.channel.send(`${success} Moved **${guildQueue.songs[args[0]].title}** from **${args[0]}** to **${args[1]}**`);
		
		queue.move(message.guild.id, args[0], args[1]);
	}
});
