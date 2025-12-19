const refreshAccessToken = async (tokens, env) => {
  if (!tokens?.refresh_token) {
    throw new Error(
      'No refresh token found. Please manually add a refresh token to the database.'
    );
  }

  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('client_id', env.FITBIT_CLIENT_ID);
  params.append('refresh_token', tokens.refresh_token);

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

  const responseData = await res.json();

  if (!res.ok || responseData.success === false || responseData.errors) {
    const errorMessage =
      responseData?.errors?.[0]?.message ||
      responseData?.error_description ||
      JSON.stringify(responseData);
    throw new Error(
      `Fitbit token refresh failed (${res.status}): ${errorMessage}`
    );
  }

  if (!responseData.access_token) {
    throw new Error(
      'Fitbit token refresh succeeded but no access_token in response'
    );
  }

  if (!responseData.refresh_token) {
    throw new Error(
      'Fitbit token refresh succeeded but no refresh_token in response'
    );
  }

  return responseData;
};

const getAccessToken = async env => {
  let prevTokens = await env.STATSDB.get('fitbit.tokens');
  if (!prevTokens) {
    throw new Error(
      'No Fitbit tokens found in database. Please manually add tokens to the database.'
    );
  }

  prevTokens = JSON.parse(prevTokens);

  if (prevTokens.success === false || prevTokens.errors) {
    throw new Error(
      'Invalid tokens stored in database (error response detected). Please manually add valid refresh token to the database.'
    );
  }

  try {
    const tokens = await refreshAccessToken(prevTokens, env);
    await env.STATSDB.put('fitbit.tokens', JSON.stringify(tokens));

    return tokens.access_token;
  } catch (error) {
    throw new Error(`Failed to refresh Fitbit access token: ${error.message}`);
  }
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
