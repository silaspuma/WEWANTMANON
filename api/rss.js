// /api/rss.js

import Parser from 'rss-parser';
const parser = new Parser();

let cache = null;
let cacheTime = 0;
const CACHE_DURATION = 60000; // 60 seconds

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const now = Date.now();
  if (cache && now - cacheTime < CACHE_DURATION) {
    return res.status(200).json(cache);
  }

  try {
    const feed = await parser.parseURL('https://rss.app/feeds/3dWSkwTparYVwFFT.xml');

    const items = feed.items.map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      content: item.contentSnippet || item.content || ''
    }));

    cache = items;
    cacheTime = now;

    res.status(200).json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch RSS feed', details: err.message });
  }
}
