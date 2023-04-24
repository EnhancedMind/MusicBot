const Command = require('../../Structures/Command');

const nejlepsi = [
    '274283478885859329', //Tomasek
    '731196499320504372', //Viky
];


module.exports = new Command({
	name: 'nejlepsi',
	aliases: [ 'viky', 'nejlepší' ],
	description: 'Je všeobecně známo, že: Nejlepší je Viky!',
	async run(message, args, client) {
        if (nejlepsi.includes(message.author.id)) {
            message.channel.send(`<@${message.author.id}>?`)
            await new Promise(resolve => setTimeout(resolve, 1750));
            message.channel.send('Ty jseš nejlepší!');
        }
        else {
            message.channel.send('Je všeobecně známo, že:');
            await new Promise(resolve => setTimeout(resolve, 1750));
            message.channel.send('Nejlepší je Viky!');
        }
	}
});
