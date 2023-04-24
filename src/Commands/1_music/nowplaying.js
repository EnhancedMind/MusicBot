const Command = require('../../Structures/Command');

const { MessageEmbed, ReactionCollector } = require('discord.js');
const timeConverter = require('../../Data/time');
const { consoleLog } = require('../../Data/Log');
const queue = require('../../Data/queue');
const { bot: { ownerID, prefix }, emoji: { success, warning, error }, response: { wrongChannel, noMusic }, player: { updateInterval } } = require('../../../config/config.json');
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

        guildQueue.updater.emitter.emit('end');

        const { requester, requester2 } = guildQueue.songs[0];

        let embed = new MessageEmbed()
            .setColor(0x3399FF)
            .setAuthor({
                name: `${requester.tag}${requester2 && requester.id != requester2.id ? ` - ${requester2.tag}` : ''}`,
                url: homepage,
                iconURL: requester.displayAvatarURL({ size: 1024, dynamic: true })
            })
            .setTitle(guildQueue.songs[0].title)
            .setURL(guildQueue.songs[0].url)
            .setDescription(`:arrow_forward: :radio_button:${line.repeat(14)} \`[0:00/${guildQueue.songs[0].length}]\` :loud_sound:`)
            .setFooter({ text: `Source: ${guildQueue.songs[0].source}`})

        const response = await message.channel.send({ content: `${success} **Now Playing...**`, embeds: [embed] });

        if (updateInterval <= 0) return;

        const react = async () => { 
            for (const emoji of emojiList) {
                response.react(emoji); 
                await new Promise(resolve => setTimeout(resolve, 750));
            } 
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

        guildQueue.updater.emitter.on('update', (song, duration) => {
            if (args[0] && args[0].toLowerCase() == 'debug' && message.author.id == ownerID) console.log('npupdate', song, duration);
            track = song;
            const progress = Math.round( duration / song.seconds * 14)
            embed = new MessageEmbed()
                .setColor(0x3399FF)
                .setAuthor({
                    name: `${song.requester.tag}${song.requester2 && song.requester.id != song.requester2.id ? ` - ${song.requester2.tag}` : ''}`,
                    url: homepage,
                    iconURL: song.requester.displayAvatarURL({ size: 1024, dynamic: true })
                })
                .setTitle(song.title)
                .setURL(song.url)
                .setDescription(`${guildQueue.player.state.status == 'playing' ? ':arrow_forward:' : ':pause_button:'} ${line.repeat(progress)}:radio_button:${ (14 - progress) >= 0 ? line.repeat(14 - progress) : 0} \`[${timeConverter(duration)}/${song.length}]\` :loud_sound:`)
                .setFooter({ text: `Source: ${song.source}`})
            
            if (response.editable) {
                try {
                    response.edit({ content: `${success} **Now Playing...**`, embeds: [embed] });
                }
                catch (err) {
                    consoleLog('[WARN] Nowplaying response edit error', err);
                }
            }
            else collector.stop();
        });

        guildQueue.updater.emitter.on('end', () => {
            embed = new MessageEmbed()
                .setColor(0x3399FF)
                .setAuthor(null)
                .setTitle('No music playing')
                .setURL(null)
                .setDescription(`:stop_button: ${line.repeat(15)} :loud_sound:`)
                .setFooter(null)
            if (response.editable) {
                try {
                    response.edit({ content: `${success} **Now Playing...**`, embeds: [embed] });
                }
                finally {}
            } 
            collector.stop();
            guildQueue.updater.emitter.removeAllListeners('update');
            guildQueue.updater.emitter.removeAllListeners('end');
        });

        collector.on('end', async () => {
            if (response.deletable) response.reactions.removeAll();
        });
	}
});
