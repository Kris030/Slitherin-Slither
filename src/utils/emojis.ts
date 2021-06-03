
/**
 * Converts a number to a string of emojis.
 * 
 * @param n The number.
 */
 export function emojiNumber(n: number) {
	return emojiNumberString(n.toString());
}

/**
 * Converts the digits in a string to emojis.
 * 
 * @param n The string.
 */
export function emojiNumberString(n: string) {
	return n
		.replace(/0/g, '0️⃣ ')
		.replace(/1/g, '1️⃣ ')
		.replace(/2/g, '2️⃣ ')
		.replace(/3/g, '3️⃣ ')
		.replace(/4/g, '4️⃣ ')
		.replace(/5/g, '5️⃣ ')
		.replace(/6/g, '6️⃣ ')
		.replace(/7/g, '7️⃣ ')
		.replace(/8/g, '8️⃣ ')
		.replace(/9/g, '9️⃣ ');
}

/**
 * Converts the (english) letters in a string to emojis.
 * 
 * @param n The string.
 */
export function emojiLetterString(str: string) {
	return str
		.replace(/a/ig, '🇦 ')
		.replace(/b/ig, '🇧 ')
		.replace(/c/ig, '🇨 ')
		.replace(/d/ig, '🇩 ')
		.replace(/e/ig, '🇪 ')
		.replace(/f/ig, '🇫 ')
		.replace(/g/ig, '🇬 ')
		.replace(/h/ig, '🇭 ')
		.replace(/i/ig, '🇮 ')
		.replace(/j/ig, '🇯 ')
		.replace(/k/ig, '🇰 ')
		.replace(/l/ig, '🇱 ')
		.replace(/m/ig, '🇲 ')
		.replace(/n/ig, '🇳 ')
		.replace(/o/ig, '🇴 ')
		.replace(/p/ig, '🇵 ')
		.replace(/q/ig, '🇶 ')
		.replace(/r/ig, '🇷 ')
		.replace(/s/ig, '🇸 ')
		.replace(/t/ig, '🇹 ')
		.replace(/u/ig, '🇺 ')
		.replace(/v/ig, '🇻 ')
		.replace(/w/ig, '🇼 ')
		.replace(/x/ig, '🇽 ')
		.replace(/y/ig, '🇾 ')
		.replace(/z/ig, '🇿 ');
}

/**
 * Converts the symbols in a string to emojis.
 * 
 * @param n The string.
 */
export function emojiSymbolString(str: string) {
	return str
		.replace(/\?/ig, '❓ ')
		.replace(/\!/ig, '❗ ')
		.replace(/\./ig, '**ₒ** ')
		.replace(/\,/ig, '**₎** ');
}

/**
 * Uses `emojiLetterString`, `emojiNumberString` and `emojiSymbolString` on a string.
 * @param str The string to emojify.
 */
export function emojifyString(str: string) {
	return emojiSymbolString(
		emojiLetterString(
			emojiNumberString(
				str
					.replace(/ /g, '🟦 ')
			)
		)
	);
}