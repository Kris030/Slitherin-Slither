import { Channel, Guild, Message, ActivityOptions, GuildMember, User } from 'discord.js';
import { getRandomElement } from '../src/utils/general.js';
import { canSendMessage } from '../src/utils/discord.js';
import GuildModel, { IGuild } from './models/Guild.js';
import statuses from '../res/statuses.json';
import { client } from '../src/index.js';
import actions from '../res/actions.js';
import config from '../config.json';
import mongoose from 'mongoose';

export async function handleJoinedGuildDB(g: Guild) {
	GuildModel.create({
		_id: g.id,
	});
}

export function guildJoined(g: Guild) {
	
	handleJoinedGuildDB(g);

	if (canSendMessage(g.systemChannel))
		g.systemChannel.send(`I'm here virgins`);
	
}

export function handleLeftGuildDB(_id: string | IGuild) {
	if (typeof _id === 'string')
		GuildModel.findOneAndDelete({ _id });
	else
		_id.delete();
}

export function guildLeft(guildID: Guild | string, dbEntry?: IGuild) {
	handleLeftGuildDB(dbEntry ?? (typeof guildID === 'string' ? guildID : guildID.id));
}

export function guildMemberRemove(member: GuildMember) {
	if (member.id === client.user.id)
		guildLeft(member.guild);
}

export function guildBanAdd(guild: Guild, user: User) {
	if (user.id === client.user.id)
		guildLeft(guild);
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

	const actualGuilds = client.guilds.cache.clone(),
		  dbGuildEntries = await GuildModel.find({}).exec();
	
	for (const guildEntry of dbGuildEntries) {
		// both in actual AND db
		if (actualGuilds.has(guildEntry._id))
			actualGuilds.delete(guildEntry._id);
		else // only in db
			handleLeftGuildDB(guildEntry);
	}

	actualGuilds.forEach(handleJoinedGuildDB);

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