(async function() {  // async wrapper to use await in top level

const { parentPort, Worker } = require('worker_threads');
const { spawn } = require('child_process');
const { existsSync, rmSync, createReadStream } = require('fs');
const { Client, GatewayIntentBits, IntentsBitField } = require('discord.js')
const { createAudioResource, createAudioPlayer, joinVoiceChannel } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const playdl = require('play-dl');
const ffmpeg = require('ffmpeg-static');
const { consoleLog } = require('./Log');
const { bot: { token }, emoji: { success, error }, player: { stayInChannel, aloneTimeUntilStopSeconds, updateIntervalMiliseconds, loudnessNormalization, bitrate, selfDeaf, debug, library, sponsorBlock, youtubeCookie } } = require('../../config/config.json');

let sponsorBlockWorker;
if (sponsorBlock.enabled) sponsorBlockWorker = new Worker('./src/Data/sponsorblockWorker.js', { name: 'sponsorblockWorker' });

playdl.getFreeClientID().then((clientID) => playdl.setToken({
    soundcloud : {
        client_id : clientID
    },
    youtube : {
        cookie : youtubeCookie
    }
}));


const intents = new IntentsBitField([
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildVoiceStates,
	GatewayIntentBits.GuildMessages
]);
const client = new Client({ intents });

client.on('ready', () => {
    consoleLog(`[INFO] ${client.user.username} voice client is online and ready on ${client.guilds.cache.size} servers!`);
});

client.on('voiceStateUpdate', (oldState, newState) => {
    const guildQueue = queue.get(oldState.guild.id);
    if (!guildQueue) return;

    if (oldState.channel && oldState.channel.id == guildQueue.connection.joinConfig.channelId && oldState.channel.members.size <= 1) queue.timeout(oldState.guild.id);
    if (newState.channel && newState.channel.id == guildQueue.connection.joinConfig.channelId && newState.channel.members.size > 1) queue.timeout(newState.guild.id, true);
});

await client.login(token);


const queue = {
    get: guild => {
        const getQueue = (guildId) => { 
            return {
                voiceChannelId: this.queues[guildId].voiceChannelId,
                textChannelId: this.queues[guildId].textChannelId,
                resource: {
                    resource: {
                        playbackDuration: this.queues[guildId].resource.resource ? this.queues[guildId].resource.resource.playbackDuration : -1,
                        volume: {
                            volume: this.queues[guildId].resource.resource ? this.queues[guildId].resource.resource.volume.volume : -1
                        }
                    },
                    ffmpeg: {
                        currentOptions: this.queues[guildId].resource.ffmpeg.currentOptions
                    },
                    seek: this.queues[guildId].resource.seek,
                    volume: this.queues[guildId].resource.volume
                },
                player: {
                    state: {
                        status: this.queues[guildId].player ? this.queues[guildId].player.state.status : 'idle'
                    }
                },
                connection: {
                    joinConfig: {
                        channelId: this.queues[guildId].connection ? this.queues[guildId].connection.joinConfig.channelId : -1
                    }
                },
                updater: {
                    interval: {
                        _repeat: this.queues[guildId].updater.interval ? this.queues[guildId].updater.interval._repeat : -1
                    },
                    active: this.queues[guildId].updater.active,
                },
                aloneTimeout: this.queues[guildId].aloneTimeout ? true : false,
                repeat: this.queues[guildId].repeat,
                songs: this.queues[guildId].songs
            }
        }


        if (!this.queues) {
            this.queues = { [guild]: null }
            return this.queues[guild];
        }
        if (guild && !this.queues[guild]) return null;

        if (guild) return getQueue(guild);

        if (!guild && Object.keys(this.queues).length) {
            const queues = {};
            for (const guildId in this.queues) {
                queues[guildId] = getQueue(guildId);
            }
            return queues;
        }

        return {};
    },
    construct: async (channelId, messageId, songs) => {
        const channel = await client.channels.fetch(channelId);
        const message = await channel.messages.fetch(messageId);

        const guild = message.guild.id;
        this.queues[guild] = {
            voiceChannelId: message.member.voice.channel.id,
            textChannelId: message.channel.id,
            textChannel: message.channel,
            resource: {
                resource: null,
                ytdl: null,
                ffmpeg: {
                    process: null,
                    currentOptions: [],
                    localPath: null
                },
                seek: 0,
                volume: (Math.exp(0.75 / 2)-1)/(Math.E-1)
            },
            player: createAudioPlayer(),
            connection: joinVoiceChannel({
                channelId: message.member.voice.channel.id,
                guildId: message.member.guild.id,
                adapterCreator: message.member.guild.voiceAdapterCreator,
                selfDeaf: selfDeaf,
                debug: debug
            }),
            updater: {
                interval: null,
                active: false,
            },
            aloneTimeout: null,
            repeat: false,
            songs: songs

        }

        this.queues[guild].connection.subscribe(this.queues[guild].player);


        this.queues[guild].player.on('idle', () => {
            if (this.queues[guild]) {
                if (!this.queues[guild].repeat) this.queues[guild].songs.shift();
                else if (this.queues[guild].repeat == 'all') this.queues[guild].songs.push( this.queues[guild].songs.shift() );
                player(guild);
            }
        });

        this.queues[guild].player.on('error', (err, resource, ytdl) => {
            this.queues[guild].textChannel.send(`**${error}** ${ytdl ? 'YTDL' : 'Player'} error: **${err.message}** on song **${this.queues[guild].songs[0].title}**`);
            consoleLog(`[WARN] ${ytdl ? 'YTDL' : 'Player'} error on song ${this.queues[guild].songs[0].title}`, err, resource);

            this.queues[guild].songs.shift();
            player(guild);
        });
    },
    player: async (guild, options = {}) => {
        if (options.inherit) {
            if (!options.seek && isNaN(options.seek)) options.seek = this.queues[guild].resource.seek + this.queues[guild].resource.resource.playbackDuration/1000;
            if (!options.bass && isNaN(options.bass)) {
                for (let i = 0; i < this.queues[guild].resource.ffmpeg.currentOptions.length; i++) {
                    if (this.queues[guild].resource.ffmpeg.currentOptions[i].startsWith('bass=g=')) {
                        options.bass = this.queues[guild].resource.ffmpeg.currentOptions[i].split('=')[2];
                        break;
                    }
                }
            }
            if (!options.localPath) options.localPath = this.queues[guild].resource.ffmpeg.localPath;
            if (!options.speed) {
                for (let i = 0; i < this.queues[guild].resource.ffmpeg.currentOptions.length; i++) {
                    if (this.queues[guild].resource.ffmpeg.currentOptions[i].startsWith('atempo=')) {
                        options.speed = this.queues[guild].resource.ffmpeg.currentOptions[i].split('=')[1];
                        break;
                    }
                }
            }
        }
        options.seek ? this.queues[guild].resource.seek = options.seek : this.queues[guild].resource.seek = 0;
        options.localPath ? this.queues[guild].resource.ffmpeg.localPath = options.localPath : this.queues[guild].resource.ffmpeg.localPath = null;

        clearInterval(this.queues[guild].endSegmentInterval);

        if (this.queues[guild].songs.length < 1) {
            parentPort.postMessage({ event: 'npupdate', eventName: 'end', guild });
            clearInterval(this.queues[guild].updater.interval);
            this.queues[guild].updater.active = false;
            this.queues[guild].resource.ffmpeg.currentOptions = null;
            if (!stayInChannel) {
                await new Promise(resolve => setTimeout(resolve, 300));
                terminate(guild);
            }
            return;
        }
        
        const ffmpegOptions = [
            // Remove ffmpeg's console spamming
            '-loglevel', '8', '-hide_banner',
            // Set input
            '-i', 'pipe:3',
            // set codec to opus
            '-c:a', 'libopus',
            // set bitrate to 96k
            '-b:a', bitrate,
            // Define output stream
            '-f', 'opus', 'pipe:4',
        ]

        if (options.seek > 0) ffmpegOptions.splice(ffmpegOptions.length - 3, 0, '-ss', `${options.seek}`);  // seek to time
        if (loudnessNormalization) ffmpegOptions.splice(ffmpegOptions.length - 3, 0, '-af', `loudnorm=I=-32`);  // loudness normalization
        if (!isNaN(options.bass) && options.bass != 0) ffmpegOptions.splice(ffmpegOptions.length - 3, 0, '-af', `bass=g=${options.bass}`);  // bass boost
        if (options.speed) ffmpegOptions.splice(ffmpegOptions.length - 3, 0, '-af', `atempo=${options.speed}`);  // speed
        this.queues[guild].resource.ffmpeg.currentOptions = ffmpegOptions;

        const isSoundcloud = /^https?:\/\/(www\.|api\.)?soundcloud\.com\/.*$/.test(this.queues[guild].songs[0].url);
        try {
            if (!options.localPath && library.player == 'ytdl-core' && !isSoundcloud) this.queues[guild].resource.ytdl = ytdl(this.queues[guild].songs[0].url, { quality: 'highestaudio', highWaterMark: 1 << 25, requestOptions: { headers: { cookie: youtubeCookie } } }); // highWaterMark: 1048576 * 32  fixes stream stopping (for a while) // also posible 1 << 25
            else if (!options.localPath && library.player == 'play-dl' || isSoundcloud) this.queues[guild].resource.ytdl = (await playdl.stream(this.queues[guild].songs[0].url, { quality: 2, discordPlayerCompatibility: true })).stream; //discordPlayerCompatibility for ffmpeg compatibility
            else this.queues[guild].resource.ytdl = createReadStream(options.localPath);
            this.queues[guild].resource.ytdl.on('error', err => this.queues[guild].player.emit('error', err, null, true) );
        }
        catch (err) {
            this.queues[guild].player.emit('error', err, null, true);
            return;
        }

        this.queues[guild].resource.ffmpeg.process = spawn(ffmpeg, ffmpegOptions, {
            windowsHide: true,
            stdio: [
                // Standard: stdin, stdout, stderr
                'inherit', 'inherit', 'inherit',
                // Custom: pipe:3, pipe:4
                'pipe', 'pipe'
            ],
        });

        this.queues[guild].resource.ytdl.pipe(this.queues[guild].resource.ffmpeg.process.stdio[3]);

        this.queues[guild].resource.resource = createAudioResource(
            this.queues[guild].resource.ffmpeg.process.stdio[4],
            { inlineVolume: true } 
        );
        this.queues[guild].resource.resource.volume.setVolume( this.queues[guild].resource.volume );


        //updater can't be moved to constructor because it is cleared on queue end, but the bot doesn't disconnect so constructor is not called again
        if (!this.queues[guild].updater.active && updateIntervalMiliseconds > 0) {
            this.queues[guild].updater.interval = setInterval(() => {
                if (this.queues[guild] && this.queues[guild].resource.resource)
                    parentPort.postMessage({ event: 'npupdate', eventName: 'update', guild, song: this.queues[guild].songs[0], duration: this.queues[guild].resource.resource.playbackDuration/1000 + this.queues[guild].resource.seek, playerState: this.queues[guild].player.state.status, nextSong: this.queues[guild].songs[1] });
            }, updateIntervalMiliseconds < 5000 ? 5000 : updateIntervalMiliseconds);
            this.queues[guild].updater.active = true;
        }

        this.queues[guild].player.play(this.queues[guild].resource.resource);
        parentPort.postMessage({ event: 'npupdate', eventName: 'update', guild, song: this.queues[guild].songs[0], duration: options.seek ? options.seek : 0, playerState: this.queues[guild].player.state.status, nextSong: this.queues[guild].songs[1] });

        
        if (!sponsorBlock.enabled || options.localPath || isSoundcloud) return;

        const settings = require('../../config/settings.json');

        if (settings.guild[guild] && settings.guild[guild].sponsorBlock && settings.guild[guild].sponsorBlock.start == false && settings.guild[guild].sponsorBlock.end == false) return;

        if (!this.queues[guild].songs[0].segments) {
            await new Promise(async resolve => {
                sponsorBlockWorker.postMessage({ event: 'get', url: this.queues[guild].songs[0].url });
                let fulfilled = false;
                const listener = message => {
                    if (message.event == 'get' && message.url == this.queues[guild].songs[0].url) {
                        this.queues[guild].songs[0].segments = message.data;
                        resolve();
                        fulfilled = true;
                    }
                }
                sponsorBlockWorker.on('message', listener);
                while (!fulfilled) {
                    await new Promise(resolve => setTimeout(resolve, 750));
                }
                sponsorBlockWorker.removeListener('message', listener);
            });
        }

        const segments = this.queues[guild].songs[0].segments;
        if (!segments.length) return;
        const lastindex = segments.length - 1;
        if (!this.queues[guild].songs[0].skippedSegments) this.queues[guild].songs[0].skippedSegments = [];

        if (segments[0].startTime < sponsorBlock.maxStartOffsetSeconds && segments[0].endTime - segments[0].startTime > sponsorBlock.minSegmentLengthSeconds && !this.queues[guild].songs[0].skippedSegments.includes(segments[0].UUID)) {
            if (settings.guild[guild] && settings.guild[guild].sponsorBlock && settings.guild[guild].sponsorBlock.start == false) null;  //basically return but not so code after this 'return' executes
            else {
                this.queues[guild].songs[0].skippedSegments.push(segments[0].UUID);
                sponsorBlockWorker.postMessage({ event: 'viewed', UUID: segments[0].UUID });
                player(guild, { inherit: true, seek: segments[0].endTime - 0.1 });
                if (settings.guild[guild] && settings.guild[guild].sponsorBlock && settings.guild[guild].sponsorBlock.messages == false) null;
                else this.queues[guild].textChannel.send(`${success} Skipping music off-topic segment to ${(segments[0].endTime - 0.1).toFixed(1)} seconds.`);
            }
        }
        else if (segments[lastindex].videoDuration - segments[lastindex].endTime < sponsorBlock.maxEndOffsetSeconds && segments[lastindex].endTime - segments[lastindex].startTime > sponsorBlock.minSegmentLengthSeconds) {
            if (settings.guild[guild] && settings.guild[guild].sponsorBlock && settings.guild[guild].sponsorBlock.end == false) null;
            else {
                this.queues[guild].endSegmentInterval = setInterval(() => {
                    if (this.queues[guild].resource.resource.playbackDuration/1000 + this.queues[guild].resource.seek > segments[lastindex].startTime + 0.1) {
                        sponsorBlockWorker.postMessage({ event: 'viewed', UUID: segments[lastindex].UUID });
                        skip(guild);
                        if (settings.guild[guild] && settings.guild[guild].sponsorBlock && settings.guild[guild].sponsorBlock.messages == false) null;
                        else this.queues[guild].textChannel.send(`${success} Skipping the current song as it has only music off-topic segments left.`);
                        clearInterval(this.queues[guild].endSegmentInterval);
                    }
                }, 100);
            }
        }
    },
    push: (guild, song) => {
        this.queues[guild].songs.push(song);
    },
    unshift: (guild, song) => {
        // insert song to second position in queue
        this.queues[guild].songs.splice(1, 0, song);
    },
    shuffle: (guild, start = 1) => {
        let currentIndex = this.queues[guild].songs.length;
        let randomIndex;

        while (currentIndex != start) { // 1 to not shuffle 1st
            randomIndex = Math.floor(Math.random() * ( currentIndex - start )) + start;
            currentIndex--;

            [ this.queues[guild].songs[currentIndex], this.queues[guild].songs[randomIndex] ] = [ 
                this.queues[guild].songs[randomIndex], this.queues[guild].songs[currentIndex] ];
        }
    },
    move: (guild, from, to) => {
        const song = this.queues[guild].songs.splice(from, 1)[0];
        this.queues[guild].songs.splice(to, 0, song);
    },
    repeat: (guild, mode) => {
        this.queues[guild].repeat = mode;
    },
    skip: async guild => {
        const repeat = this.queues[guild].repeat;
        this.queues[guild].repeat = false;

        unpipe(guild);
        this.queues[guild].player.stop();

        await new Promise(resolve => setTimeout(resolve, 250));
        this.queues[guild].repeat = repeat;
    },
    skipto: (guild, index) => {
        // shift song to index
        for (let i = 0; i < index - 1; i++) {
            if (this.queues[guild].repeat) this.queues[guild].songs.push( this.queues[guild].songs.shift() );
            else this.queues[guild].songs.shift();
        }
        
        skip(guild);
    },
    pause: (guild, unpause) => {
        if (unpause) this.queues[guild].player.unpause();
        else this.queues[guild].player.pause();
    },
    remove: (guild, index) => {
        this.queues[guild].songs.splice(index, 1);
    },
    volume: (guild, volume, persist = false) => {
        if (!volume) return Math.round( ( ( Math.log( this.queues[guild].resource.resource.volume.volume * (Math.E-1) + 1 ) * 2 ) * 100 + Number.EPSILON ) * 100) / 10000;
        else {
            this.queues[guild].resource.resource.volume.setVolume( (Math.exp(volume / 2)-1)/(Math.E-1) );
            if (persist) this.queues[guild].resource.volume = (Math.exp(volume / 2)-1)/(Math.E-1);
            return null;
        }
    },
    forceremove: (guild, user) => {
        const previousLength = this.queues[guild].songs.length;
        this.queues[guild].songs = this.queues[guild].songs.filter((song, index) => song.requester.id != user || index == 0);
        return previousLength - this.queues[guild].songs.length;
    },
    leavecleanup: (guild, users) => {
        const previousLength = this.queues[guild].songs.length;
        this.queues[guild].songs = this.queues[guild].songs.filter((song, index) => users.includes(song.requester.id) || index == 0);
        return previousLength - this.queues[guild].songs.length;
    },
    removeduplicates: guild => {
        const previousLength = this.queues[guild].songs.length;
        this.queues[guild].songs = this.queues[guild].songs.filter((song, index) => this.queues[guild].songs.findIndex(s => s.url == song.url) == index);
        return previousLength - this.queues[guild].songs.length;
    },
    timeout: (guild, clear = false) => {
        if (clear) return clearTimeout(this.queues[guild].aloneTimeout);
        if (aloneTimeUntilStopSeconds < 0) return;
        this.queues[guild].aloneTimeout = setTimeout(() => {
            if (this.queues[guild]) {
                terminate(guild);
            }
        }, aloneTimeUntilStopSeconds * 1000);
    },
    unpipe: guild => {
        this.queues[guild].resource.ytdl.unpipe(this.queues[guild].resource.ffmpeg.process.stdio[3]);
        this.queues[guild].resource.ytdl.destroy();
        this.queues[guild].resource.ffmpeg.process.kill('SIGINT');
    },
    delete: guild => {
        parentPort.postMessage({ event: 'npupdate', eventName: 'end', guild });
        parentPort.postMessage({ event: 'deleteEmitter', guild });
        this.queues[guild].connection.destroy();
        clearInterval(this.queues[guild].updater.interval);
        clearInterval(this.queues[guild].endSegmentInterval);
        delete this.queues[guild];
        if (existsSync(`./temp/${guild}`)) rmSync(`./temp/${guild}`, { force: true, recursive: true, maxRetries: 10, retryDelay: 350 });
    },



    queues: {}
}

const player = queue.player;
const skip = queue.skip;
const terminate = queue.delete;
const unpipe = queue.unpipe;

parentPort.on('message', message => {
    switch (message.event) {
        case 'get':
            const getData = queue.get(message.guild);
            parentPort.postMessage({ event: 'get', guild: message.guild, data: getData });
            break;
        case 'construct':
            queue.construct(message.channelId, message.messageId, message.songs);
            break;
        case 'player':
            queue.player(message.guild, message.options);
            break;
        case 'push':
            queue.push(message.guild, message.song);
            break;
        case 'unshift':
            queue.unshift(message.guild, message.song);
            break;
        case 'shuffle':
            queue.shuffle(message.guild, message.start);
            break;
        case 'move':
            queue.move(message.guild, message.from, message.to);
            break;
        case 'repeat':
            queue.repeat(message.guild, message.mode);
            break;
        case 'skip':
            queue.skip(message.guild);
            break;
        case 'skipto':
            queue.skipto(message.guild, message.index);
            break;
        case 'pause':
            queue.pause(message.guild, message.unpause);
            break;
        case 'remove':
            queue.remove(message.guild, message.index);
            break;
        case 'volume':
            const volumeData = queue.volume(message.guild, message.volume, message.persist);
            parentPort.postMessage({ event: 'volume', guild: message.guild, data: volumeData });
            break;
        case 'forceremove':
            const forceremoveData = queue.forceremove(message.guild, message.user);
            parentPort.postMessage({ event: 'forceremove', guild: message.guild, user: message.user, data: forceremoveData });
            break;
        case 'leavecleanup':
            const leavecleanupData = queue.leavecleanup(message.guild, message.users);
            parentPort.postMessage({ event: 'leavecleanup', guild: message.guild, users: message.users, data: leavecleanupData });
            break;
        case 'removeduplicates':
            const removeduplicatesData = queue.removeduplicates(message.guild);
            parentPort.postMessage({ event: 'removeduplicates', guild: message.guild, data: removeduplicatesData });
            break;
        case 'unpipe':
            queue.unpipe(message.guild);
            break;
        case 'delete':
            queue.delete(message.guild);
            break;
    }
});

process.on('SIGINT', () => {
    client.destroy();
    sponsorBlockWorker.terminate();
    process.exit(0);
});

consoleLog('[INFO] Queue worker process is online');

})()
