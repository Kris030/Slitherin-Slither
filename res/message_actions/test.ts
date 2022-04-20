import { inGuild, PrefixCommand, TypedPrefixCommand } from '../../src/utils/actions.js';
import RingBufferByte from '../../src/utils/RingBufferByte.js';
import { MessageEmbed, VoiceState } from 'discord.js';
import { client } from '../../src/index.js';
import { writeFile } from 'fs/promises';

export default () => [
	TypedPrefixCommand('ssembed', { defaultError: console.error }, String, String, String, String,
									[{
										name: String,
										value: String,
										inline: Boolean
									}])
		.action(async function([title, description, footer, color, fields]) {
			const mbed = new MessageEmbed({
				title,
				description,
				footer: {
					text: footer,
				},
				color,
				fields
			});
			await this.reply(mbed);
		}),

	PrefixCommand('ssecho')
		.condition(inGuild())
		.action(async function() {
			const conn = await this.msg.member.voice.channel.join();
			const rec = conn.receiver.createStream(this.author, {
				mode: 'opus',
				end: 'manual',
			});
			rec.on('error', err => console.error('rec error', err));
			rec.on('close', () => console.log('rec closed...'));

			const disp = conn.play(rec, { type: 'opus' });
			disp.on('error', err => console.error('disp error', err));
			disp.on('close', () => console.log('disp closed...'));
		}),
	
	PrefixCommand('ssechoall')
		.condition(inGuild())
		.action(async function() {
			const conn = await this.msg.member.voice.channel.join(), cid = conn.channel.id;
			
			const onJoin = (id: string) => {
				const rs = conn.receiver.createStream(id, {
					mode: 'opus',
					end: 'manual',
				});
				conn.play(rs, { type: 'opus' });
			};

			for (const [id] of conn.channel.members) {
				if (id === client.user.id)
					continue;
				onJoin(id);
			}
			//console.log('in channel: ', Array.from(conn.channel.members.values()).map(mem => mem.displayName));

			const lis = (oldS: VoiceState, newS: VoiceState) => {
				// joined
				if (newS.channelID === cid) {
					console.log('joined');

					onJoin(newS.id);

				} else if (oldS.channelID === cid) {
					if (newS.id === client.user.id) {
						client.off('voiceStateUpdate', lis);
						console.log('removed listener');
						return;
					}
					console.log('left');
				}
			};
			client.on('voiceStateUpdate', lis);

		}),
	
	PrefixCommand('sshadow')
		.condition(inGuild())
		.action(async function() {
			const conn = await this.msg.member.voice.channel.join(), cid = conn.channel.id;

			const secs = 3;
			const rb = new RingBufferByte(44_100 * 4 * secs);
			
			setTimeout(() => {
				console.log('leave this shite');
				conn.channel.leave();
				writeFile('./test/asd.pcm', rb.toReadStream());
			}, 5_000);
			const onJoin = (id: string) => {
				const rs = conn.receiver.createStream(id, {
					mode: 'pcm',
					end: 'manual',
				});
				rs.pipe(rb);
			};

			for (const [id] of conn.channel.members) {
				if (id === client.user.id)
					continue;
				onJoin(id);
			}
			//console.log('in channel: ', Array.from(conn.channel.members.values()).map(mem => mem.displayName));

			const lis = (oldS: VoiceState, newS: VoiceState) => {
				// joined
				if (newS.channelID === cid) {
					console.log('joined');

					onJoin(newS.id);

				} else if (oldS.channelID === cid) {
					if (newS.id === client.user.id) {
						client.off('voiceStateUpdate', lis);
						console.log('removed listener');
						return;
					}
					console.log('left');
				}
			};
			client.on('voiceStateUpdate', lis);

		}),
];
