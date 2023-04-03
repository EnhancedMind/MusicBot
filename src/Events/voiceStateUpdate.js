const Event = require('../Structures/Event');

const queue = require('../Data/queue');


module.exports = new Event('voiceStateUpdate', (client, oldState, newState) => {
    const guildQueue = queue.get(oldState.guild.id);
    if (!guildQueue) return;

    if (oldState.channel && oldState.channel.id == guildQueue.connection.joinConfig.channelId && oldState.channel.members.size <= 1) queue.timeout(oldState.guild.id);
    if (newState.channel && newState.channel.id == guildQueue.connection.joinConfig.channelId && newState.channel.members.size > 1) queue.timeout(newState.guild.id, true);
});
