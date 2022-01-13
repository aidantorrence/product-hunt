export interface Snippet {
	id: string;
	createdAt: string;
	title: string;
	prompt: string;
	language: string;
	category: string;
	difficulty: string;
	solution: string;
}
export interface Props {
	snippet: Snippet;
	productHuntPosts: any;
}
export interface Post {
	id: string;
	tagline: string;
	votesCount: number;
	website: string;
	description: string;
}