const { parentPort } = require('worker_threads');
const ytdl = require('ytdl-core');
const { SponsorBlock } = require('sponsorblock-api');
const { consoleLog } = require('./Log');
const { player: { sponsorBlock: { clientUUID } } } = require('../../config/config.json');


const sponsorBlockClient = new SponsorBlock(clientUUID);

const getSegments = async url => {
    return new Promise(async resolve => {
        try {
            const videoID = ytdl.getVideoID(url);
            const segments = await sponsorBlockClient.getSegments(videoID, ['music_offtopic']);
            resolve(segments);
        } 
        catch (err) {
            if (err.name != 'ResponseError') consoleLog('[WARN] SponsorBlock API error: ' + err.message, err);
            resolve( [] );
        }
    });    
}

const viewed = async UUID => {
    try {
        await sponsorBlockClient.viewed(UUID);
    }
    catch (err) {
        if (err.name != 'ResponseError') consoleLog('[WARN] SponsorBlock API error: ' + err.message, err);
    }
}


parentPort.on('message', async message => {
    switch (message.event) {
        case 'get':
            const segmentData = await getSegments(message.url);
            parentPort.postMessage({ event: 'get', url: message.url, data: segmentData });
            break;
        case 'viewed':
            viewed(message.UUID);
            break;
    }    
});


process.on('SIGINT', () => {
    process.exit(0);
});


consoleLog('[INFO] SponsorBlock worker process is online');
