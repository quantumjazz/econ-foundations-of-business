#!/usr/bin/env python3
"""Fetch Eurostat business-demography indicators for the entrepreneurship deck.

Run once; the CSV it writes is committed, so rendering the deck never calls
an API:

    python3 scripts/fetch_eurostat.py

Output: lectures/entrepreneurship/data/eurostat_bd.csv (long format, one row
per indicator × country × year).

Sources (Eurostat dissemination API, JSON-stat):
  * bd_9bd_sz_cl_r2 — Business demography by size class and NACE Rev. 2
    activity (2004–2020). Activity: B-N_X_K642, business economy except
    activities of holding companies.
  * bd_size — its successor, from reference year 2021 under the EBS
    regulation. Activity: B-S_X_O_S94, industry, construction and market
    services. The activity coverage differs, so there is a series break
    between 2020 and 2021: charts that span it must mark it.

Countries: BG and EU27_2020. Size class: total.

Indicators kept (old code / new code):
  survival_5y  V97045 / ENT_SRVLR_BRTH_PC (age Y5)   5-year survival rate, %
  survival_3y  V97043 / ENT_SRVLR_BRTH_PC (age Y3)   3-year survival rate, %
  birth_rate   V97020 / ENT_BRTHR_PC                 births / active enterprises, %
  death_rate   V97030 / ENT_DTHR_PC                  deaths / active enterprises, %
  churn        V97015 / ENT_BRTHR_DTHR_PC            birth rate + death rate, %
"""

import csv
import json
import sys
import urllib.parse
import urllib.request
from pathlib import Path

API = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/"
GEOS = ["BG", "EU27_2020"]
OUT = Path(__file__).resolve().parent.parent / "lectures" / "entrepreneurship" / "data" / "eurostat_bd.csv"

OLD = {
    "dataset": "bd_9bd_sz_cl_r2",
    "nace_r2": "B-N_X_K642",
    "indicator_dim": "indic_sb",
    "indicators": {
        "V97045": "survival_5y",
        "V97043": "survival_3y",
        "V97020": "birth_rate",
        "V97030": "death_rate",
        "V97015": "churn",
    },
}

NEW = {
    "dataset": "bd_size",
    "nace_r2": "B-S_X_O_S94",
    "indicator_dim": "indic_sbs",
    # (code, age) -> indicator
    "indicators": {
        ("ENT_SRVLR_BRTH_PC", "Y5"): "survival_5y",
        ("ENT_SRVLR_BRTH_PC", "Y3"): "survival_3y",
        ("ENT_BRTHR_PC", "TOTAL"): "birth_rate",
        ("ENT_DTHR_PC", "TOTAL"): "death_rate",
        ("ENT_BRTHR_DTHR_PC", "TOTAL"): "churn",
    },
}


def fetch(dataset, params):
    query = urllib.parse.urlencode(dict(params, format="JSON", lang="en"), doseq=True)
    url = f"{API}{dataset}?{query}"
    req = urllib.request.Request(url, headers={"User-Agent": "econ-foundations-deck/1.0"})
    with urllib.request.urlopen(req, timeout=90) as resp:
        data = json.load(resp)
    if "error" in data:
        sys.exit(f"Eurostat error for {dataset}: {data['error']}")
    return data


def rows_from_jsonstat(data):
    """Yield ({dim: code}, value, flag) for every observation."""
    dims = data["id"]
    sizes = data["size"]
    codes = []
    for dim in dims:
        index = data["dimension"][dim]["category"]["index"]
        codes.append([c for c, _ in sorted(index.items(), key=lambda kv: kv[1])])
    status = data.get("status", {})
    for key, value in data.get("value", {}).items():
        flat = int(key)
        coords = []
        for size in reversed(sizes):
            coords.append(flat % size)
            flat //= size
        coords.reverse()
        yield {dim: codes[i][coords[i]] for i, dim in enumerate(dims)}, value, status.get(key, "")


def collect():
    out = []
    old = fetch(OLD["dataset"], {
        "geo": GEOS, "sizeclas": "TOTAL", "nace_r2": OLD["nace_r2"],
        OLD["indicator_dim"]: list(OLD["indicators"]),
    })
    for dims, value, flag in rows_from_jsonstat(old):
        out.append({
            "indicator": OLD["indicators"][dims[OLD["indicator_dim"]]],
            "geo": dims["geo"],
            "year": int(dims["time"]),
            "value": value,
            "flag": flag,
            "dataset": OLD["dataset"],
            "nace_r2": OLD["nace_r2"],
            "code": dims[OLD["indicator_dim"]],
            "series": "2004-2020",
        })
    new = fetch(NEW["dataset"], {
        "geo": GEOS, "sizeclas": "TOTAL", "nace_r2": NEW["nace_r2"],
        NEW["indicator_dim"]: sorted({code for code, _ in NEW["indicators"]}),
    })
    for dims, value, flag in rows_from_jsonstat(new):
        key = (dims[NEW["indicator_dim"]], dims.get("age", "TOTAL"))
        if key not in NEW["indicators"]:
            continue
        year = int(dims["time"])
        if year < 2021:
            continue  # the old dataset is the reference up to 2020
        out.append({
            "indicator": NEW["indicators"][key],
            "geo": dims["geo"],
            "year": year,
            "value": value,
            "flag": flag,
            "dataset": NEW["dataset"],
            "nace_r2": NEW["nace_r2"],
            "code": f"{key[0]}:{key[1]}",
            "series": "2021+",
        })
    out.sort(key=lambda r: (r["indicator"], r["geo"], r["year"]))
    return out


def sanity_check(rows):
    churn = [r["value"] for r in rows
             if r["indicator"] == "churn" and r["geo"] == "BG" and 2009 <= r["year"] <= 2020]
    if churn:
        print(f"check: BG business churn 2009–2020 ranges {min(churn):.1f}–{max(churn):.1f}% "
              "(brief expects roughly 19–25%)")
    latest = {}
    for r in rows:
        if r["indicator"] == "survival_5y":
            latest.setdefault(r["geo"], []).append(r["year"])
    common = set.intersection(*(set(v) for v in latest.values())) if len(latest) == len(GEOS) else set()
    if common:
        year = max(common)
        vals = {r["geo"]: r["value"] for r in rows
                if r["indicator"] == "survival_5y" and r["year"] == year}
        print(f"check: 5-year survival, latest common year {year}: "
              + ", ".join(f"{g} {v:.1f}%" for g, v in sorted(vals.items())))


def main():
    rows = collect()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    print(f"wrote {len(rows)} rows to {OUT.relative_to(OUT.parents[3])}")
    sanity_check(rows)


if __name__ == "__main__":
    main()
