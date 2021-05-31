import mongoose from 'mongoose';

export interface GuildUserType {
	_id: string,
	economy: {
		balance: number,
		lastPayday: number,
	}
}

export const GuildUserSchema = new mongoose.Schema<GuildUserType>({
	_id: String,
	economy: {
		balance: Number,
		lastPayday: Number,
	},
});

export default mongoose.model<GuildUserType>('GuildUser', GuildUserSchema);