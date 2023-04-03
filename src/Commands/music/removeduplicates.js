const Command = require('../../Structures/Command');

const { Permissions } = require('discord.js');

const queue = require('../../Data/queue');
const { emoji: { success, warning, error }, response: { invalidPermissions, wrongChannel, noMusic } } = require('../../../config/config.json');


module.exports = new Command({
	name: 'removeduplicates',
	aliases: [ 'removedupes', 'dupes' ],
	description: 'Removes all duplicates from the queue.',
	async run(message, args, client) {
		const guildQueue = queue.get(message.guild.id);
        if (!guildQueue) return message.channel.send(`${warning} ${noMusic}`);

        if (!message.member.voice.channel || guildQueue.connection.joinConfig.channelId != message.member.voice.channel.id) return message.channel.send(`${warning} ${wrongChannel}`);

		// check if message author has admin permissions
		if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return message.channel.send(`${error} ${invalidPermissions}`);
		
		const removedSongs = queue.removeduplicates(message.guild.id);

		message.channel.send(`${success} ${removedSongs} entries have been removed from the queue.`);
	}
});
