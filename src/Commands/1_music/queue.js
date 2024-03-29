const Command = require('../../Structures/Command');

const { EmbedBuilder } = require('discord.js');
const paginator = require('../../Structures/Paginator');
const timeConverter = require('../../Data/time');
const { consoleLog } = require('../../Data/Log');
const queue = require('../../Data/queue');
const { emoji: { success, warning }, response: { wrongChannel, noMusic } } = require('../../../config/config.json');
const { homepage } = require('../../../package.json');


module.exports = new Command({
	name: 'queue',
	aliases: [ 'q', 'list' ],
	syntax: 'queue <page>',
	description: 'Shows the current queue.',
	async run(message, args, client) {
		const guildQueue = await queue.get(message.guild.id);
        if (!guildQueue) return message.channel.send(`${warning} ${noMusic}`);

        if (!message.member.voice.channel || guildQueue.connection.joinConfig.channelId != message.member.voice.channel.id) return message.channel.send(`${warning} ${wrongChannel}`);

		if (!guildQueue.songs.length) return message.channel.send(`${warning} The queue is empty.`);
		
		if (guildQueue.songs.length == 1) {
			const response = await message.channel.send(`${warning} There is only the current song in the queue.`);
			await new Promise(resolve => setTimeout(resolve, 3500));
			const npcmd = client.commands.get('nowplaying');
			if (!npcmd) return consoleLog('[WARN] Can\'t find the nowplaying command.');
			if ( (await response.channel.messages.fetch({ limit: 1, cache: false, around: response.id })).has(response.id) ) response.delete();
			return npcmd.run(message, [], client);
		}

		let page = 0;

		// if args[0] is a number, set page to args[0]
		if (args[0] && !isNaN(args[0])) page = args[0] - 1;
		
		let pages = [];
		for (let i = 0; i < Math.ceil(guildQueue.songs.length / 10); i++) {
			pages[i] = new EmbedBuilder()
				.setColor(0x3399FF)
				.setAuthor({
        		    name: client.user.username,
        		    url: homepage,
        		    iconURL: client.user.displayAvatarURL({ size: 1024, dynamic: true })
        		})
				.setDescription(`${guildQueue.songs.map((song, index) => `\`${index}.\` \`${song.length}\` [**${song.title}**](${song.url}) - <@${song.requester.id}>${song.requester2 && song.requester.id != song.requester2.id ? ` <@${song.requester2.id}>` : ''}`).slice(i * 10 + 1, i * 10 + 11).join('\n')}` || `Queue data unavailable.`);
		}
		
		let totalLength = 0;
		guildQueue.songs.slice(1).forEach(song => { // slice(1) to skip counting the current song
			totalLength += Number(song.seconds);
		});

		const messageContent = `:arrow_forward: **${guildQueue.songs[0].title}**\n${success} Current Queue: | ${guildQueue.songs.length - 1} songs | \`${timeConverter(totalLength)}\``
		paginator(message, pages, messageContent, page);	
	}
});
