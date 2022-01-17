import { WORDS_PER_TWEET } from "../../../pages/twitterReader";

export function getFirstTwoWords(text: string) {
	return text?.split(/\s+/).slice(0, 2).join(" ");
}

export function getWords(text: string | undefined, placeInText: number) {
    if (!text) return "";
	if (text.includes("RT ")) return "RT";
	const slice = splitByNCharacters(text, 8).slice(placeInText, placeInText + WORDS_PER_TWEET);
	return slice.join(" ");
}

export function splitByNCharacters(text: string, n: number) {
	let words = text.split(/[@\s]+/).map((word) => {
        if (word.toLowerCase().includes("https://")) {
            return "[LINK]";
        } else {
            return word;
        }
    })
	let result = [];
	for (let i = 0; i < words.length; i++) {
        let start = 0;
        while (start < words[i].length) {
            result.push(words[i].slice(start, start + n));
            start += n;
        }
	}
	return result;
}
