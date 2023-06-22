const Command = require('../../Structures/Command');

const { EmbedBuilder, ReactionCollector } = require('discord.js');
const timeConverter = require('../../Data/time');
const queue = require('../../Data/queue');
const { bot: { ownerID, prefix }, emoji: { success, warning, error }, response: { wrongChannel, noMusic }, player: { updateIntervalMiliseconds } } = require('../../../config/config.json');
const { homepage } = require('../../../package.json');


const emojiList = [ '⏭️', '⏯️' ];
const line = '▬';

module.exports = new Command({
	name: 'nowplaying',
	aliases: [ 'np', 'current' ],
	description: 'Shows the currently playing song.',
	async run(message, args, client) {
		const guildQueue = queue.get(message.guild.id);
        if (!guildQueue) return message.channel.send(`${warning} ${noMusic}`);

        if (!message.member.voice.channel || guildQueue.connection.joinConfig.channelId != message.member.voice.channel.id) return message.channel.send(`${warning} ${wrongChannel}`);

        if (!guildQueue.songs.length) return message.channel.send(`${warning} The queue is empty.`);

        guildQueue.updater.emitter.emit('end');

        const { requester, requester2 } = guildQueue.songs[0];

        let embed = new EmbedBuilder()
            .setColor(0x3399FF)
            .setAuthor({
                name: `${requester.username}${requester2 && requester.id != requester2.id ? ` - ${requester2.username}` : ''}`,
                url: homepage,
                iconURL: requester.displayAvatarURL({ size: 1024, dynamic: true })
            })
            .setTitle(guildQueue.songs[0].title)
            .setURL(guildQueue.songs[0].url)
            .setDescription(`:arrow_forward: :radio_button:${line.repeat(14)} \`[0:00/${guildQueue.songs[0].length}]\` :loud_sound:`)
            //.setFooter({ text: `Source: ${guildQueue.songs[0].source}`})
            .addFields([ { name: ' ', value: `Source: ${guildQueue.songs[0].source}`, inline: false } ])

        if (guildQueue.songs[1]) {
            embed.addFields([ 
                { name: ' ', value: ' ', inline: false },
                { name: 'Next', value: `[**${guildQueue.songs[1].title}**](${guildQueue.songs[1].url})`, inline: false } ]);
        }

        const response = await message.channel.send({ content: `${success} **Now Playing...**`, embeds: [embed] });

        if (updateIntervalMiliseconds <= 0) return;

        let allEmoji;
        const react = async () => { 
            for (const emoji of emojiList) {
                if ( (await response.channel.messages.fetch({ limit: 1, cache: false, around: response.id })).has(response.id) ) response.react(emoji);
                await new Promise(resolve => setTimeout(resolve, 750));
            }
            allEmoji = true;
        }
        react(); 

        const filter = (reaction, user) => (emojiList.includes(reaction.emoji.name) || reaction.emoji.name == '⏩') && user.bot == false;

        const collector = new ReactionCollector( response, { filter } );

        let track = guildQueue.songs[0];
        collector.on('collect', (reaction, user) => {
            reaction.users.remove(user);
            
            if(!message.guild.members.cache.get(user.id).voice.channel || message.guild.members.cache.get(user.id).voice.channel.id != guildQueue.connection.joinConfig.channelId) {
                message.channel.send(`${warning} ${wrongChannel} **${user.username}**`);
                return;
            }

            switch (reaction.emoji.name) {
                case emojiList[0]:
			        const { title, requester, requester2 } = guildQueue.songs[0];
			        message.channel.send(`${success} Skipped **${title}** (requested by **${requester.username}${requester2 && requester.id != requester2.id ? ` - ${requester2.username}`: ''}**)`);
                    queue.skip(message.guild.id);
                    break;
                
                case emojiList[1]:
                    if (guildQueue.player.state.status == 'paused') {
                        guildQueue.player.unpause();
                        message.channel.send(`${success} Resumed **${track.title}**.`);
                    }
                    else {
                        guildQueue.player.pause();
                        message.channel.send(`${success} Paused **${track.title}**. Type \`${prefix}play\` or \`press the button again\` to unpause!`);
                    } 
                    break;

                case '⏩':
                    message.channel.send(`**${error}** Player error: **aborted** on song **${guildQueue.songs[0].title}**`);
                    queue.skip(message.guild.id);
                    break;
                
            }

        });

        guildQueue.updater.emitter.on('update', async (song, duration, nextsong) => {
            if (args[0] && args[0].toLowerCase() == 'debug' && message.author.id == ownerID) console.log('npupdate', song, duration);
            track = song;
            const progress = Math.round( duration / song.seconds * 14)
            embed = new EmbedBuilder()
                .setColor(0x3399FF)
                .setAuthor({
                    name: `${song.requester.username}${song.requester2 && song.requester.id != song.requester2.id ? ` - ${song.requester2.username}` : ''}`,
                    url: homepage,
                    iconURL: song.requester.displayAvatarURL({ size: 1024, dynamic: true })
                })
                .setTitle(song.title)
                .setURL(song.url)
                .setDescription(`${guildQueue.player.state.status == 'playing' ? ':arrow_forward:' : ':pause_button:'} ${line.repeat(progress)}:radio_button:${ (14 - progress) >= 0 ? line.repeat(14 - progress) : 0} \`[${timeConverter(duration)}/${song.length}]\` :loud_sound:`)
                //.setFooter({ text: `Source: ${song.source}`})
                .addFields([ { name: ' ', value: `Source: ${song.source}`, inline: false } ])
            
            if (nextsong) {
                embed.addFields([ 
                    { name: ' ', value: ' ', inline: false },
                    { name: 'Next', value: `[**${nextsong.title}**](${nextsong.url})`, inline: false } ]);
            }

            if ( (await response.channel.messages.fetch({ limit: 1, cache: false, around: response.id })).has(response.id) ) response.edit({ content: `${success} **Now Playing...**`, embeds: [embed] });
            else {
                collector.stop();
                guildQueue.updater.emitter.emit('end');
            } 
        });

        guildQueue.updater.emitter.on('end', async () => {
            embed = new EmbedBuilder()
                .setColor(0x3399FF)
                .setAuthor(null)
                .setTitle('No music playing')
                .setURL(null)
                .setDescription(`:stop_button: ${line.repeat(15)} \`[terminated]\` :loud_sound:`)
                .setFooter(null)

            if ( (await response.channel.messages.fetch({ limit: 1, cache: false, around: response.id })).has(response.id) ) response.edit({ content: `${success} **Player was terminated.**`, embeds: [embed] });
            
            collector.stop();
            guildQueue.updater.emitter.removeAllListeners('update');
            guildQueue.updater.emitter.removeAllListeners('end');
        });

        collector.on('end', async (_, reason) => {
			if (reason.endsWith('Delete')) return;
            while (!allEmoji) await new Promise(resolve => setTimeout(resolve, 100));
			response.reactions.removeAll();
        });
	}
});
