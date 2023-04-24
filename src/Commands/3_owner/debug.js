const Command = require('../../Structures/Command');

const { readdirSync, statSync } = require('fs');
const path = require('path');
const { bot: { ownerID }, emoji: { success, error }, response: { invalidPermissions }, player: { playlistFolderPath } } = require('../../../config/config.json');


module.exports = new Command({
	name: 'debug',
	aliases: [ 'getlog' ],
	syntax: 'debug <file>',
	description: 'Sends selected file as a message attachment',
	async run(message, args, client) {
		if (message.author.id != ownerID) return message.channel.send(`${error} ${invalidPermissions}`);

		const getAllFilePaths = (dirPath, arrayOfFilePaths, arrayOfFileNames) => {
			arrayOfFilePaths = arrayOfFilePaths || [];
  			arrayOfFileNames = arrayOfFileNames || [];

			readdirSync(dirPath).forEach((file) => {
				const filePath = path.join(dirPath, file);
				if (statSync(filePath).isDirectory()) {
					[arrayOfFilePaths, arrayOfFileNames] = getAllFilePaths(filePath, arrayOfFilePaths, arrayOfFileNames);
				} else {
					arrayOfFilePaths.push(filePath);
					arrayOfFileNames.push(file);
				} 
			});
		  
			return [arrayOfFilePaths, arrayOfFileNames];
		}

		const [ configFilePaths, configFiles ] = getAllFilePaths('./config/');
		const [ logFilePaths, logFiles ] = getAllFilePaths('./logs/');
		const [ playlistFilePaths, playlistFiles ] = getAllFilePaths(`${__dirname}/../../../config/${playlistFolderPath}/`);

		if (!args[0]) return message.channel.send(`${success} Logs: ${logFiles.length > 0 ? `**${logFiles.join('**, **')}**` : 'no log files found'}\n${success} Config: ${configFiles.length > 0 ? `**${configFiles.join('**, **')}**` : 'no log files found'}\n${success} Playlists: ${playlistFiles.length > 0 ? `**${playlistFiles.join('**, **')}**` : 'no log files found'}`);

		const filePaths = configFilePaths.concat(logFilePaths).concat(playlistFilePaths);
		const files = configFiles.concat(logFiles).concat(playlistFiles);

		for (const file of files) {
			if (file.startsWith(args[0])) {
				const filePath = filePaths[files.indexOf(file)];
				message.channel.send({ content: `${success} File: **${filePath}**`, files: [ filePath ] });
				return;
			}
		}
		message.channel.send(`${error} That file doesn't exist!`);
	}
});
