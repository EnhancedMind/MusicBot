const Command = require('../../Structures/Command');

const queue = require('../../Data/queue');
const { emoji: { success, warning } } = require('../../../config/config.json');


module.exports = new Command({
	name: 'join',
	aliases: [ 'connect', 'fuckon' ],
	description: 'Joins the voice channel of the author.',
	async run(message, args, client) {
		const guildQueue = await queue.get(message.guild.id);
        if (guildQueue) return message.channel.send(`${warning} I'm already in a voice channel.`);

		queue.construct(message, []);
		message.channel.send(`${success} I'm now in your voice channel.`);       
	}
});
