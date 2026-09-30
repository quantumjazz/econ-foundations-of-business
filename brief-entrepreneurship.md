# Claude Code brief: Entrepreneurship lecture deck

As of 2026-09-30 · Victor

**For Claude Code.** This file is the source of truth for the build. Work in this order:

1. Scaffold the repo, theme and profiles (Build requirements).
2. Build slides 1–35 (the three Slide outline sections).
3. Build the interactives and pass every test case (Interactive specs).
4. Build the companion app (Companion app section).
5. Set up CI, then run the acceptance checks.

Open items at the end are decisions only Victor can make. If any is still unticked when you reach it, ask instead of guessing.

## Context and goals

Build a 90-minute Quarto reveal.js deck in Bulgarian that replaces the current 29-slide lecture „Предприемачество: динамика, продуктивност и бариери за навлизане на пазарите“ for the course „Икономически основи на бизнеса“ (NBU), plus a small companion app for the live activities. Publish the deck on GitHub Pages.

- **Audience and setting:** business students, taught mostly in distance-learning format. The deck is shared live on a video call and read afterwards on laptops and phones.
- **Narrative:** the lecture is told from the entrepreneur's seat, one question per block. Every slide must serve its block's question.
- **Source of truth:** this brief. The old PDF deck is reference only; keep nothing from it that this brief does not keep.

The eight blocks, in order:

- **Block 0** · Кукичка: „€20 на тротоара“
- **Block 1** · Кой е предприемачът?
- **Block 2** · Къде отива талантът?
- **Block 3** · Струва ли си да влезеш?
- **Block 4** · В кой пазар влизаш?
- **Block 5** · Какво ще направят заварените играчи?
- **Block 6** · Как новите все пак влизат?
- **Block 7** · Защо това е важно за икономиката?

What changes against the old deck:

- Market definition shrinks from nine slides to six and moves after the entrepreneurship blocks.
- The residual-demand formula leaves market definition. The idea returns in Block 5 as an interactive: the demand left over for a newcomer once the incumbent has committed its capacity.
- The rationality/transitivity slide is cut.
- Blocks 6 and 7 are new: how entrants get in, and why entry matters for productivity.
- Two live activities are added: a Baumol sorting exercise and the Camerer & Lovallo market-entry game.

Deliverables:

1. A Quarto project set up as a course site, with this lecture as its first deck, built in two profiles (public and instructor).
2. Two in-deck interactives in Observable JS: a critical-loss calculator and a leftover-demand slider. A coin-flip mini-simulation is optional.
3. A companion web app for live polls and the market-entry game, built in the stack of Victor's existing classroom apps.
4. A GitHub Actions workflow that publishes the public build to GitHub Pages.

## Build requirements

Quarto reveal.js in Bulgarian, interactives in Observable JS with no server, two build profiles, and a manual GitHub Actions deploy of the public build.

**Repository layout.** Set it up as a course site so later lectures slot in:

```
econ-foundations/
├── _quarto.yml              # course site, lang: bg, shared options
├── _quarto-public.yml       # profile: no speaker notes
├── _quarto-instructor.yml   # profile: everything
├── index.qmd                # landing page listing the decks
├── theme/nbu.scss           # shared reveal.js theme
├── lectures/
│   └── entrepreneurship/
│       ├── index.qmd        # this deck
│       ├── data/eurostat_bd.csv
│       └── img/             # openly licensed images only
├── scripts/fetch_eurostat.py
├── CREDITS.md               # every image: source, author, licence
└── .github/workflows/publish.yml
```

**Deck options.** A starting point; adjust paths to the layout above.

```yaml
lang: bg
format:
  revealjs:
    theme: [default, ../../theme/nbu.scss]
    width: 1280
    height: 720
    slide-number: c/t
    progress: true
    hash: true
    transition: fade
    footer: "НБУ · Икономически основи на бизнеса"
execute:
  echo: false
```

**Profiles.**

- The instructor profile has everything and is what Victor presents from.
- The public profile drops speaker notes, using Quarto conditional content with `when-profile="instructor"`. Check that notes still render as speaker notes in the instructor build.
- Students must not read the game debrief before playing, so the public build is deployed only after the lecture (see CI).

**Look and colour roles.**

- Light, flat design with plenty of white space and one idea per slide. Keep on-slide text to roughly 30 words; titles are questions or claims, never topic labels.
- Use a Google Font with full Cyrillic support, such as IBM Plex Sans.
- The same colour means the same role on every slide, diagram and widget:
  - предприемач / нов играч: teal #0F766E
  - заварен играч: amber #B45309
  - пазар / потребители: slate #475569
  - печалба: green #15803D
  - загуба: red #B91C1C
- Never carry meaning by colour alone; every coloured state also has a text label.
- Bulgarian typography throughout: quotes „…“, decimal comma (28,8%), euro after the number (3,00 €). In OJS, format every number with `Intl.NumberFormat('bg-BG')`.
- Every image gets Bulgarian alt text.

**Interactives.**

- Use OJS cells only (`{ojs}`, `Inputs.range`, Observable Plot), so everything runs in the browser on GitHub Pages.
- Each widget must work at phone width (390 px).
- Each widget carries one line of static text that states its takeaway, for print and PDF.

**Diagrams.**

- Game trees and the fuel-chain diagram are hand-authored inline SVG in the colour roles above.
- Backward-induction steps use reveal.js fragments. If fragments on SVG groups misbehave, use a short run of auto-animate slides instead.

**Images and licensing.**

- No film stills, press photos or textbook scans; the site is public. Use openly licensed photos (Wikimedia Commons, Unsplash, Pexels) or simple original SVG illustrations.
- Log every image in CREDITS.md with its source URL, author and licence. The film references from the old deck survive only in speaker notes.

**Data.**

- `scripts/fetch_eurostat.py` runs once and writes `data/eurostat_bd.csv`, which is committed. The deck reads it with OJS `FileAttachment`, so the build never calls an API.
- Source: Eurostat business demography. Use `bd_9bd_sz_cl_r2` for 2004–2020, plus its successor dataset from reference year 2021; look up that code in the Eurostat catalogue.
- Coverage of activities changes in 2021, so mark the break on any line chart that spans it.
- Indicator: the 5-year survival rate (the "Survival rate 5" code in the V970xx family; V97043 is the 3-year rate). Optionally add the birth rate (V97020) and death rate (V97030).
- Geography: BG and EU27, total business economy, all size classes.
- Sanity check: in [tin00142](https://db.nomics.world/Eurostat/tin00142?tab=table), Bulgaria's business churn (birth rate plus death rate) runs between about 19% and 25% over 2009–2020.

**CI.**

- `publish.yml` uses the official quarto-actions to render with `--profile public` and deploy to the `gh-pages` branch.
- Trigger it manually only (`workflow_dispatch`); Victor runs it after each lecture.

**Acceptance checks before handing back:**

- [ ] Both profiles render with no warnings.
- [ ] Every slide fits 1280×720 without scrolling.
- [ ] Every interactive passes its test cases in the Interactive specs section.
- [ ] Every image has a CREDITS.md entry.
- [ ] The deck is usable at 390 px width.

## Timing plan

The plan fills exactly 90 minutes. Five optional slides give back about 10 minutes if the game or the discussions run long.

| Block | Minutes into the lecture | Duration | Slides |
| --- | --- | --- | --- |
| 0 · Кукичка | 0–5 | 5 min | 1–4 |
| 1 · Кой е предприемачът? | 5–10 | 5 min | 5–6 |
| 2 · Къде отива талантът? | 10–20 | 10 min | 7–9 |
| 3 · Струва ли си да влезеш? (game) | 20–45 | 25 min | 10–16 |
| 4 · В кой пазар влизаш? | 45–60 | 15 min | 17–22 |
| 5 · Какво ще направят заварените играчи? | 60–78 | 18 min | 23–30 |
| 6 · Как новите все пак влизат? | 78–83 | 5 min | 31–32 |
| 7 · Защо това е важно за икономиката? | 83–90 | 7 min | 33–34 |

Slide 35 (sources) is untimed. The game takes about 17 of Block 3's 25 minutes: rules 3, six rounds 5, quiz 4, reveal and debrief 5. When time is short, cut in this order:

| Optional slide | Slide | Saves |
| --- | --- | --- |
| Types poll | 6 | 2 min |
| Coin-flip simulation | 15 | 1 min |
| How many firms (Bresnahan & Reiss) | 25 | 3 min |
| Reputation, 20 towns | 28 | 2 min |
| Strategy compass | 32 | 2 min |

## Slide outline: Blocks 0–3

Slides 1–16 fill the first 45 minutes. Bulgarian on-slide text is final wording. Notes are points for Claude Code to write up as Bulgarian speaker notes, which appear in the instructor profile only.

### Block 0 · Кукичка: „€20 на тротоара“ (slides 1–4, 5 min)

**1 · Заглавен слайд**

- Slide: „Предприемачество: динамика, продуктивност и бариери за навлизане на пазарите“, subtitle „Икономически основи на бизнеса · НБУ“, lecturer name.
- Visual: a cat sitting beside a sausage on the pavement, ignoring it. Use an openly licensed photo or a simple original illustration.
- Notes: point at the cat — an opportunity lying on the ground that nobody picks up. The explanation comes on the next slide.

**2 · „€20 на тротоара“**

- Slide: Студент: „Вижте, 20 евро на тротоара!“ Икономист: „Невъзможно. Ако бяха истински, някой вече щеше да ги е вдигнал.“ Punchline, large: „Предприемачът е този, който ги вдига.“
- Visual: a stylised €20 icon, not a banknote reproduction.
- Notes: this is Kirzner's point (slide 5): opportunities exist because most people don't notice them.

**3 · „Колко оцеляват?“ (анкета)**

- Slide: „От 100 нови фирми в България колко са живи след пет години?“, plus a QR code and short link to the companion app. Students join once for the whole lecture.
- Interaction: poll P1, a number from 0 to 100, with a live histogram and median.
- Notes: don't reveal the answer. It comes on slide 14, after the game.

**4 · Пътят на лекцията**

- Slide: the seven block questions (Blocks 1–7) as a vertical path.
- Reuse: this slide returns as the divider before each block, with the current block highlighted and past blocks dimmed.

### Block 1 · Кой е предприемачът? (slides 5–6, 5 min)

**5 · „Три портрета на предприемача“**

- Slide: three cards.
  - Шумпетер · иноваторът: нови комбинации, които изместват старите („съзидателно разрушение“).
  - Кирцнер · откривателят: вижда възможности, които другите пропускат.
  - Найт · носителят на несигурност: печалбата е награда за риск, който не може да се застрахова.
- Footnote: the Baumol, Litan & Schramm (2007) definition from the old deck, in one line.
- Visual: one simple icon per card; Kirzner's card reuses the cat.
- Notes: Schumpeter breaks equilibrium, Kirzner restores it by arbitrage, Knight explains why profit survives competition. Ask which of the three a Bolt driver is.

**6 · „Какъв тип е всеки?“ (optional)**

- Slide: four people — шофьор в Bolt вечер след работа; служител в банка, който създава нов продукт; франчайз на верига кафенета; основател на стартъп.
- Three contrasts: по възможност / по необходимост; предприемач / интрапреньор; иновация / копиране.
- Interaction: oral or chat, no app poll.
- Notes: condenses old slide 17. This is the first slide to cut when time is short.

### Block 2 · Къде отива талантът? (slides 7–9, 10 min)

**7 · „Три вида предприемачество“**

| Вид | Какво прави | Пример |
| --- | --- | --- |
| Продуктивно | създава стойност | нов продукт, по-евтин процес |
| Непродуктивно | преразпределя стойност | лобиране, заобикаляне на правила |
| Разрушително | унищожава стойност, често незаконно | измами, изнудване |

- Slide: the table above; below it, large: „Талантът е горе-долу постоянен. Правилата решават къде отива.“ (Baumol 1990)
- Notes: productive entrepreneurs grow the pie, unproductive ones fight over slices, destructive ones grab. Replaces old slides 13–16.

**8 · „Имперски Китай“**

- Slide: „В имперски Китай най-способните не отиват в бизнеса, а на изпитите за държавни чиновници.“ Question below: „Къде отиват най-способните у нас днес?“
- Visual: a public-domain painting of the imperial examinations from Wikimedia Commons.
- Notes: collect answers in chat. Baumol's cases:
  - In Rome, wealth came from land, lending and office.
  - In China, it came from the exams and office, while private wealth was insecure.
  - Medieval knights were destructive entrepreneurs (war, ransom).

**9 · „Продуктивно, непродуктивно или разрушително?“ (live sorting)**

- Slide: eight cards; students vote П / Н / Р on each (poll P2).
  1. Софтуерна компания, създадена в София и продадена на глобален купувач (Telerik)
  2. Фирма, която печели почти всяка обществена поръчка в своята община
  3. Консултант, който „оптимизира“ проекти по европейски програми
  4. Телефонни измамници, които звънят на пенсионери
  5. Браншова организация, която лобира за нов лиценз за дейността
  6. Данъчен консултант, който помага на фирми законно да плащат по-малко данъци
  7. Приложение, което сравнява цените в супермаркетите
  8. Фирма, която купува патенти само за да съди производители
- Results: stacked bars per case; discuss the two most split cases.
- Notes: there is deliberately no answer key.
  - Anchors: 1 and 7 are productive, 4 is destructive.
  - Grey zones: 2 depends on how it wins; 3 is absorbing funds or capturing them; 5 is a quality standard or a barrier to entry; 6 is legal, yet Baumol counts helping others avoid tax as unproductive; 8 is enforcing patents or trolling.
  - Case 5 returns in Block 5 as a barrier to entry.

### Block 3 · Струва ли си да влезеш? (slides 10–16, 25 min)

**10 · „Защо не си богат?“**

- Slide: the question alone, very large.
- Notes: one-word answers in chat (idea, capital, risk, luck, time), then „Нека проверим едно от тях с игра.“

**11 · „Игра: пазар за C победители“**

- Slide, the rules:
  - Всеки рунд пазарът има място за C фирми; C се сменя.
  - Решаваш: влизам или не влизам, и прогнозираш колко ще влязат.
  - Не влизаш → 0 точки.
  - Влезлите се класират. Първите C си делят наградния фонд, повече за по-високо място. Всички останали влезли губят по 10 точки.
  - Рундове 1–3: класиране по жребий. Рундове 4–6: класиране по кратък тест, който решаваш след рундовете.
- Also on slide: QR code and link to the app.
- Notes: run it as the Companion app section specifies: about 12 minutes including the quiz, then 5 for the reveal and debrief (slides 12–13). Don't mention overconfidence yet.

**12 · „Резултати“**

- Slide: the app's results view, embedded in an iframe if the app allows framing, otherwise a button that opens it.
- Shown per round:
  - entrants against C and the break-even line
  - average industry profit in lottery rounds and in skill rounds
  - average forecast against actual entrants
- Public build: a static PNG of the latest class results, exported from the app.

**13 · „Видяхте тълпата — и влязохте“**

- Slide:
  - Когато решава умението, влизат повече и губят повече.
  - Ако прогнозите ви са били точни, проблемът не е в координацията, а в увереността за собственото място.
  - В оригиналния експеримент: средна печалба на бранша около +17 $ на рунд при жребий и около −1,6 $ при умения.
- Notes:
  - Camerer & Lovallo (1999): with random ranks, industry profit was positive in 77% of rounds; with skill ranks, in only 40%, and negative in 42% ([summary](https://innovationgrowthlab.org/submit-trial?dbid=597)).
  - The mechanism is reference-group neglect: every entrant thinks they are good and forgets that the others think so too. Sessions recruited on skill entered even more.
  - Field evidence: Cooper, Woo & Dunkelberg (1988), as reported by Kahneman (2011). 81% of new owners put their own odds at 7 in 10 or better, and a third saw no chance of failure.
  - If the class result doesn't replicate, say so; replications are mixed (Danková & Servátka 2019).

**14 · „Колко оцеляват?“**

- Slide: a chart of the 5-year survival rate, BG vs EU27, for the latest year available, from `data/eurostat_bd.csv`. The class median from slide 3 is drawn as a labelled line.
- Optional second panel: business churn (birth rate plus death rate), BG vs EU27.
- Notes: compare with the class guess. US benchmark: over 60% of manufacturing entrants were gone within five years and almost 80% within ten (Dunne, Roberts & Samuelson, cited by Camerer & Lovallo).

**15 · „Струва ли си финансово?“**

- Slide:
  - „Медианният предприемач печели по-малко, отколкото би печелил като нает.“ (Hamilton 2000)
  - „Но печалбите са крайно неравни: малцина печелят огромно.“ Shown as a schematic skewed curve labelled „схематично“.
  - „Оцелелите: 225 млн. души хвърлят монета. След 20 рунда около 215 са познали всеки път — и пишат книги за метода си.“ (Buffett 1984)
- Interaction (optional): the coin-flip mini-simulation from the Interactive specs.
- Notes: Hamilton's median gap after ten years in business is about 35%. Survivorship bias means we study the winners and infer a strategy. Check: 225 000 000 / 2^20 ≈ 215.

**16 · „Кой всъщност става предприемач?“**

- Slide, four findings:
  - Семейство: децата на предприемачи по-често стават предприемачи.
  - Капитал: наследство или печалба от лотария повишават шанса да започнеш.
  - Опит: повечето основатели започват в бранша, в който вече са работили.
  - „Умни и непослушни“: успешните основатели имат по-високи резултати на тестове за способности и повече нарушени правила като тийнейджъри.
- Notes:
  - Sources: Dunn & Holtz-Eakin (2000); Holtz-Eakin, Joulfaian & Rosen (1994); Lindh & Ohlsson (1996); Bhidé (2000); Levine & Rubinstein (2017).
  - Loop back to Baumol: the same rule-bending streak builds firms or scams, depending on the rules.
  - This slide replaces old slide 21. Old slide 23 (rationality) is cut.

## Slide outline: Blocks 4–5

Slides 17–30 fill minutes 45 to 78. Market definition becomes practical here, and the entry game, commitment and the leftover-demand slider form one chain of argument.

### Block 4 · В кой пазар влизаш? (slides 17–22, 15 min)

**17 · „Къде минава границата на пазара?“**

- Slide: three columns.
  - Физическа: докъде стига стоката. Пример: електроенергия — пазарните зони и междусистемните връзки.
  - Регулаторна: какво казва законът. Пример: лицензите за таксиметров превоз в София.
  - Икономическа: какво клиентът смята за заместител.
- Subtitle: „Двете грешки на основателите: „целият пазар на храни е наш“ и „нямаме конкуренти“.“
- Notes: merges old slides 3–5. Electricity prices converge across a border when interconnectors are free and split when they are congested. Too broad a market makes every pitch look huge; too narrow hides the real competitor.

**18 · „Верига от заместители: такситата в София“ (poll P3)**

- Slide: „Кои от тях са на пазара на таксиметрови услуги в София?“ Options: Bolt · метро · тротинетка под наем · градски автобус · собствен автомобил.
- Interaction: multi-select poll with a bar chart of shares.
- Notes: keeps old slides 6–7. The chain breaks where the next product no longer restrains the price. The mid-range cars question from the old deck can be asked orally.

**19 · „Тестът на хипотетичния монополист“**

- Slide, four steps:
  1. Започни с най-тесния кандидат-пазар: капучиното в кафенетата около НБУ.
  2. Представи си един собственик на всички тях.
  3. Може ли трайно да вдигне цената с 5–10% и да спечели?
  4. Не → клиентите бягат към заместители → разшири пазара и повтори. Да → това е пазарът.
- Notes: this is the SSNIP test used by the European Commission and КЗК. It replaces the old residual-demand formula (old slide 11); the idea returns on slide 29.

**20 · „Колко клиенти можеш да загубиш?“ (interactive)**

- Slide: the critical-loss calculator from the Interactive specs. Default case: an NBU café, cappuccino 3,00 €, margin 40%, price rise 10%.
- Formula on slide: КЗ = X / (X + M).
- Notes: at a 40% margin, a 10% rise pays only if fewer than 20% of customers leave. The counter-intuitive point: the higher the margin, the fewer customers you can afford to lose, because each one costs more. It is a pricing tool, not only a regulator's test.

**21 · „Каква е цената на безплатното?“**

- Slide:
  - FTC срещу Meta (ноември 2025): FTC твърди, че пазарът е само Facebook, Instagram, Snapchat и MeWe. Съдът добавя TikTok и YouTube — и Meta не е монополист.
  - При безплатен продукт „цената“ е качеството: повече реклами, по-малко поверителност. Потребителите плащат с време.
  - Естествен експеримент: Индия забранява TikTok (2020) и времето във Facebook расте с над 60%, а в Instagram почти се удвоява.
- Question (optional poll P4): „Ако Instagram удвои рекламите, къде отиваш?“
- Notes:
  - On 18 November 2025 Judge Boasberg ran the hypothetical-monopolist test on a quality-adjusted price: could Meta load its apps with ads and keep its users? He found TikTok and YouTube close enough substitutes to make that unprofitable ([Skadden](https://www.skadden.com/insights/publications/2025/11/ftc-loses-retroactive-merger-challenge)).
  - More evidence: users paid to cut Facebook time moved mostly to YouTube, and removing all ads raised Facebook time by only 7% ([PPC Land](https://ppc.land/federal-court-dismisses-ftc-antitrust-case-against-meta/)).
  - Market shares were measured in time spent.

**22 · „Бойкотът: естествен експеримент?“**

- Slide:
  - 13 февруари 2025: оборотът на големите вериги пада с 28,8% спрямо предходния ден (27,3 → 19,4 млн. лв. по данни от фискалните устройства).
  - Въпрос: това ли е ценовата еластичност на търсенето?
  - Капан 2: цените на газа и на тока се движат заедно, но не защото са заместители — общ трети фактор.
- Notes:
  - It is not an elasticity: prices did not change. People shifted purchases by a day or moved to small shops, so it measures a one-day protest, not a lasting price response ([BTA](https://www.bta.bg/en/news/834240-finance-ministers-reports-28-8-drop-in-retail-chains-turnover-on-boycott-day)).
  - Trap 2 keeps old slide 10's example.
  - LIFO/LOFI (old slide 9) shrinks to one spoken sentence or is dropped.

### Block 5 · Какво ще направят заварените играчи? (slides 23–30, 18 min)

**23 · „Бариери за навлизане“**

- Slide, structural barriers with one example each:
  - Икономии от мащаба: електропреносната мрежа (естествен монопол).
  - Невъзвратими разходи: рафинерия, телекомуникационна мрежа.
  - Мрежови ефекти: Viber — там са всички.
  - Регулация и лицензи: такситата; лобито от слайд 9.
  - Контрол върху ключов ресурс: рафинерия, пристанищен терминал.
- Before the list, a quick true/false: „„Български пощи“ има законов монопол.“ Answer: невярно.
- Notes:
  - This fixes old slide 22. The grid is the textbook natural monopoly; Lukoil is not (next slide).
  - Bulgarian Posts lost its legal monopoly with EU postal liberalisation. The courier market (Еконт, Спиди) is the real entry story.
  - Amazon/eBay/Windows are replaced by network effects.

**24 · „Лукойл: доминиращ, но не естествен монопол“**

- Slide:
  - КЗК: „Лукойл-България“ е лидер в търговията на едро с автомобилни горива с дял между 40% и 60%.
  - Октомври 2025: санкции на САЩ. 14 ноември 2025: правителството назначава особен търговски управител.
  - Въпрос: ако собственикът трябва да излезе, по-лесно ли е навлизането? Къде са тесните места?
- Visual: an original diagram of the fuel chain.
  - Main path: внос на суров петрол → пристанищен терминал → рафинерия → складове → търговия на едро → бензиностанции.
  - A parallel import path for finished fuels.
  - Bottlenecks highlighted in amber.
- Notes:
  - This is the modern version of old slide 29 (holding suppliers, vertical integration).
  - Lukoil holds 89.97% of the refinery through LITASCO, plus the Lukoil Bulgaria wholesale and retail business ([BTA](https://www.bta.bg/en/news/bulgaria/1003664-ruling-parties-table-bill-expanding-powers-of-special-administrator-in-lukoil-bu)).
  - Check the status on the day. In May 2026 the US licence for transactions with Lukoil's Bulgarian companies ran to 29 October 2026, and the sale of Lukoil's international assets to Carlyle still needed approval ([BTA](https://www.bta.bg/en/news/1127828-bulgaria-has-historic-opportunity-to-re-acquire-lukoil-neftohim-refinery-spec)).

**25 · „Колко фирми стигат за конкуренция?“ (optional, poll P5)**

- Slide, poll first: „Колко аптеки трябват на един малък град, за да паднат цените?“ Options: 1 / 2 / 3 / 5+.
- Then reveal: most of the change comes with the second and third firm, and later entrants change little (Bresnahan & Reiss 1991).
- Visual: a schematic curve with no invented numbers, labelled „схематично“.
- Notes: carries old slide 25's point — more players mean smaller shares and a harder time avoiding open conflict. The Godfather's five-families meeting survives only as a spoken reference.

**26 · „Играта на навлизане“**

- Slide, poll first (P6): „Вие сте заварен играч. Новият вече е влязъл. Бориш ли се или допускаш?“
- Then the game tree from the Interactive specs, solved with fragments:
  1. The incumbent compares 2 with 6 and accommodates.
  2. The entrant compares 0 with 5 and enters.
  3. „Заплахата е празна.“
- Notes: one sentence replaces the rationality slide: each player picks the best option at the point where it moves. Compare with the poll; people often answer "fight" out of spite, which is why reputations can work (slide 28).

**27 · „Машината на Страшния съд“**

- Slide: the commitment tree from the Interactive specs. Before the entrant moves, the incumbent can build extra capacity at a cost of 3. Fragments:
  1. With capacity, fighting beats accommodating (5 > 3), so the threat is credible.
  2. The entrant stays out (0 > −1).
  3. The incumbent earns 7 instead of 6, so it builds.
  4. Secret capacity: the entrant enters, the incumbent fights and gets 5, less than with no capacity at all.
- Punchline: „Ангажиментът работи само ако е видим и необратим.“
- Notes: Dr. Strangelove's own punchline is the lesson — a doomsday machine is useless if you keep it secret. The film stays a spoken reference with no still. This keeps old slide 26 and makes it quantitative.

**28 · „Репутация: 20 града, 20 предприемачи“ (optional)**

- Slide: a chain store faces a new entrant in each of 20 towns. Backward induction says accommodate in town 20, therefore in 19, and so on everywhere. Real incumbents fight early. Why?
- Notes: Selten's chain-store paradox (1978). If entrants are unsure whether the incumbent is "rational", fighting early builds a reputation that deters later entrants (Kreps & Wilson 1982; Milgrom & Roberts 1982).

**29 · „Какво остава за новия играч?“ (interactive)**

- Slide: the leftover-demand slider from the Interactive specs, captioned „Остатъчно търсене = пазарно търсене минус продукцията на заварения играч.“
- Notes:
  - This is where the residual-demand idea now lives.
  - At monopoly output 40 (price 60), entry pays. Blocking it takes output 50 (price 50).
  - Deterrence costs the incumbent 100 in profit, still beats sharing the market (1500 against 800), and lowers the price though nobody entered.
  - It works only because the capacity is committed (slide 27).

**30 · „Заключване на клиентите“**

- Slide, four examples:
  - Договори за 24 месеца — и преносимостта на номера, с която регулаторът сваля бариерата.
  - Приложения за лоялност на веригите.
  - Viber: оставаш, защото всички са там.
  - Google плаща, за да е търсачката по подразбиране (САЩ срещу Google, 2024).
- Interaction (optional poll P7): a one-minute switching-cost audit. For changing phone (iOS↔Android), bank and mobile operator, what would cost you most: пари / време / данни / приятели?
- Notes: modernises old slides 27–28 (loyalty programmes, long contracts, brand). The Apple image from the old deck becomes the ecosystem question in the audit.

## Slide outline: Blocks 6–7

Slides 31–34 fill the last 12 minutes and turn the lecture from the incumbent's defence to the entrant's options and the economy-wide stakes. Slide 35 lists sources and is not timed.

### Block 6 · Как новите все пак влизат? (slides 31–32, 5 min)

**31 · „Три пътя покрай бариерата“**

- Slide, three routes:
  1. Остани малък: влез толкова малък, че да не си струва да те атакуват („джудо икономика“). Пример: нискотарифните авиолинии, линия по линия.
  2. Заобиколи: TikTok не се бори с мрежата от приятели на Facebook, а предлага лента по интереси. Revolut влиза с един тесен продукт и европейски „паспорт“.
  3. Сътрудничи: лиценз, партньорство или продажба на заварения играч. Пример: Telerik, продадена на Progress (2014).
- Notes:
  - Gelman & Salop (1983): a small entrant signals that it is no threat to the incumbent's core, so accommodating is cheaper than fighting.
  - TikTok ties back to slide 21: the friend network did not protect Meta.
  - Revolut shows EU passporting of a licence lowering a regulatory barrier.
  - Telerik is also the productive example from slide 9.

**32 · „Компасът на предприемаческата стратегия“ (optional)**

- Slide: a 2×2 from Gans, Scott & Stern (2018).
  - Axes: „Конкурирай се ↔ Сътрудничи“ (with incumbents) and „Изпълнявай бързо ↔ Контролирай“.
  - Quadrants: интелектуална собственост (сътрудничи + контролирай); разрушителна иновация (конкурирай + изпълнявай); верига на стойността (сътрудничи + изпълнявай); архитектурна стратегия (конкурирай + контролирай).
- Notes: entry is not only "fight the incumbent". Ask students to place Revolut, TikTok and Telerik on the compass.

### Block 7 · Защо това е важно за икономиката? (slides 33–34, 7 min)

**33 · „Бариерите пазят непроизводителните“**

- Slide:
  - В търговията на дребно в САЩ през 90-те почти целият ръст на производителността идва от нови, по-производителни обекти, които изместват излизащите (Foster, Haltiwanger & Krizan 2006).
  - Бариерите пазят не само печалбите на заварените, а и ниската им производителност.
  - У нас: веригите изместиха кварталните магазини. Това е по-производително, но днес спорът е за пазарна мощ.
- Notes: this delivers the title's "dynamics and productivity". Aggregate productivity grows through reallocation: better firms enter, worse ones exit. Link back to slide 14 (survival and churn) and to Baumol (where talent goes).

**34 · „Изходен билет“ (poll P8, free text)**

- Slide: „През 2025 г. бюджетната комисия на парламента одобри идея за държавна верига магазини само с български продукти и надценка до 10%. (1) Би ли дисциплинирала цените? (2) На кои бариери от днешната лекция ще се натъкне?“
- Interaction: one minute of free-text answers in the app, exported to CSV.
- Notes:
  - Source: [ESM Magazine](https://www.esmmagazine.com/index.php/retail/bulgaria-plans-state-owned-supermarket-chain-284604), reporting the 2025 budget revisions (a BGN 10 million venture under the Ministry of Agriculture and Food).
  - Expected ideas: scale and logistics, store locations, supplier terms, incumbents' loyalty apps, the 10% cap against real costs, and a state entrant's own incentives.
  - The answers can double as a participation check.

**35 · „Източници“**

- Slide: a short reference list (author, year) and image credits generated from CREDITS.md. Not timed.

## Interactive specs

Two OJS widgets, two game trees, one data chart and an optional mini-simulation. Reproduce every test case below exactly before styling anything; labels are Bulgarian, numbers use the bg-BG format.

### Critical-loss calculator (slide 20)

Inputs, as `Inputs.range` sliders:

- „Повишение на цената X“: 1–20%, step 1, default 10.
- „Марж M“ (price minus unit cost, as a share of price): 5–80%, step 5, default 40.
- „Очаквана загуба на клиенти L“: 0–60%, step 1, default 15.

Outputs:

- The critical loss:

$$
CL = \frac{X}{X + M}
$$

- The profit change:

$$
\frac{\Delta \pi}{\pi} = \frac{(M + X)(1 - L)}{M} - 1
$$

- A verdict:
  - L < CL → „Повишението е изгодно“ (green)
  - L > CL → „Неизгодно: клиентите имат заместители, пазарът е по-широк“ (red)
  - L = CL → „На ръба“

Visual: one horizontal bar for L on a 0–60% axis, with a labelled vertical line at CL. The bar is green when L < CL and red otherwise, and the verdict text sits beside it. Above it, the café's price moves from 3,00 € to 3,00 × (1 + X) €.

For the notes: after a rise of X, the margin per unit, measured against the old price, becomes M + X. Profit stays unchanged when (M + X)(1 − L) = M, which gives the formula above.

| X | M | L | CL | Profit change | Verdict |
| --- | --- | --- | --- | --- | --- |
| 10% | 40% | 15% | 20,0% | +6,25% | изгодно |
| 10% | 40% | 25% | 20,0% | −6,25% | неизгодно |
| 5% | 40% | 10% | 11,1% | +1,25% | изгодно |
| 10% | 20% | 40% | 33,3% | −10,0% | неизгодно |
| 10% | 60% | 10% | 14,3% | +5,0% | изгодно |

### Leftover-demand slider (slide 29)

Fixed model, shown in a small caption:

- Market demand: P = 100 − Q.
- Both firms have marginal cost 20. The entrant also pays a fixed entry cost F = 225.
- The incumbent commits to an output `q_I` and produces it whatever happens.

Slider: „Капацитет на заварения играч“, 0–70, step 1, default 40. Buttons: „Монополно количество (40)“ and „Лимитно количество (50)“.

The entrant's leftover demand and best response:

$$
P = (100 - q_I) - q
$$

$$
q^{*} = \frac{80 - q_I}{2}, \qquad p^{*} = \frac{120 - q_I}{2}, \qquad \pi_E = \left(\frac{80 - q_I}{2}\right)^{2} - 225
$$

Rules:

- Entry happens only if the entrant's profit is strictly positive (tolerance 1e-9, so `q_I` = 50 counts as blocked).
- Market price: `p*` with entry, 100 − `q_I` without.
- Incumbent's profit: (`p*` − 20) · `q_I` with entry, (80 − `q_I`) · `q_I` without.

Rendering, one chart in the entrant's own quantity (0–80) and price (0–100):

- the leftover-demand line in teal, sliding down as `q_I` rises;
- the entrant's average cost curve, AC(q) = 20 + 225/q, for q from 3 to 80, in slate;
- the entrant's best point (`q*`, `p*`) and its profit rectangle between `p*` and AC(`q*`) over [0, `q*`], green when positive and red when negative;
- readouts: a verdict badge („Навлизането е изгодно“ in teal, „Навлизането е блокирано“ in amber), market price, entrant's best profit, incumbent's profit.

Optional second panel: the incumbent's profit against `q_I` from 0 to 70. It jumps at 50, which shows why 50 is the incumbent's best choice.

| `q_I` | Entrant's `q*` | Entrant's `p*` | Entrant's profit | Entry | Market price | Incumbent's profit |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | 40 | 60 | 1375 | yes | 60 | 0 |
| 30 | 25 | 45 | 400 | yes | 45 | 750 |
| 40 | 20 | 40 | 175 | yes | 40 | 800 |
| 45 | 17,5 | 37,5 | 81,25 | yes | 37,5 | 787,5 |
| 50 | 15 | 35 | 0 | no | 50 | 1500 |
| 60 | 10 | 30 | −125 | no | 40 | 1200 |

At `q_I` = 50 the leftover-demand line just touches the cost curve at q = 15, P = 35. Without any entry threat the incumbent would produce 40 and earn 1600.

### Game trees (slides 26–27)

Payoffs are written as (предприемач, заварен). The base game uses the numbers from old slide 24, which labels the first number as the entrant's.

- Не влиза → (0, 10).
- Влиза, заварен се бори → (−1, 2).
- Влиза, заварен допуска → (5, 6).

In the commitment version, the incumbent first decides whether to build extra capacity at a cost of 3.

- The capacity is already paid for, so using it to fight is cheap; left idle, it is a pure cost.
- With capacity, the incumbent's payoffs are 7 (не влиза), 5 (бори се) and 3 (допуска). The entrant's payoffs do not change.

The full tree; ✓ marks the move chosen at each node by backward induction. The left branch is the base game for slide 26; the whole tree is slide 27.

```
Заварен
├── без капацитет → Предприемач
│   ├── не влиза → (0, 10)
│   └── влиза ✓ → Заварен
│       ├── бори се → (−1, 2)
│       └── допуска ✓ → (5, 6)
└── капацитет (−3) ✓ → Предприемач
    ├── не влиза ✓ → (0, 7)    ← equilibrium outcome
    └── влиза → Заварен
        ├── бори се ✓ → (−1, 5)
        └── допуска → (5, 3)
```

Solutions, one fragment each:

1. No capacity: accommodate (6 > 2), so the entrant enters (5 > 0) → (5, 6).
2. Visible capacity: fight (5 > 3), so the entrant stays out (0 > −1) → (0, 7).
3. At the root, 7 > 6, so the incumbent builds.
4. Secret capacity: the entrant expects accommodation and enters, the incumbent fights → (−1, 5). That is worse for the incumbent than having no capacity at all.

Draw both trees as inline SVG: the entrant's moves in teal, the incumbent's in amber, the equilibrium path thicker, and pruned branches greyed and struck through as each fragment appears.

### Survival chart (slide 14)

- Observable Plot bars from `data/eurostat_bd.csv`: the 5-year survival rate for BG and EU27 in the latest common year, both in slate shades, values printed on the bars.
- The class median from poll P1 appears as a dashed line labelled „Вашата прогноза“; Victor types it into an input box on the slide during class.
- Source line under the chart: Eurostat, dataset code and year.

### Coin-flip mini-simulation (slide 15, optional)

- One slider, „Рунд“, from 0 to 20.
- Remaining flippers = 225 000 000 / 2^k, rounded to a whole number. Show it as a shrinking bar with the number printed.
- At k = 20 the caption reads „215 „гении“ с 20 поредни ези“.

| Round k | Remaining |
| --- | --- |
| 0 | 225 000 000 |
| 10 | 219 727 |
| 20 | 215 |

## Companion app: polls and the market-entry game

One small web app runs every live activity, so students join once on slide 3 and keep the same link all lecture.

- Build it in the stack of Victor's existing classroom apps (Python, SQLite, vanilla JS). Read one of them first, such as the Labor Auction Simulator, and mirror its structure. If none is in your workspace, ask Victor for the repository.
- Reuse Session Quiz for the skill quiz.
- Deploy it wherever those apps run, over HTTPS so the GitHub Pages deck can embed its results.

**Views.**

- Student (phone-first): join with a session code and a nickname, then answer whatever the instructor opens.
- Instructor: open and close polls and rounds, run a timer, see how many have answered (never the answers while open), reveal results, export CSV.
- Results: projectable and embeddable, one URL per poll and one for the game. Allow framing from the GitHub Pages domain.

**Polls.** Seed them from a JSON file for this lecture.

| ID | Slide | Question | Type |
| --- | --- | --- | --- |
| P1 | 3 | Колко от 100 нови фирми в България са живи след пет години? | number 0–100 → histogram and median |
| P2 | 9 | Осем случая: продуктивно / непродуктивно / разрушително | matrix → stacked bars per case |
| P3 | 18 | Кои са на пазара на таксиметрови услуги в София? | multi-select → bars |
| P4 | 21 | Ако Instagram удвои рекламите, къде отиваш? (optional) | single: TikTok / YouTube / друго / оставам |
| P5 | 25 | Колко аптеки трябват на малък град, за да паднат цените? (optional) | single: 1 / 2 / 3 / 5+ |
| P6 | 26 | Новият е влязъл. Бориш ли се или допускаш? | single choice |
| P7 | 30 | Кое би ти струвало най-много: смяна на телефон, банка, оператор? (optional) | matrix: пари / време / данни / приятели |
| P8 | 34 | Изходен билет (два въпроса) | free text → CSV only |

**Game setup.** When the instructor presses Start:

- N = the players joined at that moment. N is then frozen for the game.
- Loss for entrants ranked below capacity: L = 10.
- Prize pool: P = 50 when N ≤ 24, otherwise P = 10 × round(N / 4).
- Break-even number of entrants: E* = C + P / L.
- Capacities: C = round(0.15 N), round(0.25 N) and round(0.35 N), each at least 1, in a shuffled order within each rank type. For N = 20 that gives C = 3, 5, 7 and E* = 8, 10, 12.

**Game sequence.** Each round lasts 45 seconds.

1. Rules (slide 11), then rounds 1–3 with lottery ranks.
2. Announce that ranks in rounds 4–6 depend on a short quiz taken after the decisions, then play rounds 4–6.
3. In each round the student taps „Влизам“ or „Не влизам“ and forecasts the number of entrants (0 to N). No answer counts as staying out.
4. The quiz: six questions, three minutes, in Session Quiz, whose tab-switch swap keeps it honest. Ties are broken at random, and entrants who skip the quiz rank last.
5. Reveal: payoffs for all rounds, the results view, and each student's own total on their phone.

**Payoffs per round.**

- Staying out pays 0.
- Entrants are ranked by lottery or by quiz score. The top C split P by linear weights C, C−1, …, 1; with C = 4 and P = 50 that is 20, 15, 10, 5.
- Every entrant ranked below C loses L.
- If fewer than C enter, the entrants receive the shares of ranks 1 to E from the C-split.
- Industry profit is the sum of all entrants' payoffs.

Test cases for N = 20, P = 50, L = 10:

| C | Entrants E | Paid ranks 1 to C | Losers | Industry profit |
| --- | --- | --- | --- | --- |
| 4 | 4 | 20; 15; 10; 5 | none | 50 |
| 5 | 8 | 16,67; 13,33; 10; 6,67; 3,33 | 3 × −10 | 20 |
| 5 | 10 | 16,67; 13,33; 10; 6,67; 3,33 | 5 × −10 | 0 |
| 5 | 3 | 16,67; 13,33; 10 | none | 40 |
| 3 | 12 | 25; 16,67; 8,33 | 9 × −10 | −40 |

**Results view (slide 12).**

- One bar per round showing entrants E, with C and E* marked on it. Lottery rounds and skill rounds sit side by side.
- Below the bars, the average industry profit for lottery rounds and for skill rounds as two large numbers, plus the mean forecast against actual entrants.
- Exports: a CSV of all decisions with nicknames hashed, and a PNG of this view for the public deck.

**Skill quiz.** Three logic items with changed numbers, so memorised answers don't help, and three course items.

1. „Кафе и кроасан струват общо 3,30 €. Кафето е с 3,00 € по-скъпо от кроасана. Колко струва кроасанът?“ → 0,15 €
2. „8 машини правят 8 детайла за 8 минути. За колко минути 80 машини ще направят 80 детайла?“ → 8
3. „Водни лилии удвояват площта си всеки ден и покриват езерото за 40 дни. За колко дни покриват половината?“ → 39
4. „Цената се повишава с 10%, а продажбите падат с 5%. Търсенето е: а) еластично; б) нееластично; в) с единична еластичност.“ → б
5. „Кое е невъзвратим разход? а) наемът за следващия месец, още неподписан; б) рекламата, платена миналата година; в) суровините на склад, които могат да се продадат.“ → б
6. „При съвършена конкуренция в дългосрочен план икономическата печалба е: а) положителна; б) нула; в) отрицателна.“ → б

**Privacy and stakes.**

- Nicknames only, no faculty numbers.
- Data stays on Victor's server and is deleted after the course.
- Points carry no grade by default; see the open items.

## Glossary, open items and sources

Use these Bulgarian terms consistently across slides, notes and the app.

| Български термин | English | Where |
| --- | --- | --- |
| заварен играч | incumbent | throughout; never „инкумбент“ |
| нов играч / предприемач | entrant | „предприемач“ in the game trees |
| остатъчно търсене | residual (leftover) demand | slide 29 only |
| тест на хипотетичния монополист (SSNIP) | hypothetical-monopolist test | slide 19 |
| критична загуба | critical loss | slide 20 |
| ангажимент | commitment | slide 27 |
| невъзвратими разходи | sunk costs | slide 23 |
| мрежови ефекти | network effects | slides 23, 30 |
| разходи за превключване | switching costs | slide 30 |
| съзидателно разрушение | creative destruction | slide 5 |
| бдителност | alertness (Kirzner) | slide 5 |
| свръхувереност | overconfidence | slide 13 |
| пренебрегване на референтната група | reference-group neglect | slide 13 notes |
| интрапреньор | intrapreneur | slide 6 |
| особен търговски управител | special commercial administrator | slide 24 |

**Open items for Victor**

- [ ] Lecturer name and title for slide 1.
- [ ] Typical class size, to sanity-check the game's capacities.
- [ ] Whether game points count toward the seminar grade.
- [ ] Cat image for slides 1 and 5: photo or illustration.
- [ ] Before the lecture, check the Lukoil licence status (slide 24).

**Sources opened for this brief**

- [Skadden: FTC v. Meta decision summary](https://www.skadden.com/insights/publications/2025/11/ftc-loses-retroactive-merger-challenge)
- [PPC Land: evidence in FTC v. Meta](https://ppc.land/federal-court-dismisses-ftc-antitrust-case-against-meta/)
- [BTA: retail chains' turnover on boycott day](https://www.bta.bg/en/news/834240-finance-ministers-reports-28-8-drop-in-retail-chains-turnover-on-boycott-day)
- [BTA: Lukoil market share and ownership](https://www.bta.bg/en/news/bulgaria/1003664-ruling-parties-table-bill-expanding-powers-of-special-administrator-in-lukoil-bu)
- [BTA: Lukoil special administrator and US licence](https://www.bta.bg/en/news/1127828-bulgaria-has-historic-opportunity-to-re-acquire-lukoil-neftohim-refinery-spec)
- [ESM Magazine: state-owned grocery chain plan](https://www.esmmagazine.com/index.php/retail/bulgaria-plans-state-owned-supermarket-chain-284604)
- [Innovation Growth Lab: Camerer & Lovallo design and results](https://innovationgrowthlab.org/submit-trial?dbid=597)
- [DBnomics: Eurostat tin00142, business churn](https://db.nomics.world/Eurostat/tin00142?tab=table)

**Academic references for slide 35**

- Baumol, W. J. (1990). Entrepreneurship: Productive, Unproductive, and Destructive. *Journal of Political Economy*.
- Baumol, W. J., Litan, R. E. & Schramm, C. J. (2007). *Good Capitalism, Bad Capitalism*. Yale University Press.
- Bhidé, A. (2000). *The Origin and Evolution of New Businesses*. Oxford University Press.
- Bresnahan, T. & Reiss, P. (1991). Entry and Competition in Concentrated Markets. *Journal of Political Economy*.
- Buffett, W. (1984). The Superinvestors of Graham-and-Doddsville. *Hermes*, Columbia Business School.
- Camerer, C. & Lovallo, D. (1999). Overconfidence and Excess Entry: An Experimental Approach. *American Economic Review*.
- Cooper, A., Woo, C. & Dunkelberg, W. (1988). Entrepreneurs' Perceived Chances for Success. *Journal of Business Venturing*.
- Danková, K. & Servátka, M. (2019). Gender Robustness of Overconfidence and Excess Entry. MPRA working paper.
- Dixit, A. (1980). The Role of Investment in Entry-Deterrence. *Economic Journal*.
- Dunn, T. & Holtz-Eakin, D. (2000). Financial Capital, Human Capital, and the Transition to Self-Employment. *Journal of Labor Economics*.
- Dunne, T., Roberts, M. & Samuelson, L. (1988). Patterns of Firm Entry and Exit in U.S. Manufacturing Industries. *RAND Journal of Economics*.
- Foster, L., Haltiwanger, J. & Krizan, C. J. (2006). Market Selection, Reallocation, and Restructuring in the U.S. Retail Trade Sector in the 1990s. *Review of Economics and Statistics*.
- Gans, J., Scott, E. & Stern, S. (2018). Strategy for Start-Ups. *Harvard Business Review*.
- Gelman, J. & Salop, S. (1983). Judo Economics: Capacity Limitation and Coupon Competition. *Bell Journal of Economics*.
- Hamilton, B. (2000). Does Entrepreneurship Pay? *Journal of Political Economy*.
- Holtz-Eakin, D., Joulfaian, D. & Rosen, H. (1994). Entrepreneurial Decisions and Liquidity Constraints. *RAND Journal of Economics*.
- Kahneman, D. (2011). *Thinking, Fast and Slow*.
- Kirzner, I. (1973). *Competition and Entrepreneurship*.
- Knight, F. (1921). *Risk, Uncertainty and Profit*.
- Kreps, D. & Wilson, R. (1982). Reputation and Imperfect Information. *Journal of Economic Theory*.
- Levine, R. & Rubinstein, Y. (2017). Smart and Illicit: Who Becomes an Entrepreneur and Do They Earn More? *Quarterly Journal of Economics*.
- Lindh, T. & Ohlsson, H. (1996). Self-Employment and Windfall Gains: Evidence from the Swedish Lottery. *Economic Journal*.
- Milgrom, P. & Roberts, J. (1982). Predation, Reputation, and Entry Deterrence. *Journal of Economic Theory*.
- Schumpeter, J. (1942). *Capitalism, Socialism and Democracy*.
- Selten, R. (1978). The Chain Store Paradox. *Theory and Decision*.
