import mongoose from 'mongoose';

export interface GuildType {
	_id: String;
	someGuildProp: string;
}

export const GuildSchema = new mongoose.Schema<GuildType>({
	_id: String,
	someGuildProp: String
});

export default mongoose.model<GuildType>('Guild', GuildSchema);
