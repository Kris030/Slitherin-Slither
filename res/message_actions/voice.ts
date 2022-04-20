import { Condition, inGuild, PrefixCommand, TypedPrefixCommand } from '../../src/utils/actions.js';
import { EmbedField, MessageEmbed, StreamDispatcher, User, VoiceChannel, VoiceConnection } from 'discord.js';
import config from '../../config.json' assert { type: 'json' };
import { dateToString } from '../../src/utils/general.js';
import youtubeSearch from 'youtube-search';
import type { Readable } from 'stream';
import ytdld from 'ytdl-core-discord';
import type ytdl from 'ytdl-core';

type SongDetails = {
	thumbnail: ytdl.thumbnail;
	length: number;
	title: string;
};
export class SongRequest {
	
	private _details: SongDetails;
	public async details(): Promise<SongDetails> {
		if (this._details)
			return this._details;
		
		const {
			videoDetails: {
				thumbnails: [ thumbnail ],
				lengthSeconds,
				title,
			}
		} = await ytdld.getInfo(this.url);

		return this._details = {
			length: parseInt(lengthSeconds),
			title,
			thumbnail: thumbnail ?? {
				url: 'https://media.istockphoto.com/vectors/no-thumbnail-image-vector-graphic-vector-id1147544806?k=20&m=1147544806&s=170667a&w=0&h=5rN3TBN7bwbhW_0WyTZ1wU_oW5Xhan2CNd-jlVVnwD0=',
				width: Number.MAX_SAFE_INTEGER,
				height: Number.MAX_SAFE_INTEGER,
			}
		};
	}

	constructor(
		public by: User,
		public url: string,
	) {}
};

export class VoiceData {

	public queue: SongRequest[] = [];
	public disconnecter?: NodeJS.Timeout;

	public loop = false;
	public loopqueue = false;

	public playingSince: number;
	public playing = false;
	public pausedWhen?: number;

	private conn: VoiceConnection;
	private disp: StreamDispatcher;
	private stream: Readable;

	constructor(public vc: VoiceChannel) {
		if (!this.conn)
			vc.join().then(c => {
				c.on('closing', () => queues.delete(vc.id));
				this.conn = c;
			});
	}

	public leave() {
		queues.delete(this.vc.id);
		this.vc.leave();
	}

	async play(url: string) {
		clearInterval(this.disconnecter);
		this.disconnecter = null;
	
		this.stream = await ytdld(url, { filter: 'audioonly' });

		this.stream.once('readable', () => {
			if (!this.playing) {
				this.playingSince = Date.now();
				this.playing = true;
			}
			this.disp = this.conn.play(this.stream, { type: 'opus' }).on('finish', () => this.onEnd());
		});
		this.stream.on('error', () => {
			if (this.stream.readable)
				this.resume();
			else
				this.onEnd();
		});
	}

	async onEnd(doLoops=true) {
		this.stop();

		if (!doLoops || !this.loop) {
			const p = this.queue.pop();
			if (doLoops && this.loopqueue)
				this.queue.unshift(p);
		}

		if (this.queue.length) {
			this.play(this.queue[this.queue.length - 1].url);
			return;
		}
	
		this.disconnecter = setTimeout(() => {
			if (!this.queue.length)
				this.leave();
		}, 30_000);
	}

	public pause() {
		this.playing = false;
		this.pausedWhen = Date.now();
		this.disp.pause(false);
	}
	public resume() {
		this.playing = true;
		this.pausedWhen = null;
		this.disp.resume();
	}
	public stop() {
		this.playing = false;
		this.disp.destroy();
	}

	public get progress() {
		return dateToString(
			this.playing ?
				Date.now() - this.playingSince :
				this.pausedWhen
		);
	}
}

const queues = new Map<string, VoiceData>();

/*function onEnd(vc: VoiceChannel, vd: VoiceData, doLoops=true) {
	vd.stop();
	vd.pause = vd.resume = vd.stop = null;

	if (!doLoops || !vd.loop) {
		const p = vd.queue.pop();
		if (doLoops && vd.loopqueue)
			vd.queue.unshift(p);
	}

	if (vd.queue.length) {
		play(vc, vd.queue[vd.queue.length - 1].url, vd);
		return;
	}

	vd.disconnecter = setTimeout(() => {
		if (!vd.queue.length)
			vd.leave();
	}, 30_000);
}

async function play(vc: VoiceChannel, url: string, vd: VoiceData) {
	clearInterval(vd.disconnecter);
	vd.disconnecter = null;

	const connection = await vc.join();
	let ytStream = await ytdld(url, { filter: 'audioonly' });

	const armStream = () => {
		ytStream.once('readable', () => {
			if (!vd.playing) {
				vd.playingSince = Date.now();
				vd.playing = true;
			}
			connection.play(ytStream, { type: 'opus' }).on('finish', () => onEnd(vc, vd));
		});
		ytStream.on('error', () => {
			if (ytStream.readable)
				vd.resume();
			else
				onEnd(vc, vd);
		});
	};

	let begin: number;
	vd.pause = () => {
		begin = (vd.pausedWhen = Date.now()) - vd.playingSince;
		vd.stop();
		vd.playing = false;
		vd.pausedWhen = null;
	};
	vd.resume = async () => {
		if (vd.playing)
			return;
		ytStream = await ytdld(url, { filter: 'audioonly', begin });
		vd.playing = true;
		armStream();
	};
	vd.stop = () => ytStream.destroy();
	armStream();
}*/

