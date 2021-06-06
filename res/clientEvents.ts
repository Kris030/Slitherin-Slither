import { Channel, Guild, Message, ActivityOptions } from 'discord.js';
import GuildModel, { GuildModelType } from './models/Guild.js';
import { getRandomElement } from '../src/utils/general.js';
import statuses from '../res/statuses.json';
import { client } from '../src/index.js';
import actions from '../res/actions.js';
import config from '../config.json';
import mongoose from 'mongoose';

export async function guildJoined(g: Guild) {
	if (!g.systemChannel?.permissionsFor(client.user)?.has('SEND_MESSAGES'))
		return;
	g.systemChannel.send(`I'm here virgins`);
	
	const gDoc = await new GuildModel({
		_id: g.id
	}).save();
}

export async function guildLeft(guildID: Guild | string, dbEntry?: GuildModelType) {
	if (typeof guildID === 'object')
		guildID = guildID.id;

	if (dbEntry)
		dbEntry.delete();
	else {
		GuildModel.findOneAndDelete({ _id: guildID });
	}
}

export function channelCreated(c: Channel) {
	if (!c.isText() || c.type != 'text')
		return;
	if (!c.permissionsFor(client.user)?.has('SEND_MESSAGES'))
		return;
	c.send('first lol');
}

export async function messageRecieved(msg: Message) {
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
}

let statusInterval: NodeJS.Timeout = null;
export async function clientReady() {
	console.log('Running daddy 🥵');

	const actualGuilds = client.guilds.cache.clone(),
		  dbGuildEntries = await GuildModel.find({}).exec();
	
	for (const guildEntry of dbGuildEntries) {
		// both in actual AND db
		if (actualGuilds.has(guildEntry._id))
			actualGuilds.delete(guildEntry._id);
		else // only in db
			await guildLeft(guildEntry._id, guildEntry);
	}

	actualGuilds.forEach(guildJoined);

	const setStatus = () => {
		const { name, options } = getRandomElement(statuses);
		client.user.setActivity(name, options as ActivityOptions);
	};

	setStatus();
	statusInterval = setTimeout(setStatus, config.statusInterval);
}

export async function shutdownGracefully() {
	console.log('Shutting down daddy 🦎');

	clearInterval(statusInterval);
	client.destroy();
	await mongoose.connection.close();

	console.log('Shutdown succesful');

	process.exit(0);
}