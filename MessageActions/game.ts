import { User, MessageReaction } from 'discord.js';
import { TypedPrefixCommand } from '../Utils/actions.js';
import { emojifyString } from '../Utils/emojis.js';
import { swap2d, MaybePromise } from '../Utils/general.js';

const games = new Set<string>();
export default [
	TypedPrefixCommand('ssgame', {}, Number, Number)
		.condition(async function([w, h]) {
			if (games.has(this.msg.author.id)) {
				await this.msg.channel.send('fuck off can\'t start another game');
				return false;
			}

			if (w <= 0 || w > 10) {
				await this.msg.channel.send('Width must be between 1 and 10');
				return false;
			}
			if (h < 0 || h > 10) {
				await this.msg.channel.send('Height must be between 1 and 10');
				return false;
			}
			return true;
		})
		.action(async function([w, h]) {
			const user = this.msg.author, channel = this.msg.channel, map: GameObject[][] = new Array(w);
			games.add(user.id);

			class Point {
				readonly x: number;
				readonly y: number;
				constructor(x = 0, y = 0) {
					this.x = x;
					this.y = y;
				}
				add(p: Point): Point {
					return new Point(this.x + p.x, this.y + p.y);
				}
				sub(p: Point): Point {
					return new Point(this.x + p.x, this.y + p.y);
				}
			}

			class GameObject {
				
				char: string;
				pos: Point;

				constructor(char: string, pos = new Point()) {
					this.char = char;
					this.pos = pos;
				}

				move(by: Point) {
					const newPos = this.pos.add(by), { x: xx, y: yy } = newPos;

					if (xx < 0 || xx >= w || yy < 0 || yy >= h)
						return;

					
					if (map[xx][yy] instanceof Empty) {
						swap2d(map, map, xx, yy, this.pos.x, this.pos.y);
						this.pos = newPos;
					}
				}
			}

			class Empty extends GameObject {
				constructor(pos = new Point()) {
					super('🟦', pos);
				}
			}

			for (let x = 0; x < w; x++) {
				map[x] = new Array<GameObject>(h);
				for (let y = 0; y < map[x].length; y++)
					map[x][y] = new Empty(new Point(x, y));
			}
			
			const player = new GameObject('👺', new Point());
			map[0][0] = player;

			let statusText = 'Playing...';
			const renderMap = () => {
				let s = '';
				for (let x = 0; x < h; x++) {
					for (let y = 0; y < w; y++)
						s += map[y][x].char + ' ';
					s = s.substr(0, s.length - 1) + '\n';
				}
				return s;
			}, renderHeader = () => `<@${user.id}> 's game`,
			renderFooter = () => emojifyString(statusText + '\nScore: 0'),

			headerMessage = await this.msg.channel.send(renderHeader()),
			mapMessage = await this.msg.channel.send(renderMap()),
			footerMessage = await this.msg.channel.send(renderFooter()),
			
			editMessages = () => Promise.all([
				headerMessage.edit(renderHeader()),
				mapMessage.edit(renderMap()),
				footerMessage.edit(renderFooter())
			]);

			const controlEmojis: { [K in string]: () => MaybePromise<boolean>; } = {
				'⬆️': () => { player.move(directions.up); return true; },
				'⬇️': () => { player.move(directions.down); return true; },
				'⬅️': () => { player.move(directions.left); return true; },
				'➡️': () => { player.move(directions.right); return true; },
				/*'🔫': () => {

					return true;
				},*/ '❌': () => {
					statusText = 'You gave up';
					collector.stop();
					return true;
				}
			}, directions = {
				up:		new Point(0, -1),
				down:	new Point(0, 1),
				left:	new Point(-1, 0),
				right:	new Point(1, 0)
			};

			for (const e in controlEmojis)
				mapMessage.react(e);

			const collector = mapMessage.createReactionCollector(
				(_, ruser: User) => ruser.id === user.id,
				{
					idle: 120_000
				}
			);
			
			collector.on('collect', async (r: MessageReaction) => {
				r.users.remove(user);
				const action = controlEmojis[r.emoji.name];
				if (action && action())
					editMessages();
			});
			
			collector.on('end', () => {
				editMessages();
				games.delete(user.id);
			});

		})
];