const Command = require('../../Structures/Command');

const { PermissionsBitField } = require('discord.js');

const queue = require('../../Data/queue');
const { bot: { ownerID }, emoji: { success, warning, error }, response: { invalidPermissions, wrongChannel, noMusic } } = require('../../../config/config.json');


module.exports = new Command({
	name: 'forceremove',
	aliases: [ ' ' ],
	syntax: 'forceremove <user>',
	description: 'Removes all entries by a user from the queue. Requires Manage Channels permission.',
	async run(message, args, client) {
		const guildQueue = await queue.get(message.guild.id);
        if (!guildQueue) return message.channel.send(`${warning} ${noMusic}`);

        if (!message.member.voice.channel || guildQueue.connection.joinConfig.channelId != message.member.voice.channel.id) return message.channel.send(`${warning} ${wrongChannel}`);

		if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels) && message.author.id != ownerID) return message.channel.send(`${error} ${invalidPermissions}`);

		if (args[0].length != 21 || !args[0].startsWith('<@') || !args[0].endsWith('>')) return message.channel.send(`${warning} Please enter a valid user.`);

		const userToRemove = args[0].replace(/[<@!>]/g, '');
		
		const removedSongs = await queue.forceremove(message.guild.id, userToRemove);

		message.channel.send(`${success} <@${userToRemove}>'s ${removedSongs} entries have been removed from the queue.`);
	}
});
