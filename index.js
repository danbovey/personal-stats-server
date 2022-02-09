import { Router } from 'itty-router';

import { getFitbitSummary } from './src/fitbit';
import { getReadingChallenge } from './src/goodreads';
import { getMixCount } from './src/soundcloud';
import { getSpotifyPlaylists } from './src/spotify';
import { getStravaRecentRides } from './src/strava';
import { getTraktStats } from './src/trakt';

const router = Router();
const jsonResponse = data =>
  new Response(JSON.stringify(data), {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-type': 'application/json'
    }
  });

router.get('/', () => {
  return new Response('Stats server');
});

router.get('/fitbit', async () => {
  const summary = await getFitbitSummary();
  return jsonResponse(summary);
});

router.get('/goodreads', async () => {
  const readingChallenge = await getReadingChallenge();
  return jsonResponse(readingChallenge);
});

router.get('/soundcloud', async () => {
  const mixCount = await getMixCount();
  return jsonResponse(mixCount);
});

router.get('/spotify', async () => {
  const topPlaylists = await getSpotifyPlaylists();
  return jsonResponse(topPlaylists);
});

router.get('/strava', async () => {
  const recentRides = await getStravaRecentRides();
  return jsonResponse(recentRides);
});

router.get('/trakt', async () => {
  const stats = await getTraktStats();
  return jsonResponse(stats);
});

router.all('*', () => new Response('404 not found', { status: 404 }));

addEventListener('fetch', e => {
  e.respondWith(router.handle(e.request));
});
