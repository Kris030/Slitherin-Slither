import mongoose from 'mongoose';

export interface GuildUserType {
	_id: string,
	economy: {
		balance: Number
	}
}

export const GuildUserSchema = new mongoose.Schema<GuildUserType>({
	_id: String,
	economy: {
		balance: Number
	},
});

export default mongoose.model<GuildUserType>('GuildUser', GuildUserSchema);