/* eslint-disable react-hooks/rules-of-hooks */
import { GetStaticProps } from "next";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { getFirstTwoWords, getFourWords } from "../utils/stringManipulation";
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

const twitterReader: NextPage = ({ posts, next_token }: any) => {
	const [allTweets, setAllTweets] = useState(posts);
	const [currentTweet, setCurrentTweet] = useState(0);
	const [currentPlaceInTweet, setCurrentPlaceInTweet] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);

	useEffect(() => {
		console.log("idk");
		async function fetchTweets() {
			const response = await fetch("/api/posts", { method: "POST", body: next_token });
			const fetchedPosts = await response.json();
			setAllTweets((tweets: any) => {
				const res = [...tweets, ...fetchedPosts];
				setCurrentTweet(res.length - 1);
				return res;
			});
			setWithExpiry("tweets", fetchedPosts, 12);
		}
		const cachedTweets = getWithExpiry("tweets");
		if (cachedTweets) {
			setAllTweets((tweets: any) => {
				const res = [...tweets, ...cachedTweets];
				setCurrentTweet(res.length - 1);
				return res;
			});
		} else {
			fetchTweets();
		}
	}, [next_token]);

	useEffect(() => {
		let interval: any;
		if (isPlaying) {
			interval = setInterval(() => {
				if (
					!allTweets[currentTweet]?.text.includes("RT ") &&
					getFourWords(allTweets[currentTweet]?.text ?? "", currentPlaceInTweet + 4)
				) {
					setCurrentPlaceInTweet(currentPlaceInTweet + 4);
				} else {
					setCurrentTweet(currentTweet - 1);
					setCurrentPlaceInTweet(0);
				}
			}, 1000);
		}
		return () => clearInterval(interval);
	}, [isPlaying, allTweets, currentPlaceInTweet, currentTweet]);

	function handleForward() {
		if (
			!allTweets[currentTweet]?.text.includes("RT ") &&
			getFourWords(allTweets[currentTweet]?.text ?? "", currentPlaceInTweet + 4)
		) {
			setCurrentPlaceInTweet(currentPlaceInTweet + 4);
		} else {
			setCurrentTweet(currentTweet - 1);
			setCurrentPlaceInTweet(0);
		}
	}

	function handleBack() {
		if (
			!allTweets[currentTweet].text.includes("RT ") &&
			getFourWords(allTweets[currentTweet]?.text ?? "", currentPlaceInTweet - 4)
		) {
			setCurrentPlaceInTweet(currentPlaceInTweet - 4);
		} else {
			setCurrentTweet(currentTweet + 1);
			setCurrentPlaceInTweet(0);
		}
	}

	function handlePlay() {
		setIsPlaying(!isPlaying);
	}

	return (
		<>
			<button onClick={handleForward} className="w-64">
				Click Forward
			</button>
			<button onClick={handleBack} className="w-64">
				Go Back
			</button>
			<button onClick={handlePlay} className="w-64">
				Play/Pause
			</button>
			<div className="flex items-center h-screen ">
				<div className=" ml-96 w-32 text-4xl">{getFirstTwoWords(allTweets[currentTweet]?.author ?? "")}</div>
				<div className="flex w-1/2 justify-center text-center">
					<div className="ml-16 text-6xl">{getFourWords(allTweets[currentTweet]?.text ?? "", currentPlaceInTweet)}</div>
				</div>
			</div>
		</>
	);
};

export default twitterReader;
