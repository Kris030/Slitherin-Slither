import { Guild } from 'discord.js';
import mongoose from 'mongoose';

export interface TrackedServerType {
	_id: string,
	economy: {
		balance: number,
		lastPayday: number,
	},
}

export interface GuildUserType {
	_id: string,
	trackedServers: TrackedServerType[],
	getServer(server: Guild | string, saveOnCreate?: boolean): Promise<TrackedServerType>,
}

export const TrackedServerSchema = new mongoose.Schema<TrackedServerType>({
	_id: String,
	economy: {
		type: {
			balance: Number,
			lastPayday: Number,
		},
		default: {
			balance: 0,
			lastPayday: 0,
		},
	}
});

export const GuildUserSchema = new mongoose.Schema<GuildUserType>({
	_id: String,
	trackedServers: {
		type: [TrackedServerSchema],
		default: [],
	},
});
GuildUserSchema.methods.getServer = async function(this: GuildUserType & mongoose.Document, server: Guild | string, saveOnCreate: boolean) {
	const sID = typeof server === 'string' ? server : server.id;
	
	let f = this.trackedServers.find(s => s._id === sID);

	if (!f) {

		// @ts-expect-error economy doesn't actually need to set
		this.trackedServers.push({ _id: sID });
		f = this.trackedServers[0];
		if (saveOnCreate)
			await this.save();
	}
	return f;
}

export default mongoose.model<GuildUserType>('GuildUser', GuildUserSchema);