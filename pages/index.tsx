import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { Post, Props } from "../interfaces";
import productHuntFetch from "../requests/productHuntFetch";
import { useEffect, useState } from "react";
import { EXPIRY, getWithExpiry, setWithExpiry } from "../utils/localStorage";
import { DateTime } from "luxon";

const Home: NextPage<Props> = () => {
	const [posts, setPosts] = useState([] as any);
	const [count, setCount] = useState(0);
	useEffect(() => {
		async function fetchPosts() {
			const fetchedPosts = await productHuntFetch(count);
			const formattedPosts = fetchedPosts.posts.edges.map((edge: { node: Post[] }) => edge.node);
			setPosts(formattedPosts);
			setWithExpiry(`posts-${DateTime.now().minus({ days: count }).toISODate()}`, formattedPosts, EXPIRY);
		}
		const cachedPosts = getWithExpiry(`posts-${DateTime.now().minus({ days: count }).toISODate()}`);
		if (cachedPosts) {
			setPosts(cachedPosts);
		} else {
			fetchPosts();
		}
	}, [count]);

	useEffect(() => {
		setCount(parseInt(sessionStorage.getItem("count") || "0", 10));
	}, []);

	function handleCount(count: number) {
		setCount(count);
		sessionStorage.setItem("count", count.toString());
	}
	return (
		<>
			<Head>
				<title>Create Next App</title>
				<meta name="description" content="Generated by create next app" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<div className="flex flex-col items-center">
				<div className="flex flex-row items-center justify-center">
					<div className="">
						<div className=" text-center">Votes</div>
						{posts.map((post: any) => (
							<div className="flex mt-4" key={post.id}>
								<div className="w-4 text-center">{post.votesCount}</div>
								<a className="ml-8" href={post.website} key={post.id}>
									{post.tagline}
								</a>
							</div>
						))}
					</div>
				</div>
				<div className="flex flex-row items-center justify-center">
					<button className="mt-8 mx-4" onClick={() => handleCount(count + 1)}>
						past
					</button>
					<Link href="/twitter">
						<a className="mt-8 mx-4">Twitter List</a>
					</Link>
					<button className="mt-8 mx-4" onClick={() => handleCount(count - 1)}>
						future
					</button>
				</div>
			</div>
			{/* <ReactTable posts={posts} /> */}
		</>
	);
};

export default Home;
