/* eslint-disable react-hooks/rules-of-hooks */
import { GetStaticProps } from "next";
import type { NextPage } from "next";
import { useCallback, useEffect, useState } from "react";
import { getFirstTwoWords, getWords } from "../utils/stringManipulation";
import { getWithExpiry, setWithExpiry } from "../utils/localStorage";

export const WORDS_PER_TWEET = 1;
const DEFAULT_TWEET_SPEED = 10;
const HOVER_TWEET_SPEED = 3;

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
	const [currentTweetSpeed, setCurrentTweetSpeed] = useState(DEFAULT_TWEET_SPEED);
	const [prevTweetSpeed, setPrevTweetSpeed] = useState(DEFAULT_TWEET_SPEED);

	const handleStart = useCallback(() => {
		if (
			!allTweets[currentTweet]?.text.includes("RT ") &&
			getWords(allTweets[currentTweet]?.text, currentPlaceInTweet + WORDS_PER_TWEET)
		) {
			setCurrentPlaceInTweet(currentPlaceInTweet + WORDS_PER_TWEET);
		} else {
			localStorage.setItem("currentTweetId", allTweets[currentTweet - 1]?.id);
			setCurrentTweet(currentTweet - 1);
			setCurrentPlaceInTweet(0);
		}
	}, [allTweets, currentTweet, currentPlaceInTweet]);

	useEffect(() => {
		async function fetchTweets() {
			const response = await fetch("/api/posts", { method: "POST", body: next_token });
			const fetchedPosts = await response.json();
			setAllTweets((tweets: any) => {
				const res = [...tweets, ...fetchedPosts];
				const currentTweetId = localStorage.getItem("currentTweetId");
				res.forEach((tweet: any, idx: number) => {
					if (tweet.id === currentTweetId) {
						setCurrentTweet(idx);
					}
				});
				setCurrentTweet((idx) => idx || res.length - 1);
				return res;
			});
			setWithExpiry("tweets", fetchedPosts, 12);
		}
		const cachedTweets = getWithExpiry("tweets");
		if (cachedTweets) {
			setAllTweets((tweets: any) => {
				const res = [...tweets, ...cachedTweets];
				const currentTweetId = localStorage.getItem("currentTweetId");
				res.forEach((tweet: any, idx: number) => {
					if (tweet.id === currentTweetId) {
						setCurrentTweet(idx);
					}
				});
				setCurrentTweet((idx) => idx || res.length - 1);
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
				handleStart();
			}, !getWords(allTweets[currentTweet]?.text, currentPlaceInTweet + WORDS_PER_TWEET) ? 1000 / HOVER_TWEET_SPEED : 1000 / currentTweetSpeed);
		}
		return () => clearInterval(interval);
	}, [isPlaying, handleStart, currentTweetSpeed, currentPlaceInTweet, allTweets, currentTweet]);

	function handlePlay() {
		setIsPlaying(!isPlaying);
		setCurrentPlaceInTweet(0);
	}

	function handleBack() {
		localStorage.setItem("currentTweetId", allTweets[currentTweet + 1]?.id);
		setCurrentTweet(currentTweet + 1);
		setCurrentPlaceInTweet(0);
	}
	function handleForward() {
		localStorage.setItem("currentTweetId", allTweets[currentTweet - 1]?.id);
		setCurrentTweet(currentTweet - 1);
		setCurrentPlaceInTweet(0);
	}

	function handleHoverSpeed() {
		setCurrentTweetSpeed(currentTweetSpeed !== HOVER_TWEET_SPEED ? HOVER_TWEET_SPEED : DEFAULT_TWEET_SPEED);
	}

	return (
		<>
			<button onClick={handleBack} className="w-64">
				Go Back
			</button>
			<button onClick={handleForward} className="w-64">
				Click Forward
			</button>
			<div className="" role={isPlaying ? "button" : "div"} onClick={() => isPlaying && handlePlay()}>
				<div className="divider pt-5"></div>
				<div className="flex flex-col mt-80 items-center h-screen ">
					<div role="button" onClick={handlePlay} className=" text-4xl">
						{getFirstTwoWords(allTweets[currentTweet]?.author)}
					</div>

					<div
						className="text-6xl text-center p-5 mt-5"
						onMouseEnter={handleHoverSpeed}
						onMouseLeave={handleHoverSpeed}
					>
						{isPlaying ? getWords(allTweets[currentTweet]?.text, currentPlaceInTweet) : allTweets[currentTweet]?.text}
					</div>
				</div>
			</div>
		</>
	);
};

export default twitterReader;
