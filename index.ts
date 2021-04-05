import config from './config.js';
import actions from './actions.js';
import { Client } from 'discord.js';
import statuses from './statuses.js';
import { getRandomElement } from './Utils/general.js';

const client = new Client();

client.on('guildCreate', g => {
	if (!g.systemChannel.permissionsFor(client.user).has('SEND_MESSAGES'))
		return;
	g.systemChannel.send('I\'m here virgins');
});

client.on('channelCreate', c => {
	if (!c.isText() || c.type != 'text')
		return;
	if (!c.permissionsFor(client.user).has('SEND_MESSAGES'))
		return;
	c.send('first lol');
});

client.on('message', async msg => {
	if (msg.author == client.user)
		return;
	
	let runCount = 0;
	for (const ma of actions) {
		try {
			if (await ma.run(msg))
				runCount++;
		} catch (e) {
			console.error(e);
		}
	}
});

let statusInterval: NodeJS.Timeout;
client.on('ready', () => {
	console.log('Running daddy 🥵');

	statusInterval = setTimeout(() => {
		const { name, options } = getRandomElement(statuses);
		client.user.setActivity(name, options);
	}, config.statusInterval);
});

process.on('SIGINT', () => {
	clearInterval(statusInterval);
	client.destroy();
	console.log('Shutting down daddy 🥵');
});

client.login(config.token);

export {
	client
};