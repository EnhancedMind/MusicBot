const Command = require('../../Structures/Command');

const dubno = [
    '657258752109445120', //David
    '418829015038689280', //Karel
];


module.exports = new Command({
	name: 'dubno',
	aliases: [ ' ' ],
	description: 'Kdybych nebyl debil, na dubně bych nebyl!',
	async run(message, args, client) {
        if (dubno.includes(message.author.id)) return message.channel.send('Kdybys nebyl debil, na dubně bys nebyl!');
        else if (message.author.id == '773189069630341150') {
            const randNum = Math.round( Math.random() * (1-0) + 0 )
            if (randNum == 0) return message.channel.send('Ano, víme, už se tam řítíš Kačenko...');
            else if (randNum == 1) return message.channel.send('Kdybych nebyl debil, na dubně bych nebyl!');   
        }
        else return message.channel.send('Kdybych nebyl debil, na dubně bych nebyl!');
	}
});
