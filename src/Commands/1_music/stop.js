const Command = require('../../Structures/Command');

const { Permissions } = require('discord.js');
const queue = require('../../Data/queue');
const { bot: { ownerID }, emoji: { success, warning }, response: { wrongChannel, noMusic } } = require('../../../config/config.json');


module.exports = new Command({
	name: 'stop',
	aliases: [ 'dc', 'disconnect', 'fuckoff' ],
	description: 'Stops the current song, clears the queue and disconnects the client.',
	async run(message, args, client) {
		const guildQueue = queue.get(message.guild.id);
        if (!guildQueue) return message.channel.send(`${warning} ${noMusic}`);

        if (( !message.member.voice.channel || guildQueue.connection.joinConfig.channelId != message.member.voice.channel.id ) && !message.member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS) && message.author.id != ownerID) return message.channel.send(`${warning} ${wrongChannel}`);


		guildQueue.updater.emitter.emit('end');
        guildQueue.connection.destroy();
        queue.delete(message.guild.id);
        message.channel.send(`${success} The player has stopped and the queue has been cleared.`);
	}
});
