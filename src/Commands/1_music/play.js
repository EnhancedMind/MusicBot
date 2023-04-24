const Command = require('../../Structures/Command');

const { ReactionCollector } = require('discord.js');
const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const ytsr = require('yt-search');
const { existsSync, readdirSync } = require('fs')

const { consoleLog } = require('../../Data/Log');
const timeConverter = require('../../Data/time');
const queue = require('../../Data/queue');
const { emoji: { success, info, warning, error, loading }, response: { missingArguments, noChannel, wrongChannel, afkChannel }, player: { playlistFolderPath, maxTime, forbiddenKeywords } } = require('../../../config/config.json');


const emojiList = [ '📥', '🚫' ]

module.exports = new Command({
	name: 'play',
	aliases: [ 'p' ],
    syntax: 'play <YouTube URL | Playlist URL | Search Query | subcommand>',
	description: 'Plays a song or a playlist. Use top (t) or now (n) to put the song at the top of the queue or to play it immediately.',
	async run(message, args, client) {
        if (!message.member.voice.channel) return message.channel.send(`${warning} ${noChannel}`);
        if (message.member.voice.channel.id == message.guild.afkChannelId) return message.channel.send(`${warning} ${afkChannel}`);

        const guildQueue = queue.get(message.guild.id);
        if (guildQueue && guildQueue.player.state.status == 'paused' && !args[0]) {
            guildQueue.player.unpause();
            message.channel.send(`${success} Resumed **${guildQueue.songs[0].title}**.`);
            return;
        }

        if (guildQueue && guildQueue.connection.joinConfig.channelId != message.member.voice.channel.id) return message.channel.send(`${warning} ${wrongChannel}`);

		if (!args[0]) return message.channel.send(`${warning} ${missingArguments}`);

        let response, shuffle, position, dontEdit, songs = [];;  //declare 5 independent variables
        
        if ( [ 'top', 't', 'now', 'n' ].includes(args[0].toLowerCase()) ) position = args.shift();

        if (!guildQueue) {
            queue.construct(message, songs);
        }

        const finder = (keywords, requester2Id, ignoreAttList = false) => {
            return new Promise(async resolve => {
                let requester2 = null;
                if (requester2Id) requester2 = await client.users.fetch(requester2Id);
        
                if (ytpl.validateID(keywords[0]) && ytdl.validateURL(keywords[0]) && !ignoreAttList) {
                    const skipTitle = await loadVideo(keywords[0], requester2)
                    if (skipTitle === 1) {
                        resolve(1);
                        return;
                    }
                    resolve(true);
                    response.edit(`${success} Added **${songs[0].title}** (\`${songs[0].length}\`) to the queue\n${info} This track has a playlist attached. Select ${emojiList[0]} to load playlist.`);
        
        
                    const react = async () => { 
                        for (const emoji of emojiList) {
                            await new Promise(resolve => setTimeout(resolve, 750));
                            response.react(emoji); 
                        } 
                    }
                    react();
                
                    const filter = (reaction, user) => emojiList.includes(reaction.emoji.name) && user.bot == false;
        
                    const collector = new ReactionCollector(response, { filter, time: 15000 } );
        
                    collector.on('collect', async reaction => {
                        if (reaction.count < 2) return;
        
                        reaction.users.remove(message.author);
                        
                        switch (reaction.emoji.name) {
                            case emojiList[0]:
                                await loadList(keywords[0], requester2, skipTitle);
                                songs.forEach(element => {
                                    queue.push(message.guild.id, element);
                                });
                                collector.stop();
                                break;
        
                            case emojiList[1]:
                                collector.stop();
                                break;
                        }
                    });
        
                    collector.on('end', () => {
                        if (response.deletable) response.reactions.removeAll();
                    });
        
                }
                else if (ytpl.validateID(keywords[0])) {
                    await loadList(keywords[0], requester2);
                    resolve();
                }
                else if (ytdl.validateURL(keywords[0])) {
                    if ( await loadVideo(keywords[0], requester2) === 1 ) {  //=== for exact match
                        resolve(1);
                        return;
                    }
                    resolve();
                }
                else {
                    const result = await ytsr(keywords.join(' '));
                    if (result < 1) return message.channel.send(`${error} Error finding video.`);
                    if (result.videos[0].seconds > maxTime && maxTime > 0) return message.channel.send(`${error} **${element.title}**[${timeConverter(result.videos[0].seconds)}] is too long! Max length is **${timeConverter(maxTime)}**.`);
                    if (forbiddenKeywords.some(element => result.videos[0].title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").includes(element))) return message.channel.send(`${error} **${result.videos[0].title}** is forbidden!`);
                    songs.push({ 
                        title: result.videos[0].title,
                        url: result.videos[0].url,
                        length: timeConverter(result.videos[0].seconds),
                        seconds: result.videos[0].seconds,
                        source: result.videos[0].author.name,
                        requester: message.author,
                        requester2: requester2
                    });
                    resolve();
                }
            });
        }
        
        const loadList = async (url, requester2, skipTitle) => {
            return new Promise(async resolve => {
                const result = await ytpl(url, { hl: 'cs', gl: 'CZ', limit: Infinity });
                for (const element of result.items) {
                    if (element.durationSec > maxTime && maxTime > 0) {
                        message.channel.send(`${error} **${element.title}**[${timeConverter(element.durationSec)}] is too long! Max length is **${timeConverter(maxTime)}**.`);
                        await new Promise(resolve => setTimeout(resolve, 1250));  //wait to not get ratelimited by discord api (1250ms)
                        continue;
                    }
                    // if element.title normalize to lowercase and remove accents and special characters and check if it contains any of forbiddenKeywords
                    if (forbiddenKeywords.some(forbid => element.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").includes(forbid))) {
                        message.channel.send(`${error} **${element.title}** is forbidden!`);
                        await new Promise(resolve => setTimeout(resolve, 1250));  //wait to not get ratelimited by discord api (1250ms)
                        continue;
                    }
                    if (element.title == skipTitle) continue;
                    songs.push({
                        title: element.title,
                        url: element.shortUrl,
                        length: timeConverter(element.durationSec),
                        seconds: element.durationSec,
                        source: element.author.name,
                        requester: message.author,
                        requester2: requester2
                    });
                }
                resolve();
            });
        }
        const loadVideo = async (url, requester2) => {
            return new Promise(async resolve => {
                ytdl.getBasicInfo(url)
                    .then(result => {
                        if (result.videoDetails.lengthSeconds > maxTime && maxTime > 0) return message.channel.send(`${error} **${result.videoDetails.title}**[${timeConverter(result.videoDetails.lengthSeconds)}] is too long! Max length is **${timeConverter(maxTime)}**.`);
                        if (forbiddenKeywords.some(element => result.videoDetails.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").includes(element))) return message.channel.send(`${error} **${result.videoDetails.title}** is forbidden!`);
                        songs.push({ 
                            title: result.videoDetails.title,
                            url: result.videoDetails.video_url,
                            length: timeConverter(result.videoDetails.lengthSeconds),
                            seconds: result.videoDetails.lengthSeconds,
                            source: result.videoDetails.author.name,
                            requester: message.author,
                            requester2: requester2
                        });
                        resolve(result.videoDetails.title);
                    })
                    .catch(err => {
                        consoleLog('[WARN] YTDL rejection', err);
                        response.edit(`${error} Error finding video: **${err.message}**.`);
                        resolve(1);
                        return;
                    });
            });
        }
        
        playlistBreak: 
        if ( [ 'playlist', 'pl' ].includes(args[0].toLowerCase()) ) {
            const files = readdirSync(`${__dirname}/../../../config/${playlistFolderPath}`);
            for (const file of files) {
                if (file.startsWith(args[1]) && file.endsWith('.json')) {
                    const playlistFile = `${__dirname}/../../../config/${playlistFolderPath}/${file}`;
                    const playlist = require(playlistFile);
                    response = await message.channel.send(`${loading} Loading playlist **${file.slice(0, -5)}**... (${playlist.items.length} items)`);
                    for (const element of playlist.items) {
                        if (element.disabled) continue;  //breaks current loop iteration (cycle) and continues with next one
                        if ( await finder([element.path], element.requesterId, true) === 1) return;  //=== for exact match
                    }
                    shuffle = playlist.shuffle;
                    break playlistBreak;  //breaks back to the break label
                }
            }
            return message.channel.send(`${error} I could not find \`${args[1]}*.json\` in the Playlists folder.`);
        }
        else {
            response = await message.channel.send(`${loading} Loading \`[${args.join(' ')}]\``);
            dontEdit = await finder(args);
            if (dontEdit === 1) return;  //=== for exact match
        }

        if (!guildQueue) {
            if (shuffle) queue.shuffle(message.guild.id, 0);

            queue.player(message.guild.id);
            if (songs.length == 1 && !dontEdit) response.edit(`${success} Added **${songs[0].title}** (\`${songs[0].length}\`) to begin playing`);
            else if (response.editable && !dontEdit) response.edit(`${success} Added ${shuffle ? 'and shuffled ' : ''}**${songs.length}** tracks!`);
        }
        else {
            if (position) { // position can only be 'top', 't' or 'now', 'n'
                songs.slice().reverse().forEach(element => {
                    queue.unshift(message.guild.id, element);
                });
                if (shuffle) queue.shuffle(message.guild.id);
            }
            else {
                songs.forEach(element => {
                    queue.push(message.guild.id, element);
                });
                if (shuffle) queue.shuffle(message.guild.id, guildQueue.songs.length);
            }
            if (songs.length == 1 && !dontEdit) response.edit(`${success} Added **${songs[0].title}** (\`${songs[0].length}\`) ${[ 'now', 'n' ].includes(position) ? `to begin playing` : `to the queue at position ${position ? '1' : guildQueue.songs.length - 1}` } `);
            else if (response.editable && !dontEdit) response.edit(`${success} Added ${shuffle ? 'and shuffled ' : ''}**${songs.length}** tracks!`);
            
            if (guildQueue.player.state.status == 'idle') {
                await new Promise(resolve => setTimeout(resolve, 100));
                if (guildQueue.player.state.status == 'idle') queue.player(message.guild.id);
            }

            else if ( [ 'now', 'n' ].includes(position) ) queue.skip(message.guild.id);
        }
	}
});

