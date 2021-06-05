import mongoose from 'mongoose';

export interface GuildType {
	_id: String;
	config: {
		system: {
			paydayCooldown: number;
		},
		custom: mongoose.Types.Map<string>;
	}
}

export const GuildSchema = new mongoose.Schema<GuildType>({
	_id: String,
	config: {
		system: {
			type: {
				paydayCooldown: Number
			},
			default: {
				paydayCooldown: 6 * 60 * 60 // 6 hours
			}
		},
		custom: {
			type: Map,
			of: String,
			default: new Map()
		}
	}	
});

export default mongoose.model<GuildType>('Guild', GuildSchema);
