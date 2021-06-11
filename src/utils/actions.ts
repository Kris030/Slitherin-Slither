import { ParseSupportedType, parseType, ParsedType, ParseableTypes, PrimitiveParseSupportedType, PrimitiveConstructor } from './parsing.js';
import { Await, MaybePromise } from './general.js';
import MessageAction from '../MessageAction.js';

export type Condition<T> = (this: MessageAction<T>, data: T) => MaybePromise<boolean>;
export type SimpleAction<T> = (this: MessageAction<T>, data: T) => MaybePromise;
export type Middleware<T, R> = (this: MessageAction<T>, data: T) => MaybePromise<R>;
export type ActionErrorHandler<T> = (this: MessageAction<T>, data: T, error: any) => MaybePromise;

export type CommandParserOptions = {
	// the amount of arguments to parse
	parseCount?: number;
	ignoreEmpty?: boolean;
};

export const commandParser = ({ parseCount = -1, ignoreEmpty = true }: CommandParserOptions = {}) =>
(str: string) => {
	if (parseCount == 0)
		return [str];

	let args: string[] = [], tokenSeparator = /[\s\n]/;
	
	const quotes = [`'`, `"`, '`'];
	
	let buff = '', inQuotes = false, escaped = false, quote: string, empty = true;
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

		const whitespace = tokenSeparator.test(c);
		if (!whitespace)
			empty = false;

		if (!inQuotes && whitespace && (!ignoreEmpty || !empty)) {

			empty = true;
			args.push(buff);
			buff = '';

			if (parseCount > 0)
				parseCount--;

			if (parseCount == 0) {
				buff = str.substr(i + 1);
				break;
			}

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

	return args;
},

prefixChecker: (prefix: string) => Condition<string[]> = prefix => data => data.splice(0, 1)[0] === prefix,

typeParser = <T extends ParseSupportedType[]>(...types: T): Middleware<string[], TypeParserOut<T>> =>
	unparsed => Promise.all(unparsed.map((v, i) => parseType(v, types[i]))) as any,

PrefixCommand = (prefix: string, { defaultErrorHandler = undefined, parseCount = -1e10, ignoreEmpty = true }: PrefixCommandOptions = {}) =>
	new MessageAction(defaultErrorHandler)
		.middleware(msg => msg.content)
		.middleware(commandParser({ parseCount: parseCount + 1, ignoreEmpty }))
		.condition(prefixChecker(prefix)),

TypedPrefixCommand = <T extends ParseSupportedType[]>(prefix: string, { defaultErrorHandler = undefined, parseCount = -1e10, ignoreEmpty = true }: PrefixCommandOptions = {}, ...types: T) =>
	PrefixCommand(prefix, { defaultErrorHandler, parseCount, ignoreEmpty })
	.middleware(typeParser(...types)),

SubbedAction = (commands: SubbedCommandType): SimpleAction<string[]> =>
	async function(args) {
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
	},
TypedSubbedCommand = (commands: TypedSubbedCommandType): SimpleAction<string[]> =>
	async function(args) {

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

				await this.temp(args);
			} else
				//@ts-ignore
				commands = v;

		}
			
}, inGuild: Condition<any> = function() {
	return this.msg.guild != undefined;
};

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
