// Make-or-buy model behind the bakery widget on „Собствена пекарна или
// доставчик?“ and the chart on „Специализация и размер на пазара“.
// No DOM, no formatting: the OJS cells import these.

const EPS = 1e-9;

// Money in euros, quantities per month. F: fixed cost per month,
// v: variable cost per piece, Q: pieces made (Q > 0), p: supplier's price.

export function averageCost(F, v, Q) {
  return v + F / Q;
}

// Volume at which making costs the same as buying at price p.
export function breakEvenQuantity(F, v, p) {
  if (p <= v) return Infinity;
  return F / (p - v);
}

// Per month; positive means buying is cheaper.
export function extraCostOfMaking(F, v, p, Q) {
  return F - (p - v) * Q;
}

// "buy", "make" or "edge" when making costs the same as buying.
export function makeOrBuy(F, v, p, Q) {
  const d = averageCost(F, v, Q) - p;
  if (Math.abs(d) < EPS) return "edge";
  return d > 0 ? "buy" : "make";
}

// Volume at which two technologies cost the same per piece
// (requires v1 > v2 and F2 > F1).
export function crossover(F1, v1, F2, v2) {
  return (F2 - F1) / (v1 - v2);
}
