
/**
 * Returns a promise for waiting an amount of milliseconds.
 * @param ms The amount of time in milliseconds.
*/
export function sleep(ms: number): Promise<void> {
	return new Promise(res => setTimeout(res, ms));
}

/**
 * Returns a random element of the specified array.
 * @param array The array to return from.
 */
export function getRandomElement<T>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)];
}

/**
 * Indents all lines of a string.
 * 
 * @param str The string to indent.
 * @param level The indentation level.
 * @param indenter The string to indent with. A single tab by default.
 */
export function indent(str: string, level: number, indenter: string = '\t') {
	if (level < 0)
		throw 'Indent should be greater than 0.';
	const repl = indenter.repeat(level);
	return repl + str.replace(/\n/g, '\n' + repl);
}

/**
 * Converts an arry to a string in the following format: `<begin><value><separator><value><end>`.
 * 
 * @param array The array to convert.
 * @param separator The separator.
 * @param begin The beginning of the string.
 * @param end The end of the string.
 */
export function arrayToString(array: any[], { separator=', ', begin='[', end=']' }: { separator?: string; begin?: string; end?: string } = {}): string {
	const l = array.length - 1;
	let str = begin, i = 0;
	for (; i < l; i++)
		str += array[i] + separator;
	return str + array[i] + end;
}

/**
 * Extracts the resolved type from a `Promise`.
 */
export type Await<T> = T extends PromiseLike<infer U> ? Await<U> : T;

/**
 * A shorthand for `T | Promise<T>`.
 */
export type MaybePromise<T> = T | Promise<T>;
