const Command = require('../../Structures/Command');

const queue = require('../../Data/queue');
const { emoji: { success, warning }, response: { noMusic } } = require('../../../config/config.json');


module.exports = new Command({
	name: 'save',
	aliases: [ 'grab', 'yoink' ],
	description: 'Sends the currently playing song to your DMs.',
	async run(message, args, client) {
		const guildQueue = queue.get(message.guild.id);
        if (!guildQueue) return message.channel.send(`${warning} ${noMusic}`);

		message.channel.send(`${success} Sending the song to you!`);
		message.author.send(`${success} You saved the track **${guildQueue.songs[0].title}** (${guildQueue.songs[0].url}) from the server **${message.guild.name}**`);
	}
});
