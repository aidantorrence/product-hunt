export default function getCurrentTweet (posts: any, queryId: any) {
    const index = posts.findIndex((post: any) => post.id === queryId )
    return index === -1 ? 0 : index
}