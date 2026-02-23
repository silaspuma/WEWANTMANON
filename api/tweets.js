// /api/tweets.js

let sinceIds = {};      // tracks newest tweet per hashtag
let cache = {};         // stores cached tweets
let cacheTime = {};     // timestamp of last fetch
const CACHE_DURATION = 60000; // 60 seconds

const BEARER_TOKEN = 'AAAAAAAAAAAAAAAAAAAAAOFC7wEAAAAAlxnMsOOFLALyBazNS%2BMEUTtYHiM%3D9Qu9CCYdowCeeZGr4GJ5Qpxp44LjfxsSSrbtX1vSWvSwXRXxMy';

export default async function handler(req, res) {
  // allow all origins for now
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { hashtag } = req.query;
  if (!hashtag) return res.status(400).json({ error: 'hashtag required' });

  const now = Date.now();

  // return cached tweets if still fresh
  if (cache[hashtag] && (now - cacheTime[hashtag] < CACHE_DURATION)) {
    return res.status(200).json(cache[hashtag]);
  }

  try {
    let url = `https://api.twitter.com/2/tweets/search/recent?query=%23${encodeURIComponent(hashtag)}&tweet.fields=created_at,author_id&expansions=author_id&user.fields=username&max_results=10`;
    if (sinceIds[hashtag]) url += `&since_id=${sinceIds[hashtag]}`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
    });

    const data = await response.json();

    // update newest tweet id
    if (data.meta?.newest_id) sinceIds[hashtag] = data.meta.newest_id;

    // cache it
    cache[hashtag] = data;
    cacheTime[hashtag] = now;

    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tweets', details: err.message });
  }
}
