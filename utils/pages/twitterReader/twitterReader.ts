import { HOVER_TWEET_SPEED, PUNCTUATION_TWEET_SPEED, WORDS_PER_TWEET } from "../../../pages/twitterReader";


export function getCurrentTweet (posts: any, queryId: any) {
    const index = posts.findIndex((post: any) => post.id === queryId )
    return index === -1 ? 0 : index
}
export function settingTweets(setAllTweets: any, setCurrentTweet: any, tweets: any, queryId: any, setIsLoading: any) {
    setAllTweets(() => {
        const currentTweetId = localStorage.getItem("currentTweetId");
        for (let i = 0; i < tweets.length; i++) {
            if (queryId ? tweets[i].id === queryId : tweets[i].id === currentTweetId) {
                setCurrentTweet(i);
                return tweets;
            }
        }
        setCurrentTweet(tweets.length - 1);
        return tweets;
    });
    setIsLoading(false);
}

//getCurrentInterval(allTweets, currentTweet, currentPlaceInTweet, currentTweetSpeed, getWords )

export function getCurrentInterval(allTweets: any, currentTweet: any, currentPlaceInTweet: any, currentTweetSpeed: any, getWords: any ) {
    const isLastInPlace = !getWords(allTweets[currentTweet]?.text, currentPlaceInTweet + WORDS_PER_TWEET)
    const includesRT = allTweets[currentTweet]?.text.includes("RT")

    const includesPunctuation = getWords(allTweets[currentTweet]?.text, currentPlaceInTweet).match(/[@!.,?:;]/)

    if (isLastInPlace || includesRT ) return  1000 / Math.min(HOVER_TWEET_SPEED, currentTweetSpeed)

    if (includesPunctuation) return 1000 / Math.min(PUNCTUATION_TWEET_SPEED, currentTweetSpeed)

    return 1000 / currentTweetSpeed
}