# Икономически основи на бизнеса

**Economic Foundations of Business** · New Bulgarian University\
доц. д-р Виктор Аврамов · vavramov@nbu.bg

## Slides

Published on GitHub Pages: [quantumjazz.github.io/econ-foundations-of-business](https://quantumjazz.github.io/econ-foundations-of-business/)

| # | Lecture | Slides | Source |
|---|---------|--------|--------|
| 1 | Предприемачество: динамика, продуктивност и бариери за навлизане на пазарите | [▶ View Slides](https://quantumjazz.github.io/econ-foundations-of-business/lectures/entrepreneurship/) | [index.qmd](lectures/entrepreneurship/index.qmd) |

Each deck appears here after it has been given in class. In the slides: arrow
keys or space to move, `F` full screen, `O` overview, `M` menu. On a phone,
scroll down.

The slides are Quarto reveal.js decks in Bulgarian. The build brief for
lecture 1 is [brief-entrepreneurship.md](brief-entrepreneurship.md).

## Present a lecture

```bash
quarto preview lectures/entrepreneurship/index.qmd --profile instructor
```

Present from the preview server (http://localhost:…), not from a file://
page: the interactive slides load their data and code over HTTP. The polls
and the market-entry game are run outside the deck (chat or any classroom
tool).

Keys: arrows to move, `F` full screen, `O` overview, `M` menu.

## Publish after the lecture

1. Save an image of the class's game results as
   `lectures/entrepreneurship/img/game-results.png` (it replaces the
   placeholder on slide 12).
2. Commit and push.
3. On GitHub: **Actions → Publish the public slides → Run workflow**. It runs
   the widget tests, renders `--profile public`, checks that no speaker notes
   leaked, and pushes `_site/` to the `gh-pages` branch.

First time only, before using the workflow: run `quarto publish gh-pages` once
from this folder. It renders the public build, pushes it to a new `gh-pages`
branch and writes `_publish.yml`, which the workflow needs: commit and push
that file. GitHub then serves the site from `gh-pages` on its own (for a
project site nothing needs setting under Settings → Pages; if Pages was already
set to another source, switch it to **Deploy from a branch → gh-pages / root**).

## Build profiles

| Profile | Command | Output |
|---|---|---|
| public (default) | `quarto render --profile public` | `_site/` |
| instructor | `quarto render --profile instructor` | `_site-instructor/` |

Instructor-only content goes inside
`::: {.content-visible when-profile="instructor"}` (lecture 1 has none at
present). The two builds go to different folders, so an instructor build
cannot be published by mistake.

## Look

The decks use the same theme as *Data Driven Business Decisions*
(`styles.scss`): Inter / Segoe UI / Helvetica Neue, navy headings with a blue
rule, blue highlight boxes, dark table headers, footer „Курс | НБУ“. The
course additions live in [theme/nbu.scss](theme/nbu.scss).

Inside diagrams and widgets, colours carry fixed roles, always with a text
label: предприемач / нов играч teal, заварен играч amber, пазар slate,
печалба green, загуба red.

On phones (below 435 px) the deck switches to a vertical reading mode with a
portrait canvas ([theme/deck.html](theme/deck.html)).

## Repository layout

```
_quarto.yml               course site, shared deck options, lang: bg
_quarto-public.yml        public profile  → _site/
_quarto-instructor.yml    instructor profile → _site-instructor/
index.qmd                 landing page listing the decks
theme/                    nbu.scss (deck theme), site.scss, title-slide.html,
                          lecture.lua (lecture path, dividers, credits),
                          deck.html (phone reading mode)
lectures/entrepreneurship/
  index.qmd               lecture 1
  data/eurostat_bd.csv    Eurostat business demography (committed)
  img/                    original illustrations and public-domain images
  lib/                    models.js and format.js behind the widgets
scripts/                  fetch_eurostat.py
tests/models_test.ts      the brief's widget test cases
CREDITS.md                every image: source, author, licence
.github/workflows/        publish.yml (manual)
```

## Maintenance

```bash
# refresh the Eurostat data (writes lectures/entrepreneurship/data/eurostat_bd.csv)
python3 scripts/fetch_eurostat.py

# widget tests (60 checks from the brief)
quarto run tests/models_test.ts
```

Before each run of lecture 1: check the Lukoil licence and special
administrator status (slide 24).
