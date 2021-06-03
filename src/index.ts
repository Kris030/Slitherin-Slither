import { getRandomElement } from './utils/general.js';
import { constructMongoURL } from './utils/database.js';
import GuildModel from '../res/models/Guild.js';
import statuses from '../res/statuses.js';
import config from '../config.json';
import actions from '../res/actions.js';
import { Client } from 'discord.js';
import mongoose from 'mongoose';

const client = new Client();

let statusInterval: NodeJS.Timeout = undefined;
try {
	console.log('Starting up... Sanity check 🤡');
	
	await Promise.all([
		client.login(config.token),
		mongoose.connect(constructMongoURL(config.database), {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		})
	]);
} catch (err) {
	console.log('Error while starting up:');
	console.error(err);
	console.log('Shutting down...');
	await shutdownGracefully();
}
const db = mongoose.connection.db;

client.on('guildCreate', g => {
	if (!g.systemChannel?.permissionsFor(client.user)?.has('SEND_MESSAGES'))
		return;
	g.systemChannel.send(`I'm here virgins`);
	
	new GuildModel({
		_id: g.id
	}).save();
});

client.on('guildDelete', g => {
	GuildModel.findByIdAndDelete(g.id).exec();
});

client.on('channelCreate', c => {
	if (!c.isText() || c.type != 'text')
		return;
	if (!c.permissionsFor(client.user)?.has('SEND_MESSAGES'))
		return;
	c.send('first lol');
});

client.on('message', async msg => {
	if (msg.author == client.user)
		return;
	
	let runCount = 0;
	for (const ma of actions()) {
		try {
			if (await ma.run(msg))
				runCount++;
		} catch (e) {
			console.error(e);
		}
	}
});

client.on('ready', () => {
	console.log('Running daddy 🥵');

	const setStatus = () => {
		const { name, options } = getRandomElement(statuses);
		client.user.setActivity(name, options);
	};
	setStatus();
	statusInterval = setTimeout(setStatus, config.statusInterval);
});

process.on('SIGINT', shutdownGracefully);

async function shutdownGracefully() {
	console.log('Shutting down daddy 🥵');
	clearInterval(statusInterval);
	client.destroy();
	await mongoose.connection.close();
	console.log('Shutdown succesful');

	process.exit(0);
}
export {
	client, db, shutdownGracefully
};