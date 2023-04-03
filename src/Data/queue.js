const EventEmitter = require('events');
const { spawn } = require('child_process');
const { existsSync, rmSync, createReadStream } = require('fs');
const { createAudioResource, createAudioPlayer, joinVoiceChannel } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const ffmpeg = require('ffmpeg-static');
const { consoleLog } = require('./Log');
const { emoji: { error }, player: { stayInChannel, aloneTimeUntilStop, updateInterval, loudnessNormalization, selfDeaf, debug } } = require('../../config/config.json');


const queue = {
    get: guild => {
        if (!guild) return this.queues;
        try {
            return this.queues[guild];
        }
        catch {
            this.queues = { [guild]: null }
            return this.queues[guild];
        }
    },
    construct: (message, songs) => {
        const guild = message.guild.id;
        this.queues[guild] = {
            voiceChannelId: message.member.voice.channel.id,
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
                emitter: new EventEmitter(),
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


        if (this.queues[guild].songs.length < 1) {
            this.queues[guild].updater.emitter.emit('end');
            clearInterval(this.queues[guild].updater.interval);
            this.queues[guild].updater.active = false;
            this.queues[guild].resource.ffmpeg.currentOptions = null;
            if (!stayInChannel) {
                await new Promise(resolve => setTimeout(resolve, 300));
                this.queues[guild].connection.destroy();
                terminate(guild);
            }
            return;
        }

        if (!options.localPath) this.queues[guild].resource.ytdl = ytdl(this.queues[guild].songs[0].url, { quality: 'highestaudio', highWaterMark: 1 << 26 }); // highWaterMark: 1048576 * 32  fixes stream stopping (for a while) // also posible 1 << 25
        else this.queues[guild].resource.ytdl = createReadStream(options.localPath);
        this.queues[guild].resource.ytdl.on('error', err => this.queues[guild].player.emit('error', err, null, true) );

        const ffmpegOptions = [
            // Remove ffmpeg's console spamming
            '-loglevel', '8', '-hide_banner',
            // Set input
            '-i', 'pipe:3',
            // Define output stream
            '-f', 'wav', 'pipe:4',
        ]

        if (options.seek > 0) ffmpegOptions.splice(ffmpegOptions.length - 3, 0, '-ss', `${options.seek}`);  // seek to time
        //if (loudnessNormalization && options.localPath) ffmpegOptions.splice(ffmpegOptions.length - 3, 0, '-af', `volume=0.1`);  // loudness normalization
        if (loudnessNormalization) ffmpegOptions.splice(ffmpegOptions.length - 3, 0, '-af', `loudnorm=I=-32`);  // loudness normalization
        //if (loudnessNormalization) ffmpegOptions.splice(ffmpegOptions.length - 3, 0, '-af', `loudnorm=I=-16:TP=-1:LRA=11:print_format=json`);  // loudness normalization
        if (!isNaN(options.bass) && options.bass != 0) ffmpegOptions.splice(ffmpegOptions.length - 3, 0, '-af', `bass=g=${options.bass}`);  // bass boost
        if (options.speed) ffmpegOptions.splice(ffmpegOptions.length - 3, 0, '-af', `atempo=${options.speed}`);  // speed
        this.queues[guild].resource.ffmpeg.currentOptions = ffmpegOptions;

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

        
        if (!this.queues[guild].updater.active && updateInterval > 0) {
            this.queues[guild].updater.interval = setInterval(() => {
                if (this.queues[guild] && this.queues[guild].resource.resource)
                    this.queues[guild].updater.emitter.emit('update', this.queues[guild].songs[0], this.queues[guild].resource.resource.playbackDuration/1000 + this.queues[guild].resource.seek);
            }, updateInterval < 5000 ? 5000 : updateInterval);
            this.queues[guild].updater.active = true;
        }
    
        this.queues[guild].player.play(this.queues[guild].resource.resource);
        this.queues[guild].updater.emitter.emit('update', this.queues[guild].songs[0], options.seek ? 0 + options.seek : 0);
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
            randomIndex = Math.floor(Math.random() * currentIndex) + start;
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
    remove: (guild, index) => {
        this.queues[guild].songs.splice(index, 1);
    },
    volume: (guild, volume, persist = false) => {
        if (!volume) return Math.round( ( ( Math.log( this.queues[guild].resource.resource.volume.volume * (Math.E-1) + 1 ) * 2 ) * 100 + Number.EPSILON ) * 100) / 10000;
        else {
            this.queues[guild].resource.resource.volume.setVolume( (Math.exp(volume / 2)-1)/(Math.E-1) );
            if (persist) this.queues[guild].resource.volume = (Math.exp(volume / 2)-1)/(Math.E-1);
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
        this.queues[guild].aloneTimeout = setTimeout(() => {
            if (this.queues[guild]) {
                this.queues[guild].connection.destroy();
                this.queues[guild].updater.emitter.emit('end');
                terminate(guild);
            }
        }, aloneTimeUntilStop * 1000);
    },
    unpipe: guild => {
        this.queues[guild].resource.ytdl.unpipe(this.queues[guild].resource.ffmpeg.process.stdio[3]);
        this.queues[guild].resource.ytdl.destroy();
        this.queues[guild].resource.ffmpeg.process.kill('SIGINT');
    },
    delete: guild => {
        clearInterval(this.queues[guild].updater.interval);
        delete this.queues[guild];
        if (existsSync(`./temp/${guild}`)) {
            rmSync(`./temp/${guild}`, { force: true, recursive: true, maxRetries: 10, retryDelay: 350 });
        }
    },



    queues: {}
}

const player = queue.player;
const skip = queue.skip;
const terminate = queue.delete;
const unpipe = queue.unpipe;


module.exports = queue;
