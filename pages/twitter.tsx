/* eslint-disable react-hooks/rules-of-hooks */
import { GetStaticProps } from "next";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import fetchTweets from "../utils/fetchLoop";

export const getStaticProps: GetStaticProps = async () => {
	const pagination_token: string = "";
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

	posts.includes.users.forEach((user: any) => {
		authorDict[user.id] = user.name;
	});
	posts.data.forEach((post: any) => {
		post.author = authorDict[post.author_id];
	});

	return {
		props: { posts: posts.data, next_token: posts.meta.next_token },
	};
};

const twitter: NextPage = ({ posts, next_token }: any) => {
	const [extraPosts, setExtraPosts] = useState([] as any);

	useEffect(() => {
		async function fetchTweets() {
			const response = await fetch("/api/posts", { method: "POST", body: next_token });
			const posts = await response.json();
			console.log("anything?", posts);
			setExtraPosts(posts);
		}
		fetchTweets();
	}, [next_token]);

	// async function fetchTweets(token: string) {
	//     let loops = 0;
	//     const posts = [];
	//     while (loops < 3) {
	//         try {
	//             const response = await fetch(
	//                 `https://api.twitter.com/2/lists/1362775113075208195/tweets?tweet.fields=author_id&user.fields=username&expansions=author_id`,
	//                 {
	//                     headers: {
	//                         Authorization: `Bearer ${process.env.NEXT_PUBLIC_TWITTER_TOKEN}`,
	//                     },
	//                 }
	//             );
	//             const newPosts = await response.json();
	//             posts.push(...newPosts);
	//             token = newPosts.pagination.next_token;
	//         } catch (error) {
	//             console.log(error);
	//         }
	//         loops++;
	//     }
	//     setExtraPosts(posts);
	// }
	// fetchTweets(next_token);
	// }, [next_token]);

	return (
		<table className="flex flex-col m-auto w-6/12">
			<tr>
				<th className="pl-8 w-64">User</th>
				<th>Tweet</th>
			</tr>
			{posts.map((post: any) => (
				<tr className="py-2" key={post.id}>
					<td className="pl-8 w-64 text-lg">{post.author}</td>
					<td>{post.text}</td>
				</tr>
			))}
			0000000000
			{extraPosts.map((post: any) => (
				<tr className="py-2" key={post.id}>
					<td className="pl-8 w-64 text-lg">{post.author}</td>
					<td>{post.text}</td>
				</tr>
			))}
		</table>
		// <div className="flex flex-row items-center justify-center">
		// 	<div className="">
		// 		<div className=" text-center">User</div>
		// 		{posts.map((post: any) => (
		// 			<div className=" text-center" key={post.id}>
		// 				{post.author}
		// 			</div>
		// 		))}
		// 	</div>
		// 	<div className=" pl-8">
		// 		<div className=" text-center">Post</div>
		// 		{posts.map((post: any) => (
		// 			<div key={post.id}>{post.text}</div>
		// 		))}
		// 	</div>
		// </div>
		// <ReactTable posts={posts} />
	);
};

export default twitter;
