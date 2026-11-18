// Two identical apps and a network effect, behind the widget on „Две еднакви приложения“.
// No DOM, no formatting: the OJS cells import these.

// Points by which a newcomer likes one app more than the other.
const TASTE = 20;

// Seeded random numbers in [0, 1) (mulberry32).
function mulberry32(seed) {
  let a = seed | 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// The tastes of `count` newcomers, in order of arrival: +1 likes your app more,
// -1 likes the competitor's more. The same run always gives the same newcomers.
export function tastes(run, count) {
  const rng = mulberry32(run);
  return Array.from({ length: count }, () => (rng() < 0.5 ? 1 : -1));
}

// The smallest lead, in users, that outweighs any newcomer's taste.
export function decidingLead(strength) {
  return strength > 0 ? Math.ceil(TASTE / strength) : Infinity;
}

// Your share of all users; one half while nobody has any.
export function share(a, b) {
  return a + b > 0 ? a / (a + b) : 0.5;
}

// Newcomers arrive one at a time and stay with the app they pick. Each user by which an app
// is ahead adds `strength` points to it; a newcomer picks the app she likes more unless the
// other app's lead outweighs her taste. `tippedAt` is the number of the first newcomer who
// follows the crowd whatever her taste. The arrays have one entry for the start and one after
// each newcomer.
export function simulate(tasteList, strength, headStart) {
  let a = headStart; // your users
  let b = 0; // the competitor's users
  let tippedAt = null;
  let winner = null;
  const yours = [a];
  const rival = [b];
  const shares = [share(a, b)];
  tasteList.forEach((taste, index) => {
    const pull = strength * (a - b);
    let choice = taste;
    if (Math.abs(pull) >= TASTE) {
      choice = pull > 0 ? 1 : -1;
      if (tippedAt === null) {
        tippedAt = index + 1;
        winner = pull > 0 ? "you" : "rival";
      }
    }
    if (choice === 1) a += 1;
    else b += 1;
    yours.push(a);
    rival.push(b);
    shares.push(share(a, b));
  });
  return { yours, rival, shares, tippedAt, winner };
}
