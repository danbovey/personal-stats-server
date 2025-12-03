const username = 'boveybrawlers';
// Subrequest limit of CloudFlare Workers is 50, so we should limit to 40 playlists
const limit = 40;

const getAccessToken = async env => {
  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', env.SPOTIFY_REFRESH_TOKEN);

  let res;
  try {
    res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`
      }
    });
  } catch (error) {
    console.error(error.message);
    throw error;
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Spotify ${res.status}: ${body.slice(0, 200)}`);
  }

  return await res.json();
};

export const getSpotifyPlaylists = async env => {
  if (
    !env?.SPOTIFY_CLIENT_ID ||
    !env?.SPOTIFY_CLIENT_SECRET ||
    !env?.SPOTIFY_REFRESH_TOKEN
  ) {
    throw new Error(
      'SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, and SPOTIFY_REFRESH_TOKEN are required'
    );
  }

  const { access_token } = await getAccessToken(env);

  let res;
  try {
    res = await fetch(
      `https://api.spotify.com/v1/users/${username}/playlists?limit=${limit}`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
  } catch (error) {
    console.error(error.message);
    throw error;
  }
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Spotify ${res.status}: ${body.slice(0, 200)}`);
  }
  const body = await res.json();

  let playlists = body.items.filter(playlist => playlist.owner.id === username);

  let followers = await Promise.all(
    playlists.map(playlist =>
      fetch(
        `https://api.spotify.com/v1/playlists/${playlist.id}?fields=followers(total)`,
        { headers: { Authorization: `Bearer ${access_token}` } }
      )
    )
  );
  followers = await Promise.all(followers.map(f => f.json()));

  playlists = playlists.map((playlist, index) => ({
    ...playlist,
    followers: followers[index].followers.total
  }));

  playlists.sort((a, b) => b.followers - a.followers);

  return playlists.slice(0, 5);
};
