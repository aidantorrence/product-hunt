/* eslint-disable react-hooks/rules-of-hooks */
import { GetStaticProps } from "next";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import fetchTweets from "../requests/fetchLoop";
import { getFirstTwoWords } from "../utils/stringManipulation";
import { getWithExpiry, setWithExpiry } from "../utils/localStorage";

export const getStaticProps: GetStaticProps = async () => {
	const res = await fetch(
		`https://api.twitter.com/2/lists/1362775113075208195/tweets?tweet.fields=author_id&user.fields=username&expansions=author_id`,
		{
			headers: {
				Authorization: `Bearer ${process.env.TWITTER_TOKEN}`,
			},
		}
	);
	const posts = await res.json();

	const authorDict = {} as { [key: string]: string };

	posts?.includes?.users?.forEach((user: any) => {
		authorDict[user?.id] = user?.name;
	});
	posts?.data?.forEach((post: any) => {
		post.author = authorDict[post.author_id];
	});

	return {
		props: { posts: posts.data, next_token: posts.meta.next_token },
	};
};

const twitter: NextPage = ({ posts, next_token }: any) => {
	const [extraPosts, setExtraPosts] = useState([] as any);
	const [count, setCount] = useState(0);

	useEffect(() => {
		async function fetchTweets() {
			const response = await fetch("/api/posts", { method: "POST", body: next_token });
			const posts = await response.json();
			setExtraPosts(posts);
			setWithExpiry("tweets", posts, 12);
		}

		const tweets = getWithExpiry("tweets");
		if (tweets) {
			setExtraPosts(tweets);
		} else {
			fetchTweets();
		}
	}, [next_token]);

	useEffect(() => {
		function handleScroll() {
			console.log(count);
			setCount((count) => count + 1);
			if (count % 2 === 0 && count !== 0) {
				localStorage.setItem("scroll", String(window["scrollY"]));
			}
		}
		addEventListener("scroll", handleScroll);
		return () => removeEventListener("scroll", handleScroll);
	}, [count]);

	useEffect(() => {
		scrollTo(0, Number(localStorage.getItem("scroll")) ?? 0);
	}, [extraPosts]);

	return (
		<table className="flex flex-col m-auto max-w-4xl">
			<tr>
				<th className="pl-8 w-64">User</th>
				<th>Tweet</th>
			</tr>
			{posts.map((post: any) => (
				<tr className="py-2" key={post.id}>
					<td className="pl-8 w-64 text-xl">{getFirstTwoWords(post.author)}</td>
					<td className="text-xl">{post.text}</td>
				</tr>
			))}
			{extraPosts.map((post: any) => (
				<tr className="py-2" key={post.id}>
					<td className="pl-8 w-64 text-xl">{getFirstTwoWords(post.author)}</td>
					<td className="text-xl">{post.text}</td>
				</tr>
			))}
		</table>

		// <ReactTable posts={posts} />
	);
};

export default twitter;
