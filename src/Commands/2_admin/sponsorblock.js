const Command = require('../../Structures/Command.js');

const { PermissionsBitField } = require('discord.js');
const { writeFile } = require('fs');
const { consoleLog } = require('../../Data/Log.js');
const { bot: { ownerID }, emoji: { success, error }, response: { invalidPermissions }, player: { sponsorBlock } } = require('../../../config/config.json');


module.exports = new Command({
	name: 'sponsorblock',
    aliases: [ ' ' ],
    syntax: 'sponsorblock <action> <optionalType> <optionalType> <optionalType>',
	description: 'Sets whether the skipping music off-topic segments and its info messages are enabled in the guild or not. Requires Manage Server permission.',
	async run(message, args, client) {
        if (!sponsorBlock.enabled) return message.channel.send(`${error} SponsorBlock is globally disabled for this bot.`);

		if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild) && message.author.id != ownerID) return message.channel.send(`${error} ${invalidPermissions} (Manage Server)`);
 
        const settingsFile = __dirname + '/../../../config/settings.json';
        const settings = require(settingsFile);

        if (!settings.guild[message.guild.id]) {
            settings.guild[message.guild.id] = {
                sponsorBlock: {
                    start: true,
                    end: true,
                    messages: true
                }
            }
        }

        if (args.length > 0) {
            if ([ 'enable', 'en' ].includes(args[0])) {
                if (args.includes('start')) {
                    settings.guild[message.guild.id].sponsorBlock.start = true;
                }
                else if (args.includes('end')) {
                    settings.guild[message.guild.id].sponsorBlock.end = true;
                }
                else if (args.includes('message')) {
                    settings.guild[message.guild.id].sponsorBlock.messages = true;
                }
                else if (!args[1] || args.includes('all')) {
                    settings.guild[message.guild.id].sponsorBlock.start = true;
                    settings.guild[message.guild.id].sponsorBlock.end = true;
                    settings.guild[message.guild.id].sponsorBlock.messages = true;
                }
            }
            else if ([ 'disable', 'dis' ].includes(args[0])) {
                if (args.includes('start')) {
                    settings.guild[message.guild.id].sponsorBlock.start = false;
                }
                else if (args.includes('end')) {
                    settings.guild[message.guild.id].sponsorBlock.end = false;
                }
                else if (args.includes('message') || args.includes('messages')) {
                    settings.guild[message.guild.id].sponsorBlock.messages = false;
                }
                else if (!args[1] || args.includes('all')) {
                    settings.guild[message.guild.id].sponsorBlock.start = false;
                    settings.guild[message.guild.id].sponsorBlock.end = false;
                    settings.guild[message.guild.id].sponsorBlock.messages = false;
                }
            }
            else if ([ 'reset', 'r' ].includes(args[0])) {
                settings.guild[message.guild.id].sponsorBlock.start = true;
                settings.guild[message.guild.id].sponsorBlock.end = true;
                settings.guild[message.guild.id].sponsorBlock.messages = true;
            }


            writeFile(settingsFile, JSON.stringify(settings, null, 4), err => {
                if (err) consoleLog('Error occured when writing config/settings.json file', err);
            });
        }

        message.channel.send(`${success} The current setting for this server are:\n${JSON.stringify(settings.guild[message.guild.id], null, 4)}`);
	}
});
