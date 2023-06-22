const Discord = require('discord.js');
const Command = require('./Command');
const Event = require('./Event');

const intents = new Discord.IntentsBitField([
	Discord.GatewayIntentBits.Guilds,
	Discord.GatewayIntentBits.GuildVoiceStates,
	Discord.GatewayIntentBits.GuildMessages,
	Discord.GatewayIntentBits.GuildMessageReactions,
	Discord.GatewayIntentBits.MessageContent
]);

const { version, homepage } = require('../../package.json');

const { readdirSync } = require('fs');
const { initLog, fileLog, consoleLog } = require('../Data/Log');
const checkSettingsFiles = require('../Data/settings');
const { bot: { token } } = require('../../config/config.json');


class Client extends Discord.Client {
	constructor() {
		super({ intents });

		/**
		 * @type {Discord.Collection<string, Command>}
		 */
		this.commands = new Discord.Collection();
	}

    start() {
		initLog();
		checkSettingsFiles();

		consoleLog(`\nThis application comes from a GitHub project ${homepage.substring(19, homepage.length - 7)} (${homepage}).\nThe use is possible for free while keeping the credits.\nMade by EnhancedMind\nVersion ${version}\n`);

		readdirSync('./src/Commands')
			.forEach(dirs => {
				readdirSync(`./src/Commands/${dirs}`)
					.filter(file => file.endsWith('.js'))
					.forEach(file => {
						/**
				         * @type {Command}
        				 */
						const command = require(`../Commands/${dirs}/${file}`);
						fileLog(`[INFO] Command ${command.name} loaded`);
		    		    this.commands.set(command.name, command);
					});
			});
        
        readdirSync('./src/Events')
			.filter(file => file.endsWith('.js'))
			.forEach(file => {
				/**
				 * @type {Event}
				 */
				const event = require(`../Events/${file}`);
				fileLog(`[INFO] Event ${event.event} loaded`)
				this.on(event.event, event.run.bind(null, this));
				this.rest.on(event.event, event.run.bind(null, this));
			});

        this.login(token);
    }
}

module.exports = Client;
