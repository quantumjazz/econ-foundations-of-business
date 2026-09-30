// Pure model functions behind the deck's widgets. No DOM, no formatting:
// the OJS cells import these and tests/models_test.ts checks them against
// the test cases in the brief.

const EPS = 1e-9;

// --- Critical loss (slide 20) ----------------------------------------------
// x: price rise, m: margin (price minus unit cost, as a share of price),
// l: expected share of customers lost. All as shares, e.g. 0.10.

export function criticalLoss(x, m) {
  return x / (x + m);
}

// After a rise of x, the margin per unit measured against the old price is
// m + x; profit is unchanged when (m + x)(1 - l) = m.
export function profitChange(x, m, l) {
  return ((m + x) * (1 - l)) / m - 1;
}

// "profit" when l < CL, "loss" when l > CL, "edge" when they are equal.
export function lossVerdict(l, cl) {
  if (Math.abs(l - cl) < EPS) return "edge";
  return l < cl ? "profit" : "loss";
}

// --- Leftover demand (slide 29) ----------------------------------------------
// Market demand P = 100 - Q, marginal cost 20 for both firms, entry cost 225.
// The incumbent commits to output qI and produces it whatever happens.

export const LEFTOVER = { a: 100, c: 20, entryCost: 225, maxQ: 80 };

export function entrantBest(qI) {
  const q = (80 - qI) / 2;
  const p = (120 - qI) / 2;
  const profit = q * q - 225;
  return { q, p, profit };
}

export function entryOutcome(qI) {
  const best = entrantBest(qI);
  const entry = best.profit > EPS;                 // strictly positive: qI = 50 blocks
  const price = entry ? best.p : 100 - qI;
  const incumbentProfit = entry ? (best.p - 20) * qI : (80 - qI) * qI;
  return { ...best, entry, price, incumbentProfit };
}

// The entrant's average cost AC(q) = 20 + 225 / q.
export function entrantAverageCost(q) {
  return 20 + 225 / q;
}

// --- Survivorship coin flips (slide 15) --------------------------------------

export const FLIPPERS = 225000000;

export function flippersLeft(round, start = FLIPPERS) {
  return Math.round(start / 2 ** round);
}
