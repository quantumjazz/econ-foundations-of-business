// Interest and present value behind the wine widget on „Виното: сега или по-късно?“.
// No DOM, no formatting: the OJS cells import these.

const EPS = 1e-6;

// Money in euros, rates as a fraction a year (0.05 for 5%), time in years.

// What `amount` grows to after `years`, with interest on interest.
export function futureValue(amount, rate, years) {
  return amount * (1 + rate) ** years;
}

// What `amount` received after `years` is worth today.
export function presentValue(amount, rate, years) {
  return amount / (1 + rate) ** years;
}

// "wait", "sell" or "edge" when waiting is worth exactly as much as selling now.
export function waitOrSell(nowPrice, laterPrice, rate, years) {
  const pv = presentValue(laterPrice, rate, years);
  if (Math.abs(pv - nowPrice) < EPS) return "edge";
  return pv > nowPrice ? "wait" : "sell";
}
