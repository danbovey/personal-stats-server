const userId = '32516454';

const refreshAccessToken = async (tokens, env) => {
  const body = {
    grant_type: 'refresh_token',
    refresh_token: tokens.refresh_token,
    client_id: env.STRAVA_CLIENT_ID,
    client_secret: env.STRAVA_CLIENT_SECRET
  };
  const res = await fetch('https://www.strava.com/api/v3/oauth/token', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' }
  });

  return await res.json();
};

const getAccessToken = async env => {
  let prevTokens = await env.STATSDB.get('strava.tokens');
  prevTokens = JSON.parse(prevTokens);

  const tokens = await refreshAccessToken(prevTokens, env);
  await env.STATSDB.put('strava.tokens', JSON.stringify(tokens));

  return tokens.access_token;
};

export const getStravaRecentRides = async env => {
  if (!env?.STRAVA_CLIENT_ID || !env?.STRAVA_CLIENT_SECRET) {
    throw new Error('STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET are required');
  }
  const accessToken = await getAccessToken(env);

  let res;
  try {
    res = await fetch(
      `https://www.strava.com/api/v3/athletes/${userId}/stats`,
      { headers: { authorization: `Bearer ${accessToken}` } }
    );
  } catch (error) {
    console.error(error.message);
    throw error;
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Strava ${res.status}: ${body.slice(0, 200)}`);
  }

  const athlete = await res.json();

  return athlete.recent_ride_totals;
};
