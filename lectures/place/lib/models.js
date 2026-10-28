// Hotelling's beach behind the widget on „Плажът“.
// No DOM, no formatting: the OJS cells import these.

const EPS = 1e-9;

// Positions and distances in metres along a beach of length L,
// with customers spread evenly along it.

// Share of the customers who walk to the stand at `me`.
export function shareOf(me, other, L) {
  if (Math.abs(me - other) < EPS) return 0.5;
  const cut = (me + other) / 2;
  return me < other ? cut / L : (L - cut) / L;
}

// Where customers switch stand; null if both stands are together.
export function boundary(a, b) {
  if (Math.abs(a - b) < EPS) return null;
  return (a + b) / 2;
}

// Average distance a customer walks to the nearer stand.
export function averageWalk(a, b, L) {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  const cut = (lo + hi) / 2;
  return (lo ** 2 + (cut - lo) ** 2 + (hi - cut) ** 2 + (L - hi) ** 2) / (2 * L);
}
