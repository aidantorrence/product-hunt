/* eslint-disable react-hooks/rules-of-hooks */
import type { NextPage } from "next";
import { useEffect, useState, useRef } from "react";
import { getFirstTwoWords } from "../utils/pages/twitterReader/stringManipulation";
import { EXPIRY, getWithExpiry, getWithToken, setWithExpiry, setWithToken } from "../utils/localStorage";
import { useRouter } from "next/router";
import styles from './twitter.module.css'

const twitter: NextPage = () => {
	const [allTweets, setAllTweets] = useState([] as any );
	const [count, setCount] = useState(0);
	const locationsRef: any = useRef([]);
	const router = useRouter();
	const { id: queryId } = router.query;

	useEffect(() => {
		async function fetchTweets() {
			const response = await fetch("/api/posts", { method: "POST" });
			const fetchedPosts = await response.json();
			setAllTweets(fetchedPosts);
			setWithExpiry("tweets", fetchedPosts, EXPIRY);
		}
		const cachedTweets = getWithExpiry("tweets");
		if (cachedTweets) {
			setAllTweets(cachedTweets);
		} else {
			fetchTweets();
		}
	}, []);

	useEffect(() => {
		function handleScroll() {
			console.log(count);
			setCount((count) => count + 1);
			if (count % 2 === 0 && count !== 0) {
				for (const location of locationsRef.current) {
					if (location?.getBoundingClientRect().top + window.scrollY > window.scrollY) {
						localStorage.setItem('scrollId', location.id);
						console.log('scrollId', location.id)
						break
					}
				};
			}
		}
		addEventListener("scroll", handleScroll);
		return () => removeEventListener("scroll", handleScroll);
	}, [count]);

	useEffect(() => {
		const scrollId = localStorage.getItem('scrollId');
		for (const location of locationsRef.current) {
			if (queryId ? location?.id === queryId : location?.id === scrollId) {
				window.scrollTo(0, location?.getBoundingClientRect().top + window.scrollY - 300);
				break
			}
		};
	}, [allTweets, queryId]);

	function handlePostClick (e:any) {
		router.push(
			{
			  pathname: '/twitterReader',
			  query: {id: e.target.id}
			},
			'/twitterReader',
		  );
	}

	return (
		<table className="m-auto">
			<tbody className="flex flex-col max-w-4xl">
				{allTweets.slice().reverse().map((post: any, idx: any) => (
					<tr className={styles.tweet} key={post.id}>
						<td className="pl-8 w-64 text-xl">{getFirstTwoWords(post.author)}</td>
						<td role="button" onClick={handlePostClick} id={post.id} ref={el => locationsRef.current[idx] = el} className="text-xl">{post.text}</td>
					</tr>
				))}
			</tbody>
		</table>

		// <ReactTable posts={posts} />
	);
};

export default twitter;