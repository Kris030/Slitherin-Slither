import { Condition, PrefixCommand, TypedPrefixCommand } from '../../src/utils/actions.js';
import { EmbedField, MessageEmbed, User, VoiceChannel } from 'discord.js';
import ytdl from 'ytdl-core';

export type SongRequest = {
	url: string;
	by: User['id'];
	length: number;
	title: string;
	thumbnail: ytdl.thumbnail;
};

export type VoiceData = {
	leave: () => void;
	pause?: () => void;
	resume?: () => void;
	stop?: () => void;

	queue: SongRequest[];
	disconnecter?: NodeJS.Timeout;

	loop: boolean;
	loopqueue: boolean;

	playingSince: number;
};

const queues = new Map<string, VoiceData>();

function onEnd(vc: VoiceChannel, vd: VoiceData) {
	vd.stop();
	vd.pause = vd.resume = vd.stop = null;

	if (!vd.loop) {
		const p = vd.queue.pop();
		if (vd.loopqueue)
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

	const connection = await vc.join(), ytStream = ytdl(url, { filter: 'audioonly' });

	vd.pause = () => connection.dispatcher.pause(true);
	vd.resume = () => connection.dispatcher.resume();
	vd.stop = () => ytStream.destroy();
	
	ytStream.once('readable', () => {
		const dp = connection.play(ytStream);
		vd.playingSince = Date.now();
		dp.on('finish', () => onEnd(vc, vd));
	});
}

const inVoice: Condition<any> = function() {
	if (queues.has(this.msg.member.voice.channelID))
		return true;
	this.reply(`fuck you aren't in the same channel`);
	return false;
};

export default () => [

	TypedPrefixCommand('ssplay', {}, URL)
		.action(async function([{ href: url }]) {
			const vc = this.msg.member.voice.channel;
			
			if (!vc.joinable) {
				this.reply(`sry can't join`);
				return;
			}
			
			if (!ytdl.validateURL(url)) {
				this.reply('Not a youtube url fucker');
				return;
			}

			let vd = queues.get(vc.id);
			if (!vd) {
				queues.set(vc.id, vd = {
					loopqueue: false,
					loop: false,
					queue: [],
					leave: () => {
						queues.delete(vc.id);
						vc.leave();
					},
					playingSince: Date.now()
				});
			}
			
			if (!vd.queue.length)
				play(vc, url, vd);

			const req: SongRequest = {
				url,
				by: this.author.username,
				length: -1,
				title: null,
				thumbnail: null
			};
			vd.queue.unshift(req);

			const { videoDetails: info } = await ytdl.getInfo(url);

			req.length = parseInt(info.lengthSeconds);
			req.title = info.title;

			console.log(info.thumbnails);
			
			let maxi = -1, maxA = -1;
			for (let i = 0; i < info.thumbnails.length; i++) {
				const t = info.thumbnails[i], s = t.width * t.height;
				if (maxA < s) {
					maxA = s;
					maxi = i;
				}
			}
			if (maxi !== -1)
				req.thumbnail = info.thumbnails[maxi];

			this.reply(`added \`${req.title}\` to queue`);
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

	PrefixCommand('ssqueue', { parseCount: 0})
		.condition(inVoice)
		.action(function() {
			const q = queues.get(this.msg.member.voice.channelID);
			const qlen = q.queue.length, fields = new Array<EmbedField>(qlen);

			for (let ind = qlen - 1; ind >= 0; ind--) {
				const req = q.queue[ind];
				fields.push({
					name: `Shit song ${qlen - ind}.`,
					value: `[${req.title}](${req.url}) | ${req.length}s | by: ${req.by}`,
					inline: false
				});
			}
			
			const curr = q.queue[qlen - 1];

			this.reply(new MessageEmbed({
				title: `List of shit songs`,
				hexColor: 'ee7d22',
				fields,
				image: {
					url: curr.thumbnail.url,
				},
				footer: {
					text: `${Math.floor((Date.now() - q.playingSince) / 1000)}s of ${curr.length}`
				}
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
			onEnd(this.msg.member.voice.channel, q);
			this.msg.react('⏭️');
		}),
	
	PrefixCommand('sstop', { parseCount: 0 })
		.condition(inVoice)
		.action(function() {
			const q = queues.get(this.msg.member.voice.channelID);
			q.queue = [];
			onEnd(this.msg.member.voice.channel, q);
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

			if (index === 1) {
				this.reply('use skip you fagster');
				return;
			}

			q.queue.splice(index + 1);
		}),
];
