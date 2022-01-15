export function getFirstTwoWords(text: string) {
	return text.split(" ").slice(0, 2).join(" ");
}

export function getFourWords(text: string, placeInText: number) {
    if (text.includes('RT ')) return 'RT';

	const slice = text.split(" ").slice(placeInText, placeInText + 4);
    return slice.map( word => {
        if (word.toLowerCase().includes('https://')) {
            return '[LINK]';
        } else {
            return word
        }
    }
        ).join(" ");
}
