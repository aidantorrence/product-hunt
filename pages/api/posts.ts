// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import fetchTweets from '../../requests/fetchLoop'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  
  console.log(req.body)

  const posts = await fetchTweets(req.body)
  res.status(200).json(posts)
}
