import { GetStaticProps } from "next";
import type { NextPage } from "next";

export const getStaticProps: GetStaticProps = async () => {
	const res = await fetch(
		"https://api.twitter.com/2/lists/1362775113075208195/tweets?tweet.fields=author_id&user.fields=username&expansions=author_id",
		{
			headers: {
				Authorization: `Bearer ${process.env.TWITTER_TOKEN}`,
			},
		}
	);
	const posts = await res.json();

	const authorDict = {} as { [key: string]: string };

    posts.includes.users.forEach((user: any) => {
            authorDict[user.id] = user.username;
    });

	return {
		props: { posts: posts.data, authorDict },
	};
};

const twitter: NextPage = ({ posts, authorDict }: any) => {
	return (
		<div className="flex flex-row items-center justify-center">
			<div className="">
				<div className=" text-center">User</div>
				{posts.map((post: any) => (
					<div className=" text-center" key={post.id}>
						{post.text}
					</div>
				))}
			</div>
			<div className=" pl-8">
				<div className=" text-center">Post</div>
				{posts.map((post: any) => (
					<div key={post.id}>{authorDict[post.author_id]}</div>
				))}
			</div>
		</div>
	);
};

export default twitter;
