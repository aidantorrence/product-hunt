import { GraphQLClient, gql } from "graphql-request";

export default async function productHuntFetch() {
	const endpoint = "https://api.producthunt.com/v2/api/graphql";
	const startDate = new Date();
	startDate.setDate(startDate.getDate() - 1);
	const endDate = new Date();

	try {
		const graphQLClient = new GraphQLClient(endpoint, {
			headers: {
				authorization: `Bearer ${process.env.PRODUCT_HUNT_TOKEN}`,
			},
		});

		const query = gql`
            {
                posts(postedAfter: "${startDate.toISOString()}", postedBefore: "${endDate.toISOString()}" , order: VOTES) {
                    edges {
                        node {
                            id
                            tagline
                            votesCount
                            website
                            description
                        }
                    }
                }
            }
        `;
		return graphQLClient.request(query);
	} catch (error) {
		console.log(error);
	}
}
