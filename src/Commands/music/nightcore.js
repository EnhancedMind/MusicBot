const Command = require('../../Structures/Command');

const queue = require('../../Data/queue');
const downloader = require('../../Data/downloader');
const { emoji: { success, warning }, response: { wrongChannel, noMusic } } = require('../../../config/config.json');


module.exports = new Command({
	name: 'nightcore',
	aliases: [ 'nc' ],
	syntax: 'nightcore <speed>',
	description: '',
	async run(message, args, client) {
		const guildQueue = queue.get(message.guild.id);
        if (!guildQueue) return message.channel.send(`${warning} ${noMusic}`);

        if (!message.member.voice.channel || guildQueue.connection.joinConfig.channelId != message.member.voice.channel.id) return message.channel.send(`${warning} ${wrongChannel}`);
		
		if (!args[0] && guildQueue.resource.ffmpeg.currentOptions.some(option => option.startsWith('atempo=') && option.split('=')[1] > 1)) {
			queue.unpipe(message.guild.id);
			queue.player(message.guild.id, { inherit: true, speed: 1 });

			return message.channel.send(`${success} Nightcore disabled.`);
		}

		if (args[0] && isNaN(args[0])) return message.channel.send(`${warning} ${invalidNumber}`);
		if (args[0] < 0.5 || args[0] > 2) return message.channel.send(`${warning} ${invalidNumber}`);

		const response = await message.channel.send(`${success} Downloading track for nightcore...`);

		const path = await downloader(guildQueue.songs[0].url, message.guild.id);

        queue.unpipe(message.guild.id);
        queue.player(message.guild.id, { inherit: true, localPath: path, speed: args[0] ? Number(args[0]) : 1.2 });

		response.edit(`${success} Downloaded track for nightcore... Playing now!`);
	}
});
