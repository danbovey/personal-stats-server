export const getReadingChallenge = async () => {
  const res = await fetch('https://www.goodreads.com/user/show/117994749-dan');
  const html = await res.text();

  const match = /Dan has read (\d+) of (\d+) books/.exec(html);

  return { read: Number.parseInt(match[1]), goal: Number.parseInt(match[2]) };
};
