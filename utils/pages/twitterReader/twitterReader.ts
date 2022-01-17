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