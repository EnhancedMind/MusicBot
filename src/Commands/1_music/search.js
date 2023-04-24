const Command = require('../../Structures/Command');

const { MessageEmbed, ReactionCollector } = require('discord.js');
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
		// if no voice channel return
		if (!message.member.voice.channel) return message.channel.send(`${warning} ${noChannel}`);
        if (message.member.voice.channel.id == message.guild.afkChannelId) return message.channel.send(`${warning} ${afkChannel}`);

		let guildQueue = queue.get(message.guild.id);
        if (guildQueue && guildQueue.connection.joinConfig.channelId != message.member.voice.channel.id) return message.channel.send(`${warning} ${wrongChannel}`);

		// if no args return
		if (!args[0]) return message.channel.send(`${warning} ${missingArguments}`);	

		let songs = [], position, allEmoji = false;  //declare 4 independent variables
		if ( [ 'top', 't', 'now', 'n' ].includes(args[0].toLowerCase()) ) position = args.shift();

		const response = await message.channel.send(`${searching} Searching for \`[${args.join(' ')}]\``);

		const result = await ytsr(args.join(' '));

		if (result < 1) return response.edit(`${error} Error finding video.`);

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

		// create a new embed with the description of first five results
		const embed = new MessageEmbed()
			.setColor(0x3399FF)
			.setTitle('Search Results')
			.setDescription(songs.map((song, index) => `${emojiList[index]} \`[${song.length}]\` [**${song.title}**](${song.url})`).join('\n'));

		// send the embed as response
		response.edit({ content: `${success} Search results for \`${args.join(' ')}\`:`, embeds: [embed] });

        const react = async () => { 
            for (const emoji of emojiList) {
				response.react(emoji); 
                await new Promise(resolve => setTimeout(resolve, 750));
            }
			allEmoji = true;
        }
        react(); 

		// create a reaction filter
		const filter = (reaction, user) => emojiList.includes(reaction.emoji.name) && user.bot == false;

		// create a new reaction collector
		const collector = new ReactionCollector(response, { filter, time: 35000 });

		// on collect
		collector.on('collect', (reaction, user) => {
			if (reaction.count < 2) return;

			reaction.users.remove(user);

			if (user != message.author) return;

			const index = emojiList.indexOf(reaction.emoji.name);
			if (index >= 5) {
				response.edit({ content:`${success} Cancelled search.`, embeds: [] });
				collector.stop();
				return;
			}

			songs[index].requester = user;

			guildQueue = queue.get(message.guild.id);

			if (!guildQueue) {
				queue.construct(message, [ songs[index] ]);

				queue.player(message.guild.id);
				response.edit({ content: `${success} Added **${songs[index].title}** (\`${songs[index].length}\`) to begin playing`, embeds: [] });
			}
			else {
				if (position) queue.unshift(message.guild.id, songs[index]);
				else queue.push(message.guild.id, songs[index]);
				response.edit({ content: `${success} Added **${songs[index].title}** (\`${songs[index].length}\`) ${[ 'now', 'n' ].includes(position) ? `to begin playing` : `to the queue at position ${position ? '1' : guildQueue.songs.length - 1}` } `, embeds: [] });
				if ( [ 'now', 'n' ].includes(position) ) queue.skip(message.guild.id);
			}
			collector.stop();
		});

		collector.on('end', async () => {
			//wait for allEMoji to be true
			while (!allEmoji) await new Promise(resolve => setTimeout(resolve, 100));
            if (response.deletable) response.reactions.removeAll();
        });
	}
});
