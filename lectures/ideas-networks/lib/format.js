// Bulgarian number formatting for the widgets: decimal comma, euro after the
// number, a real minus sign (U+2212) instead of a hyphen.

const MINUS = "−";

function fmt(value, options) {
  return new Intl.NumberFormat("bg-BG", options).format(value).replace(/-/g, MINUS);
}

// pct(0.2) -> "20,0%"; pct(0.0625, {max: 2, sign: true}) -> "+6,25%"
export function pct(share, { min = 1, max = 1, sign = false } = {}) {
  return fmt(share, {
    style: "percent",
    minimumFractionDigits: min,
    maximumFractionDigits: max,
    signDisplay: sign ? "exceptZero" : "auto",
  });
}

// num(81.25) -> "81,25"; num(225000000) -> "225 000 000"
export function num(value, { min = 0, max = 2, sign = false } = {}) {
  return fmt(value, {
    minimumFractionDigits: min,
    maximumFractionDigits: max,
    signDisplay: sign ? "exceptZero" : "auto",
  });
}

// eur(3.3) -> "3,30 €"
export function eur(value) {
  return fmt(value, { style: "currency", currency: "EUR" });
}
