const Command = require('../../Structures/Command');

const queue = require('../../Data/queue');
const { emoji: { success, warning }, response: { noMusic } } = require('../../../config/config.json');


module.exports = new Command({
	name: 'playerdebug',
	aliases: [ 'playerinfo', 'playerconfig' ],
	description: 'Shows the current player configuration.',
	async run(message, args, client) {
		const guildQueue = queue.get(message.guild.id);
		if (!guildQueue) return message.channel.send(`${warning} ${noMusic}`);

		message.channel.send(
		`${success} **Player Configuration:**
		**Resource volume:** ${queue.volume(message.guild.id) * 100}%
		**Resource volume logaritmic:** ${guildQueue.resource.resource.volume.volume}
		**Persistent volume:** ${guildQueue.resource.volume}
		**Loop:** ${guildQueue.repeat}
		**Seek:** ${guildQueue.resource.seek}
		**Voice channel id:** ${guildQueue.connection.joinConfig.channelId}
		**Default text channel:** ${guildQueue.textChannel}
		**Default text channel id:** ${guildQueue.textChannel.id}
		**NP Updater:** ${guildQueue.updater.active ? 'Active' : 'Inactive'}
		**NP Updater interval:** ${guildQueue.updater.interval._repeat}
		**Alone timeout:** ${guildQueue.aloneTimeout ? 'Active' : 'Inactive'}
		**Queue length:** ${guildQueue.songs.length}
		**FFmpeg options:**  ${guildQueue.resource.ffmpeg.currentOptions.join('  ')}
		`
		//FFmpeg options uses double space for better readability
		);
	}
});
