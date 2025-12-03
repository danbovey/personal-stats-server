const userId = 'danbovey';

export const getTraktStats = async env => {
  if (!env?.TRAKT_CLIENT_ID) {
    throw new Error('TRAKT_CLIENT_ID is missing');
  }

  let res;
  try {
    res = await fetch(`https://api.trakt.tv/users/${userId}/stats`, {
      headers: {
        'content-type': 'application/json',
        'trakt-api-version': 2,
        'trakt-api-key': env.TRAKT_CLIENT_ID,
        'User-Agent': 'Dan Bovey Personal Site'
      }
    });
  } catch (error) {
    console.error(error.message);
    throw error;
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Trakt ${res.status}: ${body.slice(0, 200)}`);
  }

  return await res.json();
};