const inVoice: Condition<any> = function() {
	if (queues.has(this.msg.member.voice.channelID))
		return true;
	this.reply(`fuck you aren't in the same channel`);
	return false;
};

export default () => [

	PrefixCommand('ssplay', { parseCount: 0 })
		.condition(inGuild('need to be in a guild fucker'))
		.condition(function() {
			const vc = this.msg.member.voice.channel;
			if (!vc.joinable)
				this.reply(`sry can't join`);
			return vc.joinable;
		})
		.middleware(async function([ query ]) {

			if (ytdld.validateURL(query))
				return [ query ];

			const { results: [ res ] } = await youtubeSearch(query, {
				maxResults: 1,
				safeSearch: 'none',
				key: config.youtubeAPIKey,
			});

			return [ res.link ];
		})
		.action(async function playSong([ url ]) {
			const vc = this.msg.member.voice.channel;

			let vd = queues.get(vc.id);
			if (!vd)
				queues.set(vc.id, vd = new VoiceData(vc));

			if (!vd.queue.length)
				vd.play(url);

			vd.queue.unshift(new SongRequest(this.author, url));
			
			this.reply('added le song to queue');
		}),

	PrefixCommand('sspause', { parseCount: 0 })
		.condition(inVoice)
		.action(function() {
			queues.get(this.msg.member.voice.channelID).pause();
			this.msg.react('⏸️');
		}),

	PrefixCommand('ssresume', { parseCount: 0 })
		.condition(inVoice)
		.action(function() {
			queues.get(this.msg.member.voice.channelID).resume();
			this.msg.react('▶️');
		}),

	PrefixCommand('ssdisconnect', { parseCount: 0 })
		.condition(inVoice)
		.action(function() {
			queues.get(this.msg.member.voice.channelID).leave();
			this.reply('have a magnificient day fuckers');
		}),

	PrefixCommand('ssqueue', { parseCount: 0 })
		.condition(inVoice)
		.action(async function() {
			const q = queues.get(this.msg.member.voice.channelID), ql = q.queue.length;
			if (ql === 0) {
				this.reply('empty queue... stoopid');
				return;
			}

			const fields = new Array<EmbedField>(ql);
			
			for (let i = ql - 1; i >= 0; i--) {
				const s = q.queue[i], { by: { id }, url } = s, { title, length } = await s.details();
				fields.push({
					name: `Shitty song ${ql - i}.`,
					value: `[${title}](${url}) | ${dateToString(length * 1000)} | by: <@${id}>`,
					inline: false,
				});
			}

			const curr = q.queue[ql - 1], cd = await curr.details();
			this.reply(new MessageEmbed({
				title: `List of shit songs`,
				hexColor: 'ee7d22',
				fields,
				image: {
					url: cd.thumbnail.url,
					width: Math.min(1920 / 15, cd.thumbnail.width),
					height: Math.min(1080 / 15, cd.thumbnail.height),
				},
				footer: {
					text: `${q.loop ? '🔂 |' : q.loopqueue ? '🔁 |' : ''} ${q.progress} of ${dateToString(cd.length * 1000)}`,
				},
			}));
		}),

	PrefixCommand('ssloop', { parseCount: 0 })
		.condition(inVoice)
		.action(async function() {
			const q = queues.get(this.msg.member.voice.channelID);

			if (q.loop = !q.loop)
				this.msg.react('🔂');
			else {
				await this.msg.react('❌');
				this.msg.react('🔂');
			}

		}),

	PrefixCommand('ssloopqueue', { parseCount: 0 })
		.condition(inVoice)
		.action(async function() {
			const q = queues.get(this.msg.member.voice.channelID);

			if (q.loopqueue = !q.loopqueue)
				this.msg.react('🔁');
			else {
				await this.msg.react('❌');
				this.msg.react('🔁');
			}
		}),

	PrefixCommand('sskip', { parseCount: 0 })
		.condition(inVoice)
		.action(function() {
			const q = queues.get(this.msg.member.voice.channelID);
			q.onEnd();
			this.msg.react('⏭️');
		}),

	PrefixCommand('sstop', { parseCount: 0 })
		.condition(inVoice)
		.action(function() {
			const q = queues.get(this.msg.member.voice.channelID);
			q.queue = [];
			q.onEnd(false);
			this.msg.react('⏹️');
		}),

	TypedPrefixCommand('ssremove', {}, Number)
		.condition(inVoice)
		.action(function([index]) {
			const q = queues.get(this.msg.member.voice.channelID);

			if (index < 0 || index >= q.queue.length) {
				this.reply('out of bounds you retard');
				return;
			}

			q.queue.splice(index);
			
			if (index === 0)
				q.onEnd(false);

		}),

	PrefixCommand('ssearchy', { parseCount: 0 })
		.condition(inGuild())
		.action(async function([ query ]) {
			const { results: [ res ] } = await youtubeSearch(query, {
				maxResults: 1,
				safeSearch: 'none',
				key: config.youtubeAPIKey,
			});
			this.reply(res.link);
		})
		.onError(function() {
			this.reply('some fucking error smh');
		}),

];
