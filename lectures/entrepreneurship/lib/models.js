// Critical-loss model behind the widget on the „Критична загуба“ slide.
// No DOM, no formatting: the OJS cells import these.

const EPS = 1e-9;

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
