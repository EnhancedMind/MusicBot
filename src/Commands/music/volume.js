const Command = require('../../Structures/Command');

const queue = require('../../Data/queue');
const { emoji: { success, warning }, response: { invalidNumber, wrongChannel, noMusic } } = require('../../../config/config.json');


module.exports = new Command({
	name: 'volume',
	aliases: [ 'vol' ],
	syntax: 'volume <volume> [persistent]',
	description: 'Sets the volume of the current song or the whole queue or shows the current volume.',
	async run(message, args, client) {
		const guildQueue = queue.get(message.guild.id);
        if (!guildQueue) return message.channel.send(`${warning} ${noMusic}`);

        if (!message.member.voice.channel || guildQueue.connection.joinConfig.channelId != message.member.voice.channel.id) return message.channel.send(`${warning} ${wrongChannel}`);

		if (!args[0]) return message.channel.send(`${success} The current volume is **${queue.volume(message.guild.id) * 100}%**.`);
		
		if (isNaN(args[0])) return message.channel.send(`${warning} ${invalidNumber}`);
		// if args[0] is less than 0 or more than 175 return message
		if (args[0] < 0 || args[0] > 175) return message.channel.send(`${warning} Please enter a number between 0 and 175.`);

		queue.volume(message.guild.id, args[0] / 100, args[1] && [ 'persistent', 'persist', 'p' ].includes(args[1].toLowerCase()) );
		message.channel.send(`${success} The volume has been set to **${args[0]}%**.`);
	}
});
