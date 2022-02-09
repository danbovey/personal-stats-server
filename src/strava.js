const userId = '32516454';

const refreshAccessToken = async tokens => {
  const body = {
    grant_type: 'refresh_token',
    refresh_token: tokens.refresh_token,
    client_id: STRAVA_CLIENT_ID,
    client_secret: STRAVA_CLIENT_SECRET
  };
  const res = await fetch('https://www.strava.com/api/v3/oauth/token', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' }
  });

  return await res.json();
};

const getAccessToken = async () => {
  let prevTokens = await STATSDB.get('strava.tokens');
  prevTokens = JSON.parse(prevTokens);

  const tokens = await refreshAccessToken(prevTokens);
  await STATSDB.put('strava.tokens', JSON.stringify(tokens));

  return tokens.access_token;
};

export const getStravaRecentRides = async () => {
  const accessToken = await getAccessToken();

  let res;
  try {
    res = await fetch(
      `https://www.strava.com/api/v3/athletes/${userId}/stats`,
      { headers: { authorization: `Bearer ${accessToken}` } }
    );
  } catch (error) {
    console.error(error.message);
    return;
  }

  const athlete = await res.json();

  return athlete.recent_ride_totals;
};
