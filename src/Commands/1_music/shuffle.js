const Command = require('../../Structures/Command');

const queue = require('../../Data/queue');
const { emoji: { success, warning }, response: { wrongChannel, noMusic } } = require('../../../config/config.json');


module.exports = new Command({
	name: 'shuffle',
	aliases: [ 'random', 'rn' ],
	description: 'Shuffles the queue.',
	async run(message, args, client) {
		const guildQueue = queue.get(message.guild.id);
        if (!guildQueue) return message.channel.send(`${warning} ${noMusic}`);

        if (!message.member.voice.channel || guildQueue.connection.joinConfig.channelId != message.member.voice.channel.id) return message.channel.send(`${warning} ${wrongChannel}`);

		queue.shuffle(message.guild.id);
		message.channel.send(`${success} You successfully shuffled your ${guildQueue.songs.length - 1} entries.`);
	}
});
