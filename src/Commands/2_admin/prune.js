const Command = require('../../Structures/Command.js');

const { PermissionsBitField } = require('discord.js');
const { bot: { prefix, ownerID }, emoji: { success, warning }, response: { missingArguments, invalidPermissions, invalidNumber } } = require('../../../config/config.json');

module.exports = new Command({
	name: 'prune',
    aliases: [ 'purge', 'clean' ],
    syntax: 'prune <amount>',
	description: 'Deletes the amount of messages send by the bot and the commands used to invoke the bot. Requires Manage Messages permission.',
	async run(message, args, client) {
		if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages) && message.author.id != ownerID) return message.channel.send(`${warning} ${invalidPermissions} (Manage Messages)`);
        if (!args[0]) return message.channel.send(`${warning} ${missingArguments}`);
        if (isNaN(args[0])) return message.channel.send(`${warning} ${invalidNumber}`);
        if (args[0] > 100 || args[0] < 1) return message.channel.send(`${warning} Outside of number range!`);

        const response = await message.channel.send(`${success} Deleting up to ${args[0]} messages. This may take a while...`)

        const result = await message.channel.messages.fetch({limit: 100});

        const resultArray = new Array();
        result.each(message => resultArray.push(message));

        const messagesToBeDeleted = new Array();

        let messagesDeleted = 0;
        for (let i = 2; i < resultArray.length; i++) {
            if (resultArray[i] && resultArray[i].author.id == client.user.id && resultArray[i].createdTimestamp < (Date.now() - 8000)) { //older than 8 seconds for reactions
                messagesToBeDeleted.push(resultArray[i]);
                messagesDeleted++;
                if (resultArray[i+1] && resultArray[i+1].content.startsWith(prefix)) {
                    messagesToBeDeleted.push(resultArray[i+1]);
                    messagesDeleted++;
                }
            }
            if (messagesDeleted >= args[0]) break;
        }

        message.channel.bulkDelete(messagesToBeDeleted, false);

        setTimeout( async () => {
            const fetched = await response.channel.messages.fetch({ limit: 2, cache: false, around: response.id });
            if (fetched.has(response.id)) response.delete();
            if (fetched.has(message.id)) message.delete();
        }, 3750);
	}
});
