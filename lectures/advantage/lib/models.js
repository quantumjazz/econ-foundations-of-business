// Value-stick model behind the widget on „Вие срещу съседа“.
// No DOM, no formatting: the OJS cells import these.

const EPS = 1e-9;

// Money in euros per cup. wtp: the customer's willingness to pay,
// price: what the café charges, cost: what one cup costs the café.

// Value one cup creates.
export function valueCreated(wtp, cost) {
  return wtp - cost;
}

// What the customer keeps; below zero, the customer does not buy.
export function customerGain(wtp, price) {
  return wtp - price;
}

// What the café keeps per cup.
export function firmMargin(price, cost) {
  return price - cost;
}

// "none", "you", "rival" or "split" when both cafés leave the customer the same.
export function choice(wtp, price, rivalGain) {
  const g = wtp - price;
  if (g < -EPS) return "none";
  if (Math.abs(g - rivalGain) < EPS) return "split";
  return g > rivalGain ? "you" : "rival";
}
