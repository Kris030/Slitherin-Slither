import { MaybePromise } from './general';
import { Channel, Message, TextChannel, User } from 'discord.js';

export type DialogTree<P, A> = {
	readonly prompt: P;
	readonly responses?: {
		readonly answer: A;
		readonly branch: DialogTree<P, A>;
	}[];
};

export type TextDialogTree = DialogTree<string, string>;
export type PredicateDialogTree = DialogTree<(channel: Channel) => any, (msg: Message) => MaybePromise<boolean>>;

export const textDialog = (channel: Channel, users: User | User[], dialog: TextDialogTree, { timeout=60_000 } = {}): {
    path: Promise<number[]>;
    abort: () => void;
} => {
	if (!channel.isText())
		throw 'Not a text channel';

	if (!Array.isArray(users))
		users = [users];

	const ret: {
		path: Promise<number[]>;
		abort: () => void;
	} = {
		path: new Promise(async (resolve, _) => {
			const path: number[] = [];

			for (;;) {
				await channel.send(dialog.prompt);
				let index: number;
				
				const collector = channel.createMessageCollector(
					(msg: Message) => {
						if (!(users as User[]).includes(msg.author))
							return false;
						return (index = dialog.responses.findIndex(r => r.answer == msg.content)) != -1;
					}, {
						max: 1,
						time: timeout
					}
				);

				ret.abort = collector.stop;

				await new Promise<void>((resolve, _) => collector.on('end', _ => resolve()));

				path.push(index);

				dialog = dialog.responses[index].branch;
				if (index == -1 || dialog.responses == undefined) {
					await channel.send(dialog.prompt);
					return resolve(path);
				}
				
			}
		}), abort: undefined
	};

	return ret;
};

export const indexedDialog = (channel: Channel, users: User | User[], dialog: TextDialogTree, { timeout=60_000 } = {}): {
    path: Promise<number[]>;
    abort: () => void;
} => {
	if (!channel.isText())
		throw 'Not a text channel';

	if (!Array.isArray(users))
		users = [users];

	const ret: {
		path: Promise<number[]>;
		abort: () => void;
	} = {
		path: new Promise(async (resolve, _) => {
			const path: number[] = [];

			for (;;) {
				let p = dialog.prompt + '\n';

				let index = 0;
				for (const a of dialog.responses)
					p += ++index + '. ' + a.answer + '\n';

				await channel.send(p);
				
				index = 0;
				const collector = channel.createMessageCollector(
					(msg: Message) => {
						if (!(users as User[]).includes(msg.author))
							return false;
						
						index = parseInt(msg.content);
						if (!Number.isSafeInteger(index))
							return false;

						index--;

						return index >= 0 && index < dialog.responses.length;
					}, {
						max: 1,
						time: timeout
					}
				);

				ret.abort = collector.stop;

				await new Promise<void>((resolve, _) => collector.on('end', _ => resolve()));

				path.push(index);

				dialog = dialog.responses[index].branch;
				if (index == -1 || dialog.responses == undefined) {
					await channel.send(dialog.prompt);
					return resolve(path);
				}
				
			}
		}), abort: undefined
	};

	return ret;
};

export const predicateDialog = (channel: Channel, users: User | User[], dialog: PredicateDialogTree, { timeout=60_000 } = {}): {
    path: Promise<number[]>;
    abort: () => void;
} => {
	if (!channel.isText())
		throw 'Not a text channel';

	if (!Array.isArray(users))
		users = [users];

	const ret: {
		path: Promise<number[]>;
		abort: () => void;
	} = {
		path: new Promise(async (resolve, _) => {
			const path: number[] = [];

			for (;;) {
				await dialog.prompt(channel);
				
				let index: number;
				const collector = channel.createMessageCollector(
					(msg: Message) => {
						if (!(users as User[]).includes(msg.author))
							return false;

						for (const p of dialog.responses)
							if (p.answer(msg))
								return true;

						return false;
					}, {
						max: 1,
						time: timeout
					}
				);

				ret.abort = collector.stop;

				await new Promise<void>((resolve, _) => collector.on('end', _ => resolve()));

				path.push(index);

				dialog = dialog.responses[index].branch;
				if (index == -1 || dialog.responses == undefined) {
					dialog.prompt(channel);
					return resolve(path);
				}
				
			}
		}), abort: undefined
	};

	return ret;
};
