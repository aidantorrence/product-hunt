/* eslint-disable react-hooks/rules-of-hooks */
import type { NextPage } from "next";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { cleanText, getFirstTwoWords, getWords } from "../utils/pages/twitterReader/stringManipulation";
import { EXPIRY, getWithExpiry, getWithToken, setWithExpiry, setWithToken } from "../utils/localStorage";
import styles from "./twitterReader.module.css";
import { getCurrentInterval, getCurrentTweet, settingTweets } from "../utils/pages/twitterReader/twitterReader";
import { motion } from "framer-motion";
import Image from "next/image";

export const WORDS_PER_TWEET = 1;
export const DEFAULT_TWEET_SPEED = 10;
export const HOVER_TWEET_SPEED = 3;
export const PUNCTUATION_TWEET_SPEED = 6;

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
			settingTweets(setAllTweets, setCurrentTweet, fetchedPosts, queryId, setIsLoading);
			setWithExpiry("tweets", fetchedPosts, EXPIRY);
		}
		const cachedTweets = getWithExpiry("tweets");
		if (cachedTweets) {
			settingTweets(setAllTweets, setCurrentTweet, cachedTweets, queryId, setIsLoading);
		} else {
			fetchTweets();
		}
	}, [queryId]);

	useEffect(() => {
		let interval: any;
		if (isPlaying && currentTweet >= 0) {
			interval = setInterval(() => {
				handleStart();
			}, getCurrentInterval(allTweets, currentTweet, currentPlaceInTweet, currentTweetSpeed, getWords));
		}
		return () => clearInterval(interval);
	}, [isPlaying, handleStart, currentTweetSpeed, currentPlaceInTweet, allTweets, currentTweet]);

	function handlePlay() {
		setIsPlaying(!isPlaying);
		setCurrentPlaceInTweet(0);
	}
	function handleStop() {
		if (isPlaying) {
			setCurrentPlaceInTweet(0);
			setIsPlaying(false);
		}
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
		<div
			className={["flex", "flex-col", "justify-center", "items-center", styles.main].join(" ")}
			role={isPlaying ? "button" : "div"}
			onClick={handleStop}
		>
			{!isLoading && !isPlaying ? (
				<div className="">
					<div className="divider pt-5"></div>
					<div className="flex flex-col items-center ">
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
						<div>
							<div>
								<div className="flex border mt-2 mb-2 rounded-lg hover:bg-blue-50 hover:transition">
									<div className="flex flex-col items-center p-2 border-r">
										<Image
											alt="post"
											layout="fixed"
											src={allTweets[currentTweet]?.profile_image_url || 'https://pbs.twimg.com/profile_images/1372896650138648582/-wPcrIcf_normal.jpg'}
											className="rounded-full"
											width={64}
											height={64}
										/>
										<div className="text-2xl pt-2">{getFirstTwoWords(allTweets[currentTweet]?.author)}</div>
									</div>
									<div className={[styles.tweet, "max-w-xl text-xl p-2 flex items-center"].join(" ")}>
										{cleanText(allTweets[currentTweet]?.text)}
									</div>
								</div>
							</div>
						</div>
						{currentTweet >= 0 ? <button onClick={handleBackTwitter}>back to twitter</button> : `DONE`}
					</div>
				</div>
			) : (
				!isLoading && (
					<>
						<Image
							alt="post"
							layout="fixed"
							src={allTweets[currentTweet]?.profile_image_url  || 'https://pbs.twimg.com/profile_images/1372896650138648582/-wPcrIcf_normal.jpg'}
							className="rounded-full"
							width={64}
							height={64}
						/>
						<div className="text-lg text-gray-100 mt-2">{getFirstTwoWords(allTweets[currentTweet]?.author)}</div>
						<div className="relative mt-24">
							<div className="text-white z-30 text-3xl leading-none text-center p-2" role="button" onClick={handlePlay}>
								{getWords(allTweets[currentTweet]?.text, currentPlaceInTweet) || 'END'}
							</div>
							<motion.div
								className={[
									styles.mainTweet,
									"bg-blue-700",
									"rounded-xl",
									"absolute",
									"h-full",
									"w-full",
									"top-0",
									"left-0",
									"-z-20",
								].join(" ")}
								key={getWords(allTweets[currentTweet]?.text, currentPlaceInTweet)}
								onMouseEnter={handleMouseEnter}
								onMouseLeave={handleMouseOut}
								initial={{ scale: 1.03 }}
								animate={{ scale: 1 }}
								transition={{ duration: 0.1 }}
							></motion.div>
						</div>
						<div className={[styles.overlay, "bg-gray-800"].join(" ")}></div>
					</>
				)
			)}
		</div>
	);
};

export default twitterReader;
