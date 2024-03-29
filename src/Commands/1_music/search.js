const Command = require('../../Structures/Command');

const { EmbedBuilder, ReactionCollector } = require('discord.js');
const ytsr = require('yt-search');

const timeConverter = require('../../Data/time');
const queue = require('../../Data/queue');
const { emoji: { success, warning, error, searching }, response: { missingArguments, noChannel, wrongChannel, afkChannel } } = require('../../../config/config.json');


const emojiList = [ '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '❌' ];

module.exports = new Command({
	name: 'search',
	aliases: [ 'sc' ],
	syntax: 'search <query>',
	description: 'Searches YouTube for a provided query.',
	async run(message, args, client) {
		if (!message.member.voice.channel) return message.channel.send(`${warning} ${noChannel}`);
        if (message.member.voice.channel.id == message.guild.afkChannelId) return message.channel.send(`${warning} ${afkChannel}`);

		let guildQueue = await queue.get(message.guild.id);
        if (guildQueue && guildQueue.connection.joinConfig.channelId != message.member.voice.channel.id) return message.channel.send(`${warning} ${wrongChannel}`);

		if (!args[0]) return message.channel.send(`${warning} ${missingArguments}`);	

		let songs = [], position, allEmoji = false;  //declare 3 independent variables
		if ( [ 'top', 't', 'now', 'n' ].includes(args[0].toLowerCase()) ) position = args.shift();

		const response = await message.channel.send(`${searching} Searching for \`[${args.join(' ')}]\``);

		const result = await ytsr(args.join(' '));

		if (result < 1) {
			if ( (await response.channel.messages.fetch({ limit: 1, cache: false, around: response.id })).has(response.id) ) response.edit(`${error} Error finding video.`);
			return;
		}

		for (let i = 0; i < 5; i++) {
			songs.push({
				title: result.videos[i].title,
				url: result.videos[i].url,
				length: timeConverter(result.videos[i].seconds),
				seconds: result.videos[i].seconds,
				source: result.videos[i].author.name,
				requester: null
			});			
		}

		const embed = new EmbedBuilder()
			.setColor(0x3399FF)
			.setTitle('Search Results')
			.setDescription(songs.map((song, index) => `${emojiList[index]} \`[${song.length}]\` [**${song.title}**](${song.url})`).join('\n'));

		if ( (await response.channel.messages.fetch({ limit: 1, cache: false, around: response.id })).has(response.id) ) response.edit({ content: `${success} Search results for \`${args.join(' ')}\`:`, embeds: [embed] });

		const react = async () => {
            for (const emoji of emojiList) {
                if ( (await response.channel.messages.fetch({ limit: 1, cache: false, around: response.id })).has(response.id) ) response.react(emoji);
                await new Promise(resolve => setTimeout(resolve, 750));
            }
			allEmoji = true;
        }
        react(); 

		const filter = (reaction, user) => emojiList.includes(reaction.emoji.name) && user.bot == false;

		const collector = new ReactionCollector(response, { filter, time: 35000 });

		collector.on('collect', async (reaction, user) => {
			if (reaction.count < 2) return;

			reaction.users.remove(user);

			if (user != message.author) return;

			const index = emojiList.indexOf(reaction.emoji.name);
			if (index >= 5) {
				if ( (await response.channel.messages.fetch({ limit: 1, cache: false, around: response.id })).has(response.id) ) response.edit({ content:`${success} Cancelled search.`, embeds: [] });
				collector.stop();
				return;
			}

			songs[index].requester = user;

			guildQueue = await queue.get(message.guild.id);

			if (!guildQueue) {
				queue.construct(message, [ songs[index] ]);

				queue.player(message.guild.id);
				if ( (await response.channel.messages.fetch({ limit: 1, cache: false, around: response.id })).has(response.id) ) response.edit({ content: `${success} Added **${songs[index].title}** (\`${songs[index].length}\`) to begin playing`, embeds: [] });
			}
			else {
				if (position) queue.unshift(message.guild.id, songs[index]);
				else queue.push(message.guild.id, songs[index]);

				if ( (await response.channel.messages.fetch({ limit: 1, cache: false, around: response.id })).has(response.id) ) response.edit({ content: `${success} Added **${songs[index].title}** (\`${songs[index].length}\`) ${( [ 'now', 'n' ].includes(position) || guildQueue.songs.length == 1 ) ? `to begin playing` : `to the queue at position ${position ? '1' : guildQueue.songs.length - 1}` } `, embeds: [] });
				
				if ( (await queue.get(message.guild.id)).player.state.status == 'idle') {
					await new Promise(resolve => setTimeout(resolve, 100));
					if ( (await queue.get(message.guild.id)).player.state.status == 'idle') queue.player(message.guild.id);
				}
				else if ( [ 'now', 'n' ].includes(position) ) queue.skip(message.guild.id);
			}
			collector.stop();
		});

		collector.on('end', async (_, reason) => {
			if (reason.endsWith('Delete')) return;
			while (!allEmoji) await new Promise(resolve => setTimeout(resolve, 100));
            response.reactions.removeAll();
        });
	}
});
