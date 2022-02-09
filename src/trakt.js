const userId = 'danbovey';

export const getTraktStats = async () => {
  let res;
  try {
    res = await fetch(`https://api.trakt.tv/users/${userId}/stats`, {
      headers: {
        'content-type': 'application/json',
        'trakt-api-version': 2,
        'trakt-api-key': TRAKT_CLIENT_ID
      }
    });
  } catch (error) {
    console.error(error.message);
    return;
  }

  return await res.json();
};
