const { existsSync, mkdirSync, createWriteStream } = require('fs');
const ytdl = require('ytdl-core');

const downloader = (url, guildId) => {
    return new Promise(resolve => {
        const path = `./temp/${guildId}/${url.split('v=')[1]}.wav`;
        if (existsSync(path)) return resolve(path);
        
        if (!existsSync('./temp')) mkdirSync('./temp');
        if (!existsSync(`./temp/${guildId}`)) mkdirSync(`./temp/${guildId}`);

        const stream = ytdl(url, { quality: 'highestaudio', highWaterMark: 1048576 * 32 });
        stream.pipe(createWriteStream(path));
        stream.on('end', async () => {
            resolve(path);
        });
    });
}

module.exports = downloader;
