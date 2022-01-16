/* eslint-disable react-hooks/rules-of-hooks */
import { GetStaticProps } from "next";
import type { NextPage } from "next";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getFirstTwoWords, getWords } from "../utils/stringManipulation";
import { getWithExpiry, getWithToken, setWithExpiry, setWithToken } from "../utils/localStorage";
import styles from "./twitterReader.module.css";
import router from "next/router";

export const WORDS_PER_TWEET = 1;
const DEFAULT_TWEET_SPEED = 8;
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
	const router = useRouter();
	const { id: queryId } = router.query;

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
					if (queryId ? tweet.id === queryId : tweet.id === currentTweetId) {
						setCurrentTweet(idx);
					}
				});
				setCurrentTweet((idx) => idx || res.length - 1);
				return res;
			});
			setWithExpiry("tweets", fetchedPosts, 12);
			setWithToken("tweets", fetchedPosts, next_token);
		}
		const cachedTweets = getWithToken("tweets", next_token);
		if (cachedTweets) {
			setAllTweets((tweets: any) => {
				const res = [...tweets, ...cachedTweets];
				const currentTweetId = localStorage.getItem("currentTweetId");
				res.forEach((tweet: any, idx: number) => {
					if (queryId ? tweet.id === queryId : tweet.id === currentTweetId) {
						setCurrentTweet(idx);
					}
				});
				setCurrentTweet((idx) => idx || res.length - 1);
				return res;
			});
		} else {
			fetchTweets();
		}
	}, [next_token, queryId]);

	useEffect(() => {
		let interval: any;
		if (isPlaying) {
			interval = setInterval(
				() => {
					handleStart();
				},
				!getWords(allTweets[currentTweet]?.text, currentPlaceInTweet + WORDS_PER_TWEET) ||
					allTweets[currentTweet]?.text.includes("RT ")
					? 1000 / HOVER_TWEET_SPEED
					: 1000 / currentTweetSpeed
			);
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

	function handleMouseEnter() {
		if (isPlaying) {
			setPrevTweetSpeed(currentTweetSpeed);
			setCurrentTweetSpeed(HOVER_TWEET_SPEED);
		}
	}
	function handleMouseOut() {
		if (isPlaying) {
			setCurrentTweetSpeed(prevTweetSpeed);
		}
	}

	function decreaseSpeed() {
		setCurrentTweetSpeed(currentTweetSpeed - 1);
	}
	function increaseSpeed() {
		setCurrentTweetSpeed(currentTweetSpeed + 1);
	}
	function handleBackTwitter (e:any) {
		router.push(
			{
			  pathname: '/twitter',
			  query: {id: allTweets[currentTweet].id}
			},
			'/twitter',
		  );
	}

	return (
		<>
			<div className="">
				<div className="divider pt-5"></div>
				<div className="flex flex-col mt-64 items-center h-screen ">
					<div className="flex flex-row justify-center">
						<button onClick={handleBack} className="w-64">
							Prev
						</button>
						<button onClick={decreaseSpeed}> Decrease </button>
						<button onClick={handlePlay} className="w-64">
							Play/Pause({currentTweetSpeed})
						</button>
						<button onClick={increaseSpeed}> Increase </button>
						<button onClick={handleForward} className="w-64">
							Next
						</button>
					</div>
					<div className="mt-8 text-4xl">{getFirstTwoWords(allTweets[currentTweet]?.author)}</div>

					<div className="text-6xl text-center p-5 mt-5" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseOut}>
						<div>
							{isPlaying ? (
								getWords(allTweets[currentTweet]?.text, currentPlaceInTweet)
							) : (
								<>
									<div className={[styles.iFrameAndTweet, "flex", "flex-col", "items-center"].join(" ")}>
										<iframe
											className={styles.hiddenIFrame}
											src={`https://twitframe.com/show?url=https://twitter.com/i/status/${allTweets[currentTweet]?.id}`}
										></iframe>
										<div className={[styles.tweet, "max-w-5xl"].join(" ")}>{allTweets[currentTweet]?.text}</div>
									</div>
								</>
							)}
						</div>
					</div>
					<button onClick={handleBackTwitter}>back to twitter</button>
				</div>
			</div>
		</>
	);
};

export default twitterReader;
