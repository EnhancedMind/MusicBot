const { Worker } = require('worker_threads');
const EventEmitter = require('events');

const { consoleLog } = require('./Log');

const worker = new Worker('./src/Data/queueWorker.js', { name: 'queueWorker' });


const queue = {
    get: guild => {
        return new Promise(async resolve => {
            worker.postMessage({ event: 'get', guild });
            let fulfilled = false;
            const listener = message => {
                if (message.event == 'get' && message.guild == guild) {
                    const data = message.data;
                    if (guild && !this.emitters) this.emitters = { [guild]: null };
                    if (guild && data && !this.emitters[guild]) this.emitters[guild] = new EventEmitter();
                    if (guild && data) data.updater.emitter = this.emitters[guild];
                    resolve(data);
                    fulfilled = true;
                }
            }
            worker.on('message', listener);
            while (!fulfilled) {
                await new Promise(resolve => setTimeout(resolve, 750));
            }
            worker.removeListener('message', listener);
        });
    },
    construct: (message, songs) => {
        worker.postMessage({ event: 'construct', channelId: message.channel.id, messageId: message.id, songs });
    },
    player: async (guild, options = {}) => {
        worker.postMessage({ event: 'player', guild, options });
    },
    push: (guild, song) => {
        worker.postMessage({ event: 'push', guild, song });
    },
    unshift: (guild, song) => {
        worker.postMessage({ event: 'unshift', guild, song });
    },
    shuffle: (guild, start = 1) => {
        worker.postMessage({ event: 'shuffle', guild, start });
    },
    move: (guild, from, to) => {
        worker.postMessage({ event: 'move', guild, from, to });
    },
    repeat: (guild, mode) => {
        worker.postMessage({ event: 'repeat', guild, mode });
    },
    skip: async guild => {
        worker.postMessage({ event: 'skip', guild });
    },
    skipto: (guild, index) => {
        worker.postMessage({ event: 'skipto', guild, index });
    },
    pause: (guild, unpause) => {
        worker.postMessage({ event: 'pause', guild, unpause });
    },
    remove: (guild, index) => {
        worker.postMessage({ event: 'remove', guild, index });
    },
    volume: (guild, volume, persist = false) => {
        return new Promise(async resolve => {
            worker.postMessage({ event: 'volume', guild, volume, persist });
            let fulfilled = false;
            const listener = message => {
                if (message.event == 'volume' && message.guild == guild) {
                    resolve(message.data);
                    fulfilled = true;
                }
            }
            worker.on('message', listener);
            while (!fulfilled) {
                await new Promise(resolve => setTimeout(resolve, 750));
            }
            worker.removeListener('message', listener);
        });
    },
    forceremove: (guild, user) => {
        return new Promise(async resolve => {
            worker.postMessage({ event: 'forceremove', guild, user });
            let fulfilled = false;
            const listener = message => {
                if (message.event == 'forceremove' && message.guild == guild && message.user == user) {
                    resolve(message.data);
                    fulfilled = true;
                }
            }
            worker.on('message', listener);
            while (!fulfilled) {
                await new Promise(resolve => setTimeout(resolve, 750));
            }
            worker.removeListener('message', listener);
        });
    },
    leavecleanup: (guild, users) => {
        return new Promise(async resolve => {
            worker.postMessage({ event: 'leavecleanup', guild, users });
            let fulfilled = false;
            const listener = message => {
                if (message.event == 'leavecleanup' && message.guild == guild && message.users == users) {
                    resolve(message.data);
                    fulfilled = true;
                }
            }
            worker.on('message', listener);
            while (!fulfilled) {
                await new Promise(resolve => setTimeout(resolve, 750));
            }
            worker.removeListener('message', listener);
        });
    },
    removeduplicates: guild => {
        return new Promise(async resolve => {
            worker.postMessage({ event: 'removeduplicates', guild });
            let fulfilled = false;
            const listener = message => {
                if (message.event == 'removeduplicates' && message.guild == guild) {
                    resolve(message.data);
                    fulfilled = true;
                }
            }
            worker.on('message', listener);
            while (!fulfilled) {
                await new Promise(resolve => setTimeout(resolve, 750));
            }
            worker.removeListener('message', listener);
        });
    },
    unpipe: guild => {
        worker.postMessage({ event: 'unpipe', guild });
    },
    delete: guild => {
        worker.postMessage({ event: 'delete', guild });
    },



    emitters: {},
    emitUpdate: (guild, event, song, duration, playerstate, nextsong) => {
        if (this.emitters && this.emitters[guild]) this.emitters[guild].emit(event, song, duration, playerstate, nextsong);
    },
    deleteEmitter: guild => {
        delete this.emitters[guild];
    }
}

worker.on('message', message => {
    switch (message.event) {
        case 'npupdate':
            queue.emitUpdate(message.guild, message.eventName, message.song, message.duration, message.playerState, message.nextSong);
            break;
        case 'deleteEmitter':
            queue.deleteEmitter(message.guild);
            break;
    }
});

process.on('SIGINT', () => {
    worker.terminate();
    consoleLog('[INFO] SIGINT received, terminating worker threads');
    process.exit(0);
});

module.exports = queue;
