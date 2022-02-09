export const getMixCount = async () => {
  const res = await fetch(
    'https://soundcloud.com/cantwait/sets/cant-wait-mixes'
  );
  const html = await res.text();

  const numTracks = /itemprop="numTracks" content="(\d+)"/.exec(html);

  return { mixCount: Number.parseInt(numTracks[1]) };
};
