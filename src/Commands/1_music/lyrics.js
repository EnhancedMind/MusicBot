const Command = require('../../Structures/Command');

const geniusLib = require('genius-lyrics');
const genius = new geniusLib.Client();

const { EmbedBuilder } = require('discord.js');

const queue = require('../../Data/queue');
const { emoji: { warning, loading, error }, response: { noMusic } } = require('../../../config/config.json');
const { consoleLog } = require('../../Data/Log');
const { homepage } = require('../../../package.json');


module.exports = new Command({
	name: 'lyrics',
	aliases: [ 'l', 'text' ],
    syntax: 'lyrics <opt query>',
	description: 'Searches for lyrics on Genius based on the currently playing song (video) title or a passed query.',
	async run(message, args, client) {
		const guildQueue = await queue.get(message.guild.id);
        if (!guildQueue && !args[0]) return message.channel.send(`${warning} ${noMusic}`);

        const response = await message.channel.send(`${loading} Fetching lyrics...`);

		try {
            let searches, errResponse;
            if (!args[0]) {
                searches = await genius.songs.search(guildQueue.songs[0].title, { sanitizeQuery: true });
                errResponse = `${error} Lyrics for \`${guildQueue.songs[0].title}\` couldn't be found. Try entering the song name manually \`(lyrics [song name])\``
            } 
            else {
                searches = await genius.songs.search(args.join(' '), { sanitizeQuery: true });
                errResponse = `${error} Lyrics for \`${args.join(' ')}\` couldn't be found.`
            }
            if (!searches.length) {
                if ( (await response.channel.messages.fetch({ limit: 1, cache: false, around: response.id })).has(response.id) ) response.edit(errResponse);
                return;
            }

            let lyrics;
            try {
                lyrics = await searches[0].lyrics();
            }
            catch {
                if ( (await response.channel.messages.fetch({ limit: 1, cache: false, around: response.id })).has(response.id) ) response.edit(`${error} Lyrics for \`${searches[0].title}\` couldn't be fetched from first result. Try entering the song name manually \`(lyrics [song name])\``);
                return;
            }


            const splitContent = lyrics.split('\n');

            const parts = [];       // the parts that will be sent as separate messages
            let currentChunk = '';  // the part that will make it into one message
            let currentPart = '';   // the part that contains the current verse/chorus/whatever

            currentPart = splitContent[0] + '\n';
            for (let i = 1; i < splitContent.length; i++) {
                if (splitContent[i].startsWith('[')) {
                    if (currentChunk.length + currentPart.length + 2 > 4080) {  // 4096 - 16 as a safety margin
                        parts.push(currentChunk);
                        currentChunk = '';
                    }
                    currentChunk += currentPart;
                    currentPart = splitContent[i] + '\n';
                }
                else {
                    if (currentPart.length + splitContent[i].length + 2 > 4080) {  // 4096 - 16 as a safety margin
                        if (currentChunk != '') parts.push(currentChunk);
                        currentChunk = '';
                        parts.push(currentPart);
                        currentPart = '';
                    }
                    currentPart += splitContent[i] + '\n';
                }
            }
            currentChunk += currentPart;
            parts.push(currentChunk);


            if( (await response.channel.messages.fetch({ limit: 1, cache: false, around: response.id })).has(response.id) ) response.delete();

            let embeds = [];
            for (let i = 0; i < parts.length; i++) {
                embeds[i] = new EmbedBuilder()
                    .setColor(0x3399FF)
                    .setDescription(parts[i])
            }
            embeds[0]
                .setAuthor({
                    name: `${searches[0].artist.name} Lyrics`
                })
                .setTitle(searches[0].title)
                .setURL(searches[0].url)

            embeds[embeds.length - 1]
                .setFooter({
                    text: homepage,
                    iconURL: client.user.displayAvatarURL({ size: 1024, dynamic: true })
                })

            message.channel.send({ embeds: embeds });
        }
        catch (err) {
            consoleLog('[WARN] Lyrics command error', err);
            message.channel.send(`${warning} Something went wrong! (${err})`);
        }
	}
});
