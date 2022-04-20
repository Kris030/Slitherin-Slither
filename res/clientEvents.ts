import { Channel, Guild, Message, ActivityOptions, GuildMember, User } from 'discord.js';
import statuses from '../res/statuses.json' assert { type: 'json' };
import config from '../config.json' assert { type: 'json' };
import { getRandomElement } from '../src/utils/general.js';
import { canSendMessage } from '../src/utils/discord.js';
import GuildModel from './models/Guild.js';
import { client } from '../src/index.js';
import actions from '../res/actions.js';
import mongoose from 'mongoose';

export async function handleJoinedGuildDB(g: Guild) {
	// TODO
}

export function guildJoined(g: Guild) {
	// TODO
}

export function guildLeft(guildID: Guild | string) {
	// TODO
}

export function guildMemberRemove(member: GuildMember) {
	// TODO
}

export function guildBanAdd(guild: Guild, user: User) {
	// TODO
}

export function channelCreated(c: Channel) {
	if (!c.isText() || c.type != 'text')
		return;

	if (canSendMessage(c))
		c.send('first lol');
}

export async function messageRecieved(msg: Message) {
	if (msg.author == client.user)
		return;
	
	for (const ma of actions()) {
		try {
			await ma.run(msg);
		} catch (e) {
			console.error(e);
		}
	}
}

let statusInterval: NodeJS.Timeout = null;
export async function clientReady() {
	console.log('Ready 👽');

	const setStatus = () => {
		const { name, options } = getRandomElement(statuses);
		client.user.setActivity(name, options as ActivityOptions);
	};

	setStatus();
	statusInterval = setTimeout(setStatus, config.statusInterval);
}

let shuttingDown = false;
export async function shutdownGracefully() {
	if (shuttingDown)
		return;

	shuttingDown = true;

	console.log('Shutting down daddy 🦎');

	clearInterval(statusInterval);
	client.destroy();
	await mongoose.connection.close();

	console.log('Shutdown succesful');

	process.exit(0);
}