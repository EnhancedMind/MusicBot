const Command = require('../../Structures/Command');

const queue = require('../../Data/queue');
const { emoji: { success, warning }, response: { invalidNumber, wrongChannel, noMusic } } = require('../../../config/config.json');


module.exports = new Command({
	name: 'seek',
	aliases: [ ' ' ],
	syntax: 'seek <position>',
	description: 'Seeks to a position in the song.',
	async run(message, args, client) {
		const guildQueue = queue.get(message.guild.id);
        if (!guildQueue) return message.channel.send(`${warning} ${noMusic}`);

        if (!message.member.voice.channel || guildQueue.connection.joinConfig.channelId != message.member.voice.channel.id) return message.channel.send(`${warning} ${wrongChannel}`);

		if (isNaN(args[0]) || args[0] < 0) return message.channel.send(`${warning} ${invalidNumber}`);

		queue.unpipe(message.guild.id);
        queue.player(message.guild.id, { inherit: true, seek: Number(args[0]) });

		message.channel.send(`${success} Skipped to **${args[0]} seconds**.`);
	}
});
