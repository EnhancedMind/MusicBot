const { existsSync, mkdirSync, createWriteStream } = require('fs');
const ytdl = require('ytdl-core');
const playdl = require('play-dl');
const { player: { library, youtubeCookie } } = require('../../config/config.json');

const downloader = (url, guildId) => {
    return new Promise(async (resolve, reject) => {
        const path = `./temp/${guildId}/${url.split('v=')[1]}.wav`;
        if (existsSync(path)) return resolve(path);
        
        if (!existsSync(`./temp/${guildId}`)) mkdirSync(`./temp/${guildId}`, { recursive: true });

        let stream;
        if (library.downloader == 'ytdl-core') stream = ytdl(url, { quality: 'highestaudio', highWaterMark: 1 << 25, requestOptions: { headers: { cookie: youtubeCookie } } });
        else if (library.downloader == 'play-dl') stream = (await playdl.stream(url, { quality: 2, discordPlayerCompatibility: true })).stream;
        stream.on('error', err => reject(err));
        stream.pipe(createWriteStream(path));
        stream.on('end', async () => {
            resolve(path);
        });
    });
}

module.exports = downloader;
