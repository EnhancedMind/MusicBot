const Command = require('../../Structures/Command');

const queue = require('../../Data/queue');
const { emoji: { success, warning }, response: { invalidNumber, wrongChannel, noMusic } } = require('../../../config/config.json');


module.exports = new Command({
	name: 'bassboost',
	aliases: [ 'bass' ],
	syntax: 'bassboost <value>',
	description: 'Sets the bassboost value.',
	async run(message, args, client) {
		const guildQueue = queue.get(message.guild.id);
        if (!guildQueue) return message.channel.send(`${warning} ${noMusic}`);

        if (!message.member.voice.channel || guildQueue.connection.joinConfig.channelId != message.member.voice.channel.id) return message.channel.send(`${warning} ${wrongChannel}`);

		if (args[0] && isNaN(args[0])) return message.channel.send(`${warning} ${invalidNumber}`);

		if (!args[0] && guildQueue.resource.ffmpeg.currentOptions.some(option => option.startsWith('bass=g='))) {
			queue.unpipe(message.guild.id);
        	queue.player(message.guild.id, { inherit: true, bass: 0 });

			return message.channel.send(`${success} Bassboost disabled.`);
		}

		queue.unpipe(message.guild.id);
        queue.player(message.guild.id, { inherit: true, bass: args[0] ? Number(args[0]) : 3 });

		message.channel.send(`${success} Bassboost set to **${args[0] ? args[0] : 'default'}**.`);
	}
});
