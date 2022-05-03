import { GraphQLClient, gql } from "graphql-request";
import { DateTime } from "luxon";

export default async function productHuntFetch(count: number) {
	const endpoint = "https://api.producthunt.com/v2/api/graphql";
	const startDate = DateTime.now().minus({ days: count + 1 }).toUTC().toISODate();
	const endDate = DateTime.now().minus({ days: count }).toUTC().toISODate();

	try {
		const graphQLClient = new GraphQLClient(endpoint, {
			headers: {
				authorization: `Bearer ${process.env.NEXT_PUBLIC_PRODUCT_HUNT_TOKEN}`,
			},
		});

		const query = gql`
            {
                posts(postedAfter: "${startDate}", postedBefore: "${endDate}" , order: VOTES) {
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
