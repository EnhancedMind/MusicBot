const Command = require('../../Structures/Command');

const { existsSync, writeFileSync } = require('fs');
const queue = require('../../Data/queue');
const { bot: { prefix }, emoji: { success, warning }, response: { wrongChannel, noMusic }, player: { playlistFolderPath } } = require('../../../config/config.json');


module.exports = new Command({
	name: 'makelistfromqueue',
	aliases: [ ' ' ],
	syntax: 'makelistfromqueue <name>',
	description: 'Creates a local playlist from all currently queued songs.',
	async run(message, args, client) {
		const guildQueue = await queue.get(message.guild.id);
        if (!guildQueue) return message.channel.send(`${warning} ${noMusic}`);

        if (!message.member.voice.channel || guildQueue.connection.joinConfig.channelId != message.member.voice.channel.id) return message.channel.send(`${warning} ${wrongChannel}`);

		if (!args[0]) return message.channel.send(`${warning} Please provide a name for the playlist.`);

		const playlistName = args.join('');
		if (existsSync(`${__dirname}/../../../config/${playlistFolderPath}/${playlistName}.json`)) return message.channel.send(`${warning} Playlist with that name already exists.`);


		const playlist = {
			items: [],
			shuffle: false
		}

		guildQueue.songs.forEach(song => {
			playlist.items.push({
				disabled: false,
				path: song.url,
				requesterId: song.requester.id
			});
		});

		writeFileSync(`${__dirname}/../../../config/${playlistFolderPath}/${playlistName}.json`, JSON.stringify(playlist, null, 4));
		message.channel.send(`${success} Playlist successfully created. Use \`${prefix}play playlist ${playlistName}\` to play it!`);
	}
});
