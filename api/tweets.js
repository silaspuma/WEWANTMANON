// api/tweets.js
import fetch from 'node-fetch';

const BEARER_TOKEN = 'AAAAAAAAAAAAAAAAAAAAAOFC7wEAAAAA4UriTAyLQAfQ0%2B6sNpj8rtcMxfY%3DKUTCDMURdzhJRr9WNDHoI9IN45TEap7Ugbhun97RCgXX55YnBv';

// keep track of newest tweet per hashtag
let sinceIds = {};

export default async function handler(req, res) {
  // allow CORS for your site
  res.setHeader('Access-Control-Allow-Origin', 'https://wewantmanon.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { hashtag } = req.query;
  if (!hashtag) return res.status(400).json({ error: 'hashtag required' });

  let url = `https://api.twitter.com/2/tweets/search/recent?query=%23${encodeURIComponent(hashtag)}&tweet.fields=created_at,author_id&expansions=author_id&user.fields=username&max_results=10`;
  if (sinceIds[hashtag]) url += `&since_id=${sinceIds[hashtag]}`;

  try {
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${BEARER_TOKEN}` }
    });

    const data = await response.json();

    // update since_id
    if (data.meta?.newest_id) sinceIds[hashtag] = data.meta.newest_id;

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tweets', details: err.message });
  }
}
