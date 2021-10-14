import { constructMongoURL } from './utils/database.js';
import * as clientEvents from '../res/clientEvents.js';
import { Client } from 'discord.js';
import config from '../config.json';
import mongoose from 'mongoose';

export const client = new Client();

client.on('guildCreate', clientEvents.guildJoined);
client.on('guildDelete', clientEvents.guildLeft);
client.on('guildMemberRemove', clientEvents.guildMemberRemove);
client.on('guildBanAdd', clientEvents.guildBanAdd);
client.on('channelCreate', clientEvents.channelCreated);
client.on('message', clientEvents.messageRecieved);
client.on('ready', clientEvents.clientReady);

try {
	console.log('Starting up... Sanity check 🤡');
	
	await mongoose.connect(constructMongoURL(config.database), { useNewUrlParser: true, useUnifiedTopology: true, });
	console.log('Connected to database 🥵');

	await client.login(config.token);
	console.log('Logged in 🤤');

} catch (err) {
	console.log('Error while starting up:');
	console.error(err);
	console.log('Shutting down...');
	await clientEvents.shutdownGracefully();
}
export const db = mongoose.connection.db;

process.on('SIGINT', () => {
	// don't print ^C
	process.stdout.write('\r');
	clientEvents.shutdownGracefully();
});
