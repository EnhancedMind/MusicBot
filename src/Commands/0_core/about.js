const Command = require('../../Structures/Command');

const { EmbedBuilder } = require('discord.js');
const { bot: { prefix, ownerID }, logs: { timeFormat } } = require('../../../config/config.json');
const { version, homepage, developerpage } = require('../../../package.json');
const queue = require('../../Data/queue');


module.exports = new Command({
	name: 'about',
	aliases: [ ' ' ],
	description: 'Shows information about the bot.',
	async run(message, args, client) {
		const queues = await queue.get();

		const embed = new EmbedBuilder()
			.setColor(0x3399FF)
			.setAuthor({
				name: `All about ${client.user.username}!`,
				url: homepage,
				iconURL: client.user.displayAvatarURL({ size: 1024, dynamic: true })
			})
			.setDescription(`Hello! I am **${client.user.username}**, a music bot that is [easy to host yourself!](${homepage}) (v${version})
			I am owned by **${(await client.users.fetch(ownerID)).username}** and I am developed by [**EnhancedMind**](${developerpage}).
			I run in **Node.js** using **Discord.js**(v${require('discord.js').version}) libraries.
			I am using [SponsorBlock](https://sponsor.ajay.app/) to skip music off-topic segments.
			Type \`${prefix}help\` to see my commands!
			
			Some of my features include:
			\`\`\`🎶 High-quality music playback.\n🎶 Auto skipping music off-topic segments.\n🎶 Easy to host yourself.\`\`\``)
			.setFooter({
				text: `Last restart: ${new Date(client.readyAt).toLocaleString(timeFormat)}    ·    ${queues && Object.values(queues).filter(Boolean).length > 0 ? `${Object.values(queues).filter(Boolean).length} active connection${Object.values(queues).filter(Boolean).length > 1 ? 's' : ''}` : 'No active connections'}`  //filter(Boolean) because sometimes there is a 'guildId': null entry left
			});

		message.channel.send({ embeds: [ embed ] });
	}
});
