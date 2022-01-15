export function getFirstTwoWords(text: string) {
    return text.split(' ').slice(0,2).join(' ')
}