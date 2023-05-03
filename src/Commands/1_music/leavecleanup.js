const Command = require('../../Structures/Command');

const { PermissionsBitField } = require('discord.js');

const queue = require('../../Data/queue');
const { bot: { ownerID }, emoji: { success, warning, error }, response: { invalidPermissions, wrongChannel, noMusic } } = require('../../../config/config.json');


module.exports = new Command({
	name: 'leavecleanup',
	aliases: [ 'lc' ],
	description: 'Removes all entries by users that are no longer in the voice channel. Requires Manage Channels permission.',
	async run(message, args, client) {
		const guildQueue = queue.get(message.guild.id);
        if (!guildQueue) return message.channel.send(`${warning} ${noMusic}`);

        if (!message.member.voice.channel || guildQueue.connection.joinConfig.channelId != message.member.voice.channel.id) return message.channel.send(`${warning} ${wrongChannel}`);

		// check if message author has admin permissions
		if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels) && message.author.id != ownerID) return message.channel.send(`${error} ${invalidPermissions}`);

		// get list of users in voice channel
		const voiceChannelUsers = message.guild.channels.cache.get(guildQueue.connection.joinConfig.channelId).members.map(member => member.id);
		
		const removedSongs = queue.leavecleanup(message.guild.id, voiceChannelUsers);

		message.channel.send(`${success} ${removedSongs} entries have been removed from the queue.`);
	}
});
