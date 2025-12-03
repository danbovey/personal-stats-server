export const getReadingChallenge = async () => {
  const res = await fetch(
    'https://www.goodreads.com/user_challenges/widget/117994749-dan'
  );
  const html = await res.text();

  const [
    _,
    read,
    goal
  ] = /read (\d+) books? toward their goal of (\d+) books?/.exec(html);

  const [_m, challengeId] = /user_challenges\/(\d+)/.exec(html);

  return {
    read: Number.parseInt(read),
    goal: Number.parseInt(goal),
    challengeId
  };
};
