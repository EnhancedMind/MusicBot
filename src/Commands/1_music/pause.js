const Command = require('../../Structures/Command');

const queue = require('../../Data/queue');
const { bot: { prefix }, emoji: { success, warning }, response: { wrongChannel, noMusic } } = require('../../../config/config.json');


module.exports = new Command({
	name: 'pause',
	aliases: [ ' ' ],
	description: 'Pauses the current song.',
	async run(message, args, client) {
		const guildQueue = await queue.get(message.guild.id);
        if (!guildQueue) return message.channel.send(`${warning} ${noMusic}`);

        if (!message.member.voice.channel || guildQueue.connection.joinConfig.channelId != message.member.voice.channel.id) return message.channel.send(`${warning} ${wrongChannel}`);
		
		message.channel.send(`${success} Paused **${guildQueue.songs[0].title}**. Type \`${prefix}play\` to unpause!`);
		queue.pause(message.guild.id);
	}
});
