import { guildLeft, guildJoined, channelCreated, messageRecieved, clientReady, shutdownGracefully } from '../res/clientEvents.js';
import { constructMongoURL } from './utils/database.js';
import { Client } from 'discord.js';
import config from '../config.json';
import mongoose from 'mongoose';

export const client = new Client();

try {
	console.log('Starting up... Sanity check 🤡');
	
	await Promise.all([
		mongoose.connect(constructMongoURL(config.database), {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		}),
		client.login(config.token)
	]);
	console.log('Running daddy 🥵');

} catch (err) {
	console.log('Error while starting up:');
	console.error(err);
	console.log('Shutting down...');
	await shutdownGracefully();
}
export const db = mongoose.connection.db;

client.on('guildCreate', guildJoined);
client.on('guildDelete', guildLeft);
client.on('channelCreate', channelCreated);
client.on('message', messageRecieved);
client.on('ready', clientReady);

process.on('SIGINT', () => {
	// don't print ^C
	process.stdout.write('\r');
	shutdownGracefully();
});
