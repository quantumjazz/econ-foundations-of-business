// Test cases from the brief's "Interactive specs" section, run against the
// same modules the deck imports. No network, no dependencies:
//
//   quarto run tests/models_test.ts

import {
  criticalLoss,
  entrantAverageCost,
  entryOutcome,
  flippersLeft,
  lossVerdict,
  profitChange,
} from "../lectures/entrepreneurship/lib/models.js";
import { eur, num, pct } from "../lectures/entrepreneurship/lib/format.js";

let passed = 0;
let failed = 0;

// Intl uses no-break spaces as the bg-BG group separator; the brief uses plain spaces.
const plain = (s: string) => s.replace(/[  ]/g, " ");

function check(label: string, actual: unknown, expected: unknown) {
  const a = typeof actual === "string" ? plain(actual) : actual;
  if (a === expected) {
    passed++;
  } else {
    failed++;
    console.error(`FAIL ${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(a)}`);
  }
}

// --- Critical-loss calculator (slide 20) -------------------------------------
const verdictWord = { profit: "изгодно", loss: "неизгодно", edge: "на ръба" } as const;
const criticalLossCases = [
  { X: 10, M: 40, L: 15, CL: "20,0%", change: "+6,25%", verdict: "изгодно" },
  { X: 10, M: 40, L: 25, CL: "20,0%", change: "−6,25%", verdict: "неизгодно" },
  { X: 5, M: 40, L: 10, CL: "11,1%", change: "+1,25%", verdict: "изгодно" },
  { X: 10, M: 20, L: 40, CL: "33,3%", change: "−10,0%", verdict: "неизгодно" },
  { X: 10, M: 60, L: 10, CL: "14,3%", change: "+5,0%", verdict: "изгодно" },
];
for (const c of criticalLossCases) {
  const x = c.X / 100, m = c.M / 100, l = c.L / 100;
  const cl = criticalLoss(x, m);
  const tag = `critical loss X=${c.X} M=${c.M} L=${c.L}`;
  check(`${tag} CL`, pct(cl), c.CL);
  check(`${tag} profit change`, pct(profitChange(x, m, l), { max: 2, sign: true }), c.change);
  check(`${tag} verdict`, verdictWord[lossVerdict(l, cl)], c.verdict);
}
check("critical loss edge case X=10 M=40 L=20", lossVerdict(0.2, criticalLoss(0.1, 0.4)), "edge");
check("café price at X=10", eur(3 * 1.1), "3,30 €");
check("café price at X=0", eur(3), "3,00 €");

// --- Leftover-demand slider (slide 29) ---------------------------------------
const leftoverCases = [
  { qI: 0, q: "40", p: "60", profit: "1375", entry: true, price: "60", inc: "0" },
  { qI: 30, q: "25", p: "45", profit: "400", entry: true, price: "45", inc: "750" },
  { qI: 40, q: "20", p: "40", profit: "175", entry: true, price: "40", inc: "800" },
  { qI: 45, q: "17,5", p: "37,5", profit: "81,25", entry: true, price: "37,5", inc: "787,5" },
  { qI: 50, q: "15", p: "35", profit: "0", entry: false, price: "50", inc: "1500" },
  { qI: 60, q: "10", p: "30", profit: "−125", entry: false, price: "40", inc: "1200" },
];
for (const c of leftoverCases) {
  const o = entryOutcome(c.qI);
  const tag = `leftover qI=${c.qI}`;
  check(`${tag} q*`, num(o.q), c.q);
  check(`${tag} p*`, num(o.p), c.p);
  check(`${tag} entrant profit`, num(o.profit), c.profit);
  check(`${tag} entry`, o.entry, c.entry);
  check(`${tag} market price`, num(o.price), c.price);
  check(`${tag} incumbent profit`, num(o.incumbentProfit), c.inc);
}
// Tangency at qI = 50: leftover demand touches AC at q = 15, P = 35.
check("tangency AC(15)", entrantAverageCost(15), 35);
check("tangency leftover P at q=15", 100 - 50 - 15, 35);
// Without an entry threat the incumbent produces 40 and earns 1600.
check("monopoly profit at 40", (80 - 40) * 40, 1600);

// --- Coin-flip mini-simulation (slide 15) ------------------------------------
check("flippers k=0", num(flippersLeft(0)), "225 000 000");
check("flippers k=10", num(flippersLeft(10)), "219 727");
check("flippers k=20", num(flippersLeft(20)), "215");

console.log(`${passed} passed, ${failed} failed`);
if (failed > 0) Deno.exit(1);
