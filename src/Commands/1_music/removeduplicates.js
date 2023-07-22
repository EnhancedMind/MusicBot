const Command = require('../../Structures/Command');

const { PermissionsBitField } = require('discord.js');

const queue = require('../../Data/queue');
const { bot: { ownerID }, emoji: { success, warning, error }, response: { invalidPermissions, wrongChannel, noMusic } } = require('../../../config/config.json');


module.exports = new Command({
	name: 'removeduplicates',
	aliases: [ 'removedupes', 'dupes' ],
	description: 'Removes all duplicates from the queue. Requires Manage Channels permission.',
	async run(message, args, client) {
		const guildQueue = await queue.get(message.guild.id);
		if (!guildQueue) return message.channel.send(`${warning} ${noMusic}`);

		if (!message.member.voice.channel || guildQueue.connection.joinConfig.channelId != message.member.voice.channel.id) return message.channel.send(`${warning} ${wrongChannel}`);

		if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels) && message.author.id != ownerID) return message.channel.send(`${error} ${invalidPermissions}`);
		
		const removedSongs = await queue.removeduplicates(message.guild.id);

		message.channel.send(`${success} ${removedSongs} entries have been removed from the queue.`);
	}
});
