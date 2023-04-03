const Command = require('../../Structures/Command');

const { readdirSync } = require('fs');
const { bot: { prefix }, emoji: { success }, player: { playlistFolderPath } } = require('../../../config/config.json');


module.exports = new Command({
	name: 'playlists',
	aliases: [ 'pls' ],
	description: 'Shows all available playlists.',
	async run(message, args, client) {
		let playlists = [];

		// for each .json in the config/Playlists folder get the file name and add it to the array
		readdirSync(`${__dirname}/../../../config/${playlistFolderPath}/`).forEach(file => {
			if (file.endsWith('.json')) playlists.push(file.replace('.json', ''));
		});

		message.channel.send(`${success} Available playlists: **${playlists.length}**\n\`${playlists.join('` `')}\`\nType \`${prefix}play playlist <name>\` to play a playlist.`);
	}
});
