/* eslint-disable react-hooks/rules-of-hooks */
import type { NextPage } from "next";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getFirstTwoWords, getWords } from "../utils/pages/twitterReader/stringManipulation";
import { EXPIRY, getWithExpiry, getWithToken, setWithExpiry, setWithToken } from "../utils/localStorage";
import styles from "./twitterReader.module.css";
import { getCurrentTweet, settingTweets } from "../utils/pages/twitterReader/twitterReader";

export const WORDS_PER_TWEET = 1;
const DEFAULT_TWEET_SPEED = 8;
const HOVER_TWEET_SPEED = 3;

const twitterReader: NextPage = () => {
	const router = useRouter();
	const { id: queryId } = router.query;
	const [allTweets, setAllTweets] = useState([] as any);
	const [currentTweet, setCurrentTweet] = useState(0);
	const [currentPlaceInTweet, setCurrentPlaceInTweet] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTweetSpeed, setCurrentTweetSpeed] = useState(DEFAULT_TWEET_SPEED);
	const [prevTweetSpeed, setPrevTweetSpeed] = useState(DEFAULT_TWEET_SPEED);
	const [isLoading, setIsLoading] = useState(true);

	const handleStart = useCallback(() => {
		if (
			!allTweets[currentTweet]?.text.includes("RT ") &&
			getWords(allTweets[currentTweet]?.text, currentPlaceInTweet + WORDS_PER_TWEET)
		) {
			setCurrentPlaceInTweet(currentPlaceInTweet + WORDS_PER_TWEET);
		} else {
			if (allTweets[currentTweet - 1]) localStorage.setItem("currentTweetId", allTweets[currentTweet - 1]?.id);
			setCurrentTweet(currentTweet - 1);
			setCurrentPlaceInTweet(0);
		}
	}, [allTweets, currentTweet, currentPlaceInTweet]);

	useEffect(() => {
		async function fetchTweets() {
			const response = await fetch("/api/posts", { method: "POST" });
			const fetchedPosts = await response.json();
			settingTweets(setAllTweets, setCurrentTweet, fetchedPosts, queryId, setIsLoading)
			setWithExpiry("tweets", fetchedPosts, EXPIRY);
			
		}
		const cachedTweets = getWithExpiry("tweets");
		if (cachedTweets) {
			settingTweets(setAllTweets, setCurrentTweet, cachedTweets, queryId, setIsLoading)
		} else {
			fetchTweets();
		}
	}, [queryId]);

	useEffect(() => {
		let interval: any;
		if (isPlaying && currentTweet >= 0) {
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
		if (currentTweet < 0) setIsPlaying(false);
		if (allTweets[currentTweet + 1]) localStorage.setItem("currentTweetId", allTweets[currentTweet + 1]?.id);
		setCurrentTweet(currentTweet + 1);
		setCurrentPlaceInTweet(0);
	}
	function handleForward() {
		if (currentTweet < 0) return;
		if (allTweets[currentTweet - 1]) localStorage.setItem("currentTweetId", allTweets[currentTweet - 1]?.id);
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
	function handleBackTwitter(e: any) {
		router.push(
			{
				pathname: "/twitter",
				query: { id: allTweets[currentTweet]?.id || "" },
			},
			"/twitter"
		);
	}

	return (
		<>
			{ !isLoading && <div className="">
				<div className="divider pt-5"></div>
				<div className="flex flex-col mt-64 items-center h-screen ">
					<div className="flex flex-row justify-center">
						<button onClick={decreaseSpeed}> Decrease </button>
						<button onClick={handleBack} className="w-32">
							Prev
						</button>
						<div className={[styles.playpause, "flex", "flex-col", "items-center", "relative"].join(" ")}>
							<div className={styles.tooltip}>{currentTweet + 1} tweets left</div>
							<button onClick={handlePlay} className="w-32">
								Play/Pause({currentTweetSpeed})
							</button>
						</div>
						<button onClick={handleForward} className="w-32">
							Next
						</button>
						<button onClick={increaseSpeed}> Increase </button>
					</div>
					<div className="mt-8 text-4xl">{getFirstTwoWords(allTweets[currentTweet]?.author)}</div>

					<div className="text-6xl text-center p-5 mt-5" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseOut}>
						<div>
							{isPlaying ? (
								getWords(allTweets[currentTweet]?.text, currentPlaceInTweet)
							) : (
								<>
									<div className={[styles.iFrameAndTweet, "flex", "flex-col", "items-center", "relative"].join(" ")}>
										<iframe
											className={styles.hiddenIFrame}
											src={`https://twitframe.com/show?url=https://twitter.com/i/status/${allTweets[currentTweet]?.id}`}
										></iframe>
										<div className={[styles.tweet, "max-w-xl text-4xl"].join(" ")}>
											{allTweets[currentTweet]?.text}
										</div>
									</div>
								</>
							)}
						</div>
					</div>
					{currentTweet >= 0 ? <button onClick={handleBackTwitter}>back to twitter</button> : `DONE`}
				</div>
			</div>}
		</>
	);
};

export default twitterReader;
