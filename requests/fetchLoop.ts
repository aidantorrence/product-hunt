export default async function fetchTweets(token: string) {
	let loops = 0;
	const posts: any[] = [];
    const authorDict = {} as { [key: string]: string };
	while (loops < 8) {
		try {
			const response = await fetch(
				`https://api.twitter.com/2/lists/1362775113075208195/tweets?tweet.fields=author_id&user.fields=username&expansions=author_id${token ? `&pagination_token=${token}` : ''}`,
				{
					headers: {
						Authorization: `Bearer ${process.env.TWITTER_TOKEN}`,
					},
				}
			);
			const newPosts = await response.json();
            newPosts.includes.users.forEach((user: any) => {
                authorDict[user.id] = user.name;
            });
            newPosts.data.forEach((post: any) => {
                post.author = authorDict[post.author_id];
            });
			posts.push(...newPosts.data);

            token = newPosts.meta.next_token;
		} catch (error) {
			console.log(error);
		}
		loops++;
	}
    return posts;
}
