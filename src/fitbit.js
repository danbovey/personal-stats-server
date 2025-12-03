const refreshAccessToken = async (tokens, env) => {
  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('client_id', env.FITBIT_CLIENT_ID);
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
        `${env.FITBIT_CLIENT_ID}:${env.FITBIT_CLIENT_SECRET}`
      )}`
    }
  });

  return await res.json();
};

const getAccessToken = async env => {
  let prevTokens = await env.STATSDB.get('fitbit.tokens');
  prevTokens = JSON.parse(prevTokens);
  const tokens = await refreshAccessToken(prevTokens, env);
  await env.STATSDB.put('fitbit.tokens', JSON.stringify(tokens));

  return tokens.access_token;
};

export const getFitbitSummary = async env => {
  if (!env?.FITBIT_CLIENT_ID || !env?.FITBIT_CLIENT_SECRET) {
    throw new Error('FITBIT_CLIENT_ID and FITBIT_CLIENT_SECRET are required');
  }

  const accessToken = await getAccessToken(env);
  const today = new Date().toISOString().split('T')[0];
  const res = await fetch(
    `https://api.fitbit.com/1/user/-/activities/date/${today}.json`,
    { headers: { authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Fitbit ${res.status}: ${body.slice(0, 200)}`);
  }

  const body = await res.json();

  return {
    steps: body.summary.steps
  };
};
