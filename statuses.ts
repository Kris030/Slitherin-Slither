import { ActivityOptions } from 'discord.js';
export default [
	{
		name: 'you on the toilet',
		options: {
			type: 'WATCHING'
		}
	}, {
		name: 'during the lesson',
		options: {
			type: 'PLAYING'
		}
	}, {
		name: 'with titties',
		options: {
			type: 'PLAYING'
		}
	}, {
		name: 'to the cries',
		options: {
			type: 'LISTENING'
		}
	}, {
		name: 'the market',
		options: {
			type: 'COMPETING'
		}
	}, {
		name: 'custom status lol',
		options: {
			type: 'CUSTOM_STATUS'
		}
	},
] as {
	name: string,
	options?: ActivityOptions
}[];