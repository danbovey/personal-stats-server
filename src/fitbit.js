const refreshAccessToken = async tokens => {
  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('client_id', FITBIT_CLIENT_ID);
  if (tokens?.access_token) {
    params.append('access_token', tokens.access_token);
  }
  if (tokens?.refresh_token) {
    params.append('refresh_token', tokens.refresh_token);
  }

  const res = await fetch('https://api.fitbit.com/oauth2/token', {
    method: 'POST',
    body: params,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      authorization: `Basic ${btoa(
        `${FITBIT_CLIENT_ID}:${FITBIT_CLIENT_SECRET}`
      )}`
    }
  });

  return await res.json();
};

const getAccessToken = async () => {
  let prevTokens = await STATSDB.get('fitbit.tokens');
  prevTokens = JSON.parse(prevTokens);
  const tokens = await refreshAccessToken(prevTokens);
  await STATSDB.put('fitbit.tokens', JSON.stringify(tokens));

  return tokens.access_token;
};

export const getFitbitSummary = async () => {
  const accessToken = await getAccessToken();
  const res = await fetch(
    'https://api.fitbit.com/1/user/-/activities/date/today.json',
    { headers: { authorization: `Bearer ${accessToken}` } }
  );
  const body = await res.json();

  return {
    steps: body.summary.steps
  };
};
