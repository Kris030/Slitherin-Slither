import { Await, MaybePromise } from './general.js';
import MessageAction from '../MessageActions/MessageAction.js';
import { ParseSupportedType, parseType, ParsedType } from './parsing.js';

export type Condition<T> = (this: MessageAction<T>, data: T) => MaybePromise<boolean>;
export type SimpleAction<T> = (this: MessageAction<T>, data: T) => MaybePromise;
export type Middleware<T, R> = (this: MessageAction<T>, data: T) => MaybePromise<R>;
export type ActionErrorHandler<T> = (this: MessageAction<T>, data: T, error: any) => MaybePromise;

export type CommandParserOptions = {
    parseFully?: boolean;
    ignoreEmpty?: boolean;
};

export const commandParser = ({ parseFully = true, ignoreEmpty = true }: CommandParserOptions = {}) =>
(str => {
	let args: string[] = [], tokenSeparator = /[\s\n]/;
	
	if (!parseFully) {
		const ind = str.search(tokenSeparator);
		if (ind == -1)
			args.push(str);
		else
			args = [str.substr(0, ind), str.substr(ind + 1, str.length - ind)];
			
		return args;
	}

	const quotes = [`'`, `"`, '`'];
	
	let buff = '', inQuotes = false, escaped = false, quote: string;
	for (let i = 0; i < str.length; i++) {
		let c = str[i];

		if (!escaped && c == '\\') {
			escaped = !escaped;
			continue;
		}

		if (quotes.includes(c)) {
			if (inQuotes) {
				if (c == quote && !escaped) {
					inQuotes = false;
					quote = undefined;
					continue;
				}
			} else if (!escaped) {
				inQuotes = true;
				quote = c;
				continue;
			}
		}

		if (!inQuotes && tokenSeparator.test(c)) {
			args.push(buff);
			buff = '';
			continue;
		}

		if (escaped) {
			switch (c) {
				case 'n':
					c = '\n';
					break;
				case 't':
					c = '\t';
					break;
				default:
					break;
			}
			escaped = false;
		}

		buff += c;
	}

	args.push(buff);

	return ignoreEmpty ? args : args.filter((t: string) => t != '');
}) as Middleware<string, string[]>,

prefixChecker: (prefix: string) => Condition<string[]> = prefix => data => data.splice(0, 1)[0] === prefix,

typeParser = <T extends ParseSupportedType[]>(...types: T): Middleware<string[], TypeParserOut<T>> =>
async unparsed => {
	const args = new Array(unparsed.length);
	for (let i = 0; i < types.length; i++)
		args[i] = parseType(unparsed[i], types[i]);
	return Promise.all(args) as any;
},

PrefixCommand = (prefix: string, { defaultErrorHandler = undefined, parseFully = true, ignoreEmpty = true }: PrefixCommandOptions = {}) =>
	new MessageAction(defaultErrorHandler)
		.middleware(msg => msg.content)
		.middleware(commandParser({ parseFully, ignoreEmpty }))
		.condition(prefixChecker(prefix)),

TypedPrefixCommand = <T extends ParseSupportedType[]>(prefix: string, { defaultErrorHandler = undefined, parseFully = true, ignoreEmpty = true }: PrefixCommandOptions = {}, ...types: T) =>
	PrefixCommand(prefix, { defaultErrorHandler, parseFully, ignoreEmpty })
	.middleware(typeParser(...types)),

SubbedCommand = (prefix: string, commands: SubbedCommandType, { defaultErrorHandler = undefined as ActionErrorHandler<string>, ignoreEmpty = true } = {}) =>
	PrefixCommand(prefix, { ignoreEmpty, defaultErrorHandler })
		.action(async function(args) {

			for (; commands ;) {
				const s = args[0];
				
				if (!commands.hasOwnProperty(s))
					return;
				
				args.splice(0, 1);
				
				const v = commands[s];

				switch (typeof v) {

					case 'function':
						this.temp = v;
						await this.temp(args);
						return
					
					case 'object':
						commands = v;
						break;
						
				}

			}
			
		}),
TypedSubbedCommand = (prefix: string, commands: TypedSubbedCommandType, { defaultErrorHandler = undefined as ActionErrorHandler<string>, ignoreEmpty = true } = {}) =>
	PrefixCommand(prefix, { ignoreEmpty, defaultErrorHandler })
		.action(async function(args) {

			for (; commands ;) {
				const s = args[0];
				
				if (!commands.hasOwnProperty(s))
					return;
				
				args.splice(0, 1);
				
				const v = commands[s];

				if (v.handler && v.types) {
					this.temp = v.handler;
					
					for (let i = 0; i < args.length; i++)
						args[i] = parseType(args[i], v.types[i]);

					return void await this.temp(args);
				} else
					//@ts-ignore
					commands = v;

			}
			
		});

type TypeParserOut<T extends ParseSupportedType> = {
	[K in keyof T]: Await<ParsedType<T[K]>>;
};

export type PrefixCommandOptions = CommandParserOptions & {
	defaultErrorHandler?: ActionErrorHandler<string>;
};

export type SubbedCommandType = {
	[sub: string]: SubbedCommandType | Middleware<string[], any>;
};

export type TypedSubbedSubCommandType<T extends ParseSupportedType[]> = {
	types: T;
	handler: Middleware<TypeParserOut<T>, any>;
};

export type TypedSubbedCommandType = {
	[sub: string]: TypedSubbedCommandType | TypedSubbedSubCommandType<any>;
};

export const CreateTypedSubCommand =
	<T extends ParseSupportedType[]>(handler: Middleware<TypeParserOut<T>, any>, ...types: T) => ({
	types, handler
});