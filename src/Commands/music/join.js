const Command = require('../../Structures/Command');

const { Permissions } = require('discord.js');
const queue = require('../../Data/queue');
const { emoji: { success, warning }, response: { wrongChannel, noMusic } } = require('../../../config/config.json');


module.exports = new Command({
	name: 'join',
	aliases: [ 'connect', 'fuckon' ],
	description: 'Joins the voice channel of the author.',
	async run(message, args, client) {
		const guildQueue = queue.get(message.guild.id);
        if (guildQueue) return message.channel.send(`${warning} I'm already in a voice channel.`);

        //if (( !message.member.voice.channel || guildQueue.connection.joinConfig.channelId != message.member.voice.channel.id ) && !message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return message.channel.send(`${warning} ${wrongChannel}`);

		queue.construct(message, []);
		message.channel.send(`${success} I'm now in your voice channel.`);       
	}
});
