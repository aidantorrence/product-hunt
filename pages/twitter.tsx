/* eslint-disable react-hooks/rules-of-hooks */
import { GetStaticProps } from "next";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { getFirstTwoWords } from "../utils/stringManipulation";
import { getWithExpiry, getWithToken, setWithExpiry, setWithToken } from "../utils/localStorage";

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
	const [allTweets, setAllTweets] = useState(posts);
	const [count, setCount] = useState(0);

	useEffect(() => {
		async function fetchTweets() {
			const response = await fetch("/api/posts", { method: "POST", body: next_token });
			const fetchedPosts = await response.json();
			setAllTweets((tweets: any) => [...tweets, ...fetchedPosts]);
			setWithToken("tweets", fetchedPosts, next_token);
		}
		const cachedTweets = getWithToken("tweets", next_token);
		if (cachedTweets) {
			setAllTweets((tweets: any) => [...tweets, ...cachedTweets]);
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
	}, [allTweets]);

	return (
		<table className="m-auto">
			<tbody className="flex flex-col max-w-4xl">
				<tr>
					<th className="pl-8 w-64">User</th>
					<th>Tweet</th>
				</tr>
				{allTweets.slice().reverse().map((post: any) => (
					<tr className="py-2" key={post.id}>
						<td className="pl-8 w-64 text-xl">{getFirstTwoWords(post.author)}</td>
						<td className="text-xl">{post.text}</td>
					</tr>
				))}
			</tbody>
		</table>

		// <ReactTable posts={posts} />
	);
};

export default twitter;