# IRON ROAD
### Game Design Specification v0.18
*A text-based WW2 tank crew survival game — European Theater, 1944–1945*

---

## 1. CONCEPT OVERVIEW

**Iron Road** is a text-based survival decision game inspired by *Oregon Trail* and the film *Fury*. Players command a five-man Sherman tank crew across a semi-procedural campaign through the European Theater. Each mission is a chapter. Each chapter is a sequence of events — travel, combat, and human moments — where decisions made by one crew member can ripple across the whole team.

The game is R-rated. It is brutal, occasionally funny, sometimes heartbreaking. It does not sanitize war.

**Tone:** Gritty realism with dark humor. Crew bonds matter. Death is permanent. Fear is a mechanic.

---

## 2. CAMPAIGN STRUCTURE

### 2.1 Missions as Chapters
A campaign is a sequence of **missions**. Each mission is a self-contained chapter with:
- A **briefing event** (narrative setup, optional item/stat grants)
- A sequence of **decision events** (travel, combat, human)
- An **end-of-mission debrief** (rest, resupply, crew replacement opportunity)

### 2.2 Difficulty
Difficulty is selected at campaign start and affects:

| Difficulty | Missions | Events per Mission | Dice Modifier |
|---|---|---|---|
| Green | 4 | 5–8 | +1 favorable |
| Veteran | 6 | 8–12 | None |
| Fury | 8 | 12–18 | –1 to –2 unfavorable |

### 2.3 Days and Turns
Each mission is divided into **days**. A day is a unit of in-mission time containing a fixed number of events (turns).

| Difficulty | Days per Mission | Events (Turns) per Day |
|---|---|---|
| Green | 2–3 | 2–3 |
| Veteran | 3–4 | 3–4 |
| Fury | 4–5 | 4–5 |

**Weather and environmental conditions are set at the start of each day** and persist for all events within that day. A new day may bring different conditions — or the same ones prolonged. The game narrates the transition between days ("Dawn. Still raining.").

**Implementation note:** Events per day are generated per-day from `eventsPerDayMin`/`eventsPerDayMax` in `DifficultyProfile`, not as a mission-wide average. This prevents 1-event days and ensures the table values above are always honoured.

**UI time-of-day (shipped v0.15):** The solo browser UI maps beat index within the day to immersion labels — Dawn → Morning → Midday → Afternoon → Dusk → Night — via `deriveDayPhase` in [`src/ui/campaignStatus.ts`](src/ui/campaignStatus.ts). This is not a wall-clock; it reflects how far through the day's encounters the crew has progressed.

### 2.7 Choice Design Rules
Every decision event must offer **3–4 choices** — never fewer than 3 unless the event is a dedicated flavour/social beat where fewer options are intentional. Requirements:

- **Role coverage** — each choice must be attributed to a role (`commander`, `gunner`, `driver`, `asst_driver`, or `loader`). No two choices in the same event should share the same role unless the event explicitly focuses a single role.
- **Modifier tiers** — within each event, choices should represent recognisable risk/reward bands:
  - *Aggressive* — highest upside outcome, highest downside risk
  - *Tactical* — moderate outcome, costs a resource or time
  - *Cautious* — safe floor outcome, lowest reward
- **Narrative coherence** — choice labels must sound like a soldier talking, not a menu option. Avoid generic labels like "Attack" or "Defend". Prefer voice ("Push inside the corridor", "Break left and find a parallel route").

### 2.8 Stakes and Table Talk
High-impact beats telegraph cost **before** the player commits. This is especially important in co-op, where disagreement is a feature.

| Field | Level | Purpose |
|---|---|---|
| `stakes` | `routine` / `elevated` / `critical` | UI emphasis; `critical` on all anchors and elites |
| `stakesNote` | string | One line before choices — hull, crew, ammo, or trust at risk |
| `choiceRisk` | aggressive / tactical / cautious / desperate | Posture band on buttons — argument fuel, not damage math |
| `riskTags` / `choiceHint` | qualitative phrases | **Pre-choice only:** relative stakes by domain (hull, crew contact, supplies, ammo). **Banned on choose UI:** `%`, `HP`, `Nerve −N`, raw resource counts, `+N` dice modifiers. Numbers belong in the **outcome aftermath** summary (§12A.4), not on choice buttons |
| `tierFlavor` | map 1–4 | Extra prose appended after dice on `useDice` events — tier 1 must read like near-disaster on `critical` beats |

**Risk domains (examples):** hull scrape → serious hull damage; crew strain → possible brutal encounter; supplies → may cost rations. Derivation: [`src/engine/riskTelegraph.ts`](src/engine/riskTelegraph.ts); immersion overrides in [`src/content/immersion.ts`](src/content/immersion.ts). Dice events may show qualitative odds ("Harder fight") without exposing the integer modifier.

**Co-op expectation:** On `critical` events, the table should talk before anyone presses a key. Author `stakesNote` as a prompt ("Gunner wants HE now; Driver wants ridgeline") and make at least two choices mechanically oppose.

Catalog immersion defaults and per-event overrides live in [`src/content/immersion.ts`](src/content/immersion.ts), applied at catalog load.

### 2.4 Seasons
The campaign tracks season automatically based on progress. Season does not need to be historically precise — it is consistent and immersive.

| Campaign Phase | Season | Environmental Character |
|---|---|---|
| Early missions | Summer / Late Summer | Heat, dust, dry roads, long days |
| Mid missions | Autumn | Mud, rain, fog, shorter days |
| Late missions | Winter | Snow, ice, frozen ground, extreme cold |
| Final mission | Late Winter / Early Spring | Thaw, mud returns, overcast |

Season affects the **environmental condition pool** available each day (see Section 6.3).

### 2.5 Historical Anchors
Each campaign includes a subset of fixed historical waypoints drawn from a pool. These are always present as named events that ground the story. Procedural events fill the gaps between them.

**Historical Anchor Pool (Western Front, 1944–45):**
- Normandy Breakout (Operation Cobra)
- Crossing the Seine
- Liberation of Paris outskirts
- The Siegfried Line
- Hürtgen Forest
- Battle of the Bulge
- Crossing the Rhine
- Push into Germany
- Fall of a named German town
- Final days (VE Day proximity)

On **Veteran** difficulty, 4–5 anchors appear per mission (drawn from the campaign anchor budget). On **Fury**, 6–7 per mission. **Each anchor ID fires at most once per campaign** (generator enforces; expand the anchor pool so Fury can still feel historical without reruns).

### 2.6 Named Elite Encounters
A pool of named high-stakes engagements that can appear as optional or forced events at anchor points. Higher risk, higher reward (ammo, parts, morale, crew quotes that persist).

Examples:
- *The Tiger at Wallendorf* — encounter with a Tiger I in a narrow village road
- *Night Ambush at the Treeline* — surprise infantry attack, low visibility
- *The Last Panzer at Cologne* — urban tank duel, building collapse hazards
- *SS Rearguard, Remagen* — bridge approach under heavy fire

### 2.9 Content scale and replay variety

A campaign should feel like a **sample** of a large library, not a reshuffle of the same forty beats. Variety is **event-count-limited**: each encounter offers 3–4 role-gated choices (§2.7), but repeating the same event ID repeats the same decision set.

**Shipped pools (Wave 18):** see [`src/content/poolKinds.ts`](src/content/poolKinds.ts) kind buckets, [`src/content/eventsCatalog.ts`](src/content/eventsCatalog.ts) `GENERIC_POOL` + `GENERIC_POOL_TIER2`, [`src/content/wave16Events.ts`](src/content/wave16Events.ts), [`src/content/wave18Events.ts`](src/content/wave18Events.ts), [`src/content/pools.ts`](src/content/pools.ts) `ANCHOR_IDS`, `SOCIAL_BEAT_POOL`; mission objectives in [`src/engine/generator.ts`](src/engine/generator.ts).

| Pool | Wave 12 | Wave 13 | Wave 16 | Wave 18 (shipped) | Long-term |
|------|--------:|--------:|--------:|------------------:|----------:|
| `GENERIC_POOL` (Tier-1 procedural fillers) | **60** | **100** | **100+** | **115+** | **100+** |
| `GENERIC_POOL_TIER2` (second-pass fillers) | — | — | **45+** | **45+** | **45+** |
| Combined procedural library | **60** | **100** | **145+** | **160+** | **145+** |
| `ANCHOR_IDS` | **12** | **18** | **18** | **20** | **18–20** |
| `SOCIAL_BEAT_POOL` (between missions) | **12** | **16** | **16** | **20** | **16–20** |
| Briefing variants | **4** | **6** | **6** | **8** | **6–8** |
| Mission objective strings | **12** | **20** | **20** | **20** | **20** |

**Replay targets (solo v1, with dedupe generator):**

- **Veteran:** ≥85% of `GENERIC_POOL` IDs unique within one campaign when pool size ≥60; second campaign (new seed) should surface ≥70% procedural IDs not seen in the prior run until the pool is exhausted. Under normal slot counts, **no Tier-2 draws**.
- **Fury:** first campaign maximizes unique **Tier-1** fillers; when the Tier-1 deck is empty, draws come from **`GENERIC_POOL_TIER2` only** (fresh IDs, not a reshuffle of Tier-1). Narrative log: *"Division ran out of fresh map — pushed into country the first column never saw."* If Tier-2 is also exhausted, reshuffle **Tier-2 only** (still respecting `used` on first refill attempt).
- **Anchors:** at most **once per campaign** per anchor ID.
- **Social:** `pickManyUnique` across between-mission stops until pool exhausted, then allow repeats.
- **Foot:** ten-beat spine; **seeded order per run** via `buildFootBeatIds` (all ten beats, shuffled order).

**Generator contract (Wave 16):**

- Campaign-level **Tier-1** deck: shuffle `GENERIC_POOL` once, consume without replacement.
- Campaign-level **Tier-2** deck: shuffle `GENERIC_POOL_TIER2` once; used only after Tier-1 is empty for remaining filler slots.
- Tier-1 and Tier-2 ID sets are **disjoint**; Tier-2 ids register only via `registerTier2PoolKinds` (not in Tier-1 buckets).
- **Per-mission kind quotas (soft):** when the active deck still has variety, each mission draw prefers at least one `travel`/`supply` and one `human`/`npc`, and at most one `elite` — quotas apply across both tiers via `getPoolKind`.
- Campaign-level anchor deck: shuffle `ANCHOR_IDS`, allocate per-mission anchor counts without reusing IDs.
- `socialBeatQueue` on `GameState`: pre-shuffled `SOCIAL_BEAT_POOL` consumed at each between-mission beat.
- `measureFillerCoverage(missions)` — unique filler IDs used vs combined pool size; reports `tier1Used`, `tier2Used`, `tier2PoolSize` (replay QA).

**Kind mix:** Tier-1 buckets in [`src/content/poolKinds.ts`](src/content/poolKinds.ts); Tier-2 buckets in [`src/content/wave16Events.ts`](src/content/wave16Events.ts) `WAVE16_POOL_KIND_BUCKETS`. Every procedural id lands in exactly one bucket.

**Honest ceiling:** Fury second pass now surfaces **45+** new encounters instead of repeating Tier-1. Two full Fury campaigns with zero procedural repeats across both tiers still requires ~180+ combined unique fillers unless campaign length is reduced.

### 2.10 Campaign calendar immersion (shipped v0.17)

Historical calendar accuracy is **not** required. The campaign should still *feel* like time passes with consistent season and weather.

**Shipped:**

- [`deriveCampaignCalendar`](src/engine/campaignCalendar.ts) — deterministic `{ weekday, dateLabel, timeOfDay }` from `runSeed`, mission/day/beat indices, and `seasonPhase`. Fictional month names align to season (summer → Jun–Aug, winter → Dec–Feb, etc.).
- [`deriveDayPhase`](src/engine/campaignCalendar.ts) — beat index within a day → Dawn…Night (moved from UI-only helper for shared use).
- **Mission overview** ([`CampaignStatusBar.tsx`](src/ui/CampaignStatusBar.tsx)) meta tags: `Wed` · `14 Oct` · `Afternoon` · `Winter` · weather · encounter progress — via [`buildCampaignStatus`](src/ui/campaignStatus.ts).
- **Season ↔ environment matrix** — [`ENVIRONMENT_SEASONS`](src/engine/campaignCalendar.ts) is authoritative; [`ENV_POOL`](src/engine/config.ts) must match. Generator asserts each day’s `environment` is valid for that mission’s `seasonPhase`; Fury campaign tests scan all mission days.

**Not shipped (backlog):** automated catalog prose lint for snow/blizzard text on summer beats (manual authoring + matrix enforcement only).

### 2.11 Encounter depth (shipped v0.16)

Most procedural beats use a **two-step decision**: primary stance → reaction beat → follow-up menu → outcome. Goal: avoid “one Continue, one pick, done” for travel, combat, supply, human, and NPC content.

**Play steps:** `narrative` → `choose` → `react` → `followup_choose` → `outcome` on `event`, `foot`, `briefing`, `tank_replacement`, and interactive `between_missions` social beats.

**Choice fields (catalog):**

| Field | Purpose |
|---|---|
| `reactionBeat` | Prose between primary pick and follow-up menu |
| `followUpChoices` | Second menu (commit, back off, retry / `returnToPrimary`) |
| `deferEffects` | Default true when follow-ups exist — dice/effects on follow-up |
| `returnToPrimary` | On a follow-up only — clears `pendingEncounter`, returns to `choose` |

**State:** `GameState.pendingEncounter.primaryChoiceId` during react/follow-up; cleared on outcome or return. `SAVE_VERSION` **2** — loading older saves mid-beat resets react/follow-up to `choose` and drops `pendingEncounter`.

**Content:** [`src/content/encounterDepth.ts`](src/content/encounterDepth.ts) patches Tier-2 events + ~25 high-traffic Tier-1 pool ids at catalog load. Depth-required kinds: `travel`, `supply`, `human_moment`, `npc_conversation`, tank/infantry/defensive/offensive combat, `elite_encounter`. Exempt: `rest`, `briefing`, `debrief`, non-interactive between-mission beats.

**Engine:** [`src/engine/encounterFlow.ts`](src/engine/encounterFlow.ts), [`src/engine/reducer.ts`](src/engine/reducer.ts) `applyChoice` / `EVENT_CONTINUE`; UI react panel in [`src/ui/GameRoot.tsx`](src/ui/GameRoot.tsx).

---

## 3. THE CREW

### 3.1 Roles
Each crew member has a fixed role. In solo play, the player makes all decisions but is prompted by role when the decision type requires it.

| Role | Primary Responsibility | Decision Type |
|---|---|---|
| **Commander** | Overall calls, navigation, engagement orders | Strategic / moral |
| **Gunner** | Target selection, shot placement | Combat / tactical |
| **Driver** | Route choice, evasion, vehicle management | Travel / terrain |
| **Asst. Driver / Hull Gunner** | Infantry suppression, flank awareness | Defensive / reactive |
| **Loader / Medic** | Ammo type selection, crew treatment | Support / resource |

### 3.2 Crew Generation
At campaign start, five crew members are randomly generated. Each has:
- A **full name** (first + last, drawn from realistic WW2-era American name pools)
- A **nickname** (drawn from a mixed pool — cool, funny, gross, raunchy)
- A **rank** (enlisted or junior officer — appropriate to a tank crew; see §3.2a)
- A **personality archetype** (see 3.3)
- Starting **Health**: 100
- Starting **Constitution**: 100

**Example Name Pool Tags:** Realistic (65%), Funny/Gross/Raunchy (35%)

Sample nicknames: *Duchess, Tombstone, Pudding, Cornhole, Sawbones, Lucky, Shitbird, Halfpint, Padre, Hog, Crispy, Ballpeen, Duchess, Goose, Twitchy*

### 3.2a Crew Rank
Ranks stay **tank-crew appropriate** — this is not a promotion ladder to field grade. The ceiling is **2nd Lieutenant** (platoon-leader tank) and **Staff Sergeant** (experienced NCO tank commander). Most seats are Pvt. through Sgt.

| Rank | Typical seat | Notes |
|---|---|---|
| **Pvt.** | Loader, Asst. driver | Newest men in the hull |
| **PFC** | Loader, driver | Proven but still junior |
| **Cpl.** | Gunner, driver | NCO responsibilities in the turret or driver's station |
| **Sgt.** | Gunner, commander | Default tank commander rank in many platoons |
| **SSgt.** | Commander | Senior NCO commander — Fury's Wardaddy energy |
| **2nd Lt.** | Commander | Platoon leader's tank; rare but valid |

**Generation:** Each role draws from a weighted pool at campaign start and on replacement (`src/content/ranks.ts`). Rank appears on the in-mission HUD (with **Acting** tag on the voice leader when the commander is KIA), crew reveal, support dropdowns, and cross-campaign journal roster.

**Command succession (shipped v0.14):** When the commander dies, `resolveVoiceLeader` in [`src/content/ranks.ts`](src/content/ranks.ts) picks the **highest surviving rank** as *acting commander* for `{cmd}` placeholders, briefing/outcome quotes, and NPC address. Role-gated choices still map to seats in solo — succession is **voice only**. First KIA logs a one-line succession message; campaign-end journal can record `acting_commander_led` and `senior_nco_full_crew`.

**NPC friction (Wave 14):** `npc_mp_rank_check`, `npc_officer_lt_tank`, `npc_correspondent_rank` in [`src/content/wave14Events.ts`](src/content/wave14Events.ts) — rank mismatch beats using `{cmd}` voice leader.

**No broad promotion system** — ranks do not climb mission-to-mission; replacements arrive at pool rank for their seat. Any future “promotion” is a rare story beat, not a grind.

### 3.3 Personality Archetypes
Each crew member is assigned one archetype at generation. Archetypes can repeat across a crew — two veterans, two kids. Each run will feel different based on the combination. Fifteen archetypes are in the pool.

Each archetype entry includes: voice style, constitution behavior, trauma trigger profile, and a **quote set** — sparse, immersive lines for key moment types. Quote types covered: *on a good decision, on a bad decision, on crewmate death, under fire, during travel, unprompted/ambient.*

---

#### THE VETERAN
*Dry, fatalistic. Been here before. Doesn't waste words. Inspired by Winters, Lipton, Sgt. Horvath.*

**Constitution:** Slow loss, very slow recovery. Breaks only under sustained attrition.
**Trauma triggers:** Resists most. Enters *Numb* after prolonged low constitution. Death of a long-serving crewmate hits harder than a new one.

| Moment | Quote |
|---|---|
| Good decision | *"That'll do."* |
| Bad decision | *"We'll fix it."* |
| Crewmate death | *"Drive."* |
| Under fire | *"Stay on the gun."* |
| Travel / ambient | *"My father worked a forge. Loud as this, some days."* |
| Unprompted | *"Third winter in a row I've spent outside."* |

---

#### THE KID
*Earnest, scared, trying too hard to hide it. Wants to be brave. Isn't always. Inspired by Pvt. Ryan, Sledge, Norman Ellison.*

**Constitution:** Fast loss, fast recovery. Spikes on sudden death or isolation events.
**Trauma triggers:** Sudden crewmate death, being left alone, close calls. Enters *Frozen* more easily than any other archetype.

| Moment | Quote |
|---|---|
| Good decision | *"Did that — did that actually work?"* |
| Bad decision | *"I'm sorry. I'm sorry, I didn't—"* |
| Crewmate death | *"Oh god. Oh god, he's—"* |
| Under fire | *"Tell me what to do. Just tell me what to do."* |
| Travel / ambient | *"You think it's like this everywhere, or just here?"* |
| Unprompted | *"My mom doesn't know where I am right now."* |

---

#### THE DARK COMEDIAN
*Makes the wrong joke at the wrong time. Coping mechanism. Everyone knows it. Inspired by Garfield, Luz, some of Winters' men.*

**Constitution:** Moderate loss. Spikes hard on crewmate death — the jokes stop, which is worse.
**Trauma triggers:** Crewmate death (jokes go silent — unsettling). Long silences after bad events.

| Moment | Quote |
|---|---|
| Good decision | *"See, I told you. I'm basically a genius."* |
| Bad decision | *"Well. That's going in the memoir."* |
| Crewmate death | *[silence]* |
| Under fire | *"If I get shot in the ass I'm telling everyone it was my face."* |
| Travel / ambient | *"This road smells like my uncle's farm. His farm smelled like death too."* |
| Unprompted | *"I've been thinking — what if we just went home?"* |

---

#### THE PRAGMATIST
*Tactical, blunt. No sentiment. Not cruel — efficient. The war is a problem to solve. Inspired by Speirs, Basilone.*

**Constitution:** Very slow loss, very slow recovery. Suppresses states until catastrophic threshold — then multiple fire at once.
**Trauma triggers:** Catastrophic failure. Civilian casualties when preventable. Tactical errors he made himself.

| Moment | Quote |
|---|---|
| Good decision | *"Good. Next."* |
| Bad decision | *"We won't do that again."* |
| Crewmate death | *"Someone take his ammunition."* |
| Under fire | *"Acquire the target."* |
| Travel / ambient | *"Three klicks. Fifteen minutes if the road holds."* |
| Unprompted | *"I've been counting. We've done well."* |

---

#### THE FAITHFUL
*References God, fate, providence. Not preachy — genuine. War has not shaken it yet. Inspired by Heffron's faith, Eugene Sledge's moral weight.*

**Constitution:** Slow loss, recovers well at rest. Uniquely vulnerable to moral weight events.
**Trauma triggers:** Civilian death, friendly fire, orders that feel wrong. Enters a quiet state — not rage, not freezing. Just distance.

| Moment | Quote |
|---|---|
| Good decision | *"Thank you."* *(quiet, not to the crew)* |
| Bad decision | *"We ask forgiveness and we keep moving."* |
| Crewmate death | *"He's with God now. That's real. That's true."* |
| Under fire | *"Lord, not yet. Not yet."* |
| Travel / ambient | *"I used to think I understood why bad things happen."* |
| Unprompted | *"My grandmother would've hated this country. She'd have loved it too."* |

---

#### THE ANGRY ONE
*Hot-tempered, physical, leads with aggression. Not stupid — just wound tight. Inspired by Toye, Guarnere.*

**Constitution:** Fast loss under perceived failure or disrespect. Faster recovery than The Kid.
**Trauma triggers:** Orders that cost someone he cares about. Feeling powerless. Being held back when he wants to act.

| Moment | Quote |
|---|---|
| Good decision | *"Yeah. Yeah, that's what I'm talking about."* |
| Bad decision | *"Goddamn it. Goddamn it!"* |
| Crewmate death | *"I'll kill every one of them. Every single one."* |
| Under fire | *"Come on then! COME ON!"* |
| Travel / ambient | *"I hate waiting. I've always hated waiting."* |
| Unprompted | *"Back home my old man hit me every day until I hit him back. That was a good day."* |

---

#### THE QUIET ONE
*Says almost nothing. When he speaks, people listen. Hard to read. Possibly fine. Possibly not. Inspired by certain background presences in Band of Brothers.*

**Constitution:** Extremely slow loss. Nobody knows what's going on inside until it's too late.
**Trauma triggers:** Prolonged combat. Loss of a specific crew member he trusted. The Quiet One's constitution is nearly opaque — low constitution doesn't show in quotes because he doesn't quote much anyway.

| Moment | Quote |
|---|---|
| Good decision | *[nods]* |
| Bad decision | *"Mm."* |
| Crewmate death | *"He was a good man."* |
| Under fire | *[nothing]* |
| Travel / ambient | *"Clear."* |
| Unprompted | *"I was thinking about fishing."* |

---

#### THE HOMESICK ONE
*Talks about home too much. Knows it. Can't stop. Family man, or just someone who had a life before this. Inspired by Pvt. Mellish, various background characters in SPR.*

**Constitution:** Moderate loss. Recovers well after rest events that include human moments. Letters from home are particularly potent.
**Trauma triggers:** Long stretches without downtime. Another crew member receiving a letter. Passing through towns that look like home.

| Moment | Quote |
|---|---|
| Good decision | *"Good. Maybe we get home sooner."* |
| Bad decision | *"Just… keep moving. Eyes forward."* |
| Crewmate death | *"He had kids. Did you know that? He had kids."* |
| Under fire | *"Not today. Not today, not today, not today."* |
| Travel / ambient | *"My wife makes this bread. I can't even describe it. I dream about it."* |
| Unprompted | *"Forty-three days. I've been counting."* |

---

#### THE GLORY HOUND
*Wants to be remembered. Wants the story. Not a coward — but his motivations are his own. Can get crew into trouble. Inspired by certain officer-type figures in war films who push too hard.*

**Constitution:** Stable until a decision goes wrong because of his aggression — then sharp drops.
**Trauma triggers:** Being overlooked. A braver moment going unwitnessed. Someone else getting credit.

| Moment | Quote |
|---|---|
| Good decision | *"That's the one they'll write about."* |
| Bad decision | *"That didn't happen the way it looks."* |
| Crewmate death | *"He died well. Make sure that gets said."* |
| Under fire | *"Stay close — this is going to be something."* |
| Travel / ambient | *"You ever think about what you'll tell people when you get back?"* |
| Unprompted | *"I want a medal. I know that's not the right thing to say. I want one anyway."* |

---

#### THE CYNICAL ONE
*Has seen enough to stop believing in causes. Still fights. Just doesn't pretend anymore. Inspired by certain characters in The Pacific, Sledge's disillusionment arc.*

**Constitution:** Slow loss. Rarely motivated by mission objectives — motivated by the crew beside him.
**Trauma triggers:** Idealism from others (particularly The Kid or The Faithful). Being asked to believe in something. Wasted deaths for bad objectives.

| Moment | Quote |
|---|---|
| Good decision | *"Hm. Worked."* |
| Bad decision | *"Yep. That's about right."* |
| Crewmate death | *"Doesn't matter why. Just matters that he's gone."* |
| Under fire | *"We do what we do."* |
| Travel / ambient | *"They're going to build monuments to this. You know that? Monuments."* |
| Unprompted | *"I used to think there was a reason for all of it. Now I just think there's a lot of it."* |

---

#### THE NATURAL
*Weirdly good at this. Doesn't think too hard. Just acts and it works. Unsettles people who think about war more than he does. Inspired by the effortless soldiers in every war film who make it look simple.*

**Constitution:** Very stable. Rarely rattled. May unsettle other crew because he seems unbothered by things that should bother him.
**Trauma triggers:** The one thing he can't solve. A situation where skill doesn't matter. If he breaks, it's quiet and total.

| Moment | Quote |
|---|---|
| Good decision | *"Yeah."* |
| Bad decision | *"Weird. Okay."* |
| Crewmate death | *"I'll figure it out."* *(means: his role. not the death.)* |
| Under fire | *"I see him."* |
| Travel / ambient | *"Nice morning."* |
| Unprompted | *"I'm not scared. I've been trying to figure out if that's good or bad."* |

---

#### THE OLD HAND
*Not old — just been in longer than everyone else. Pre-war enlistee or North Africa vet. Patience worn thin but never gone. Distinct from The Veteran in that he still has feeling about it — it just lives deeper. Inspired by Sgt. Horvath, older NCOs in SPR.*

**Constitution:** Slow loss. Has reserves others don't. Recovers through purpose, not rest.
**Trauma triggers:** Rookies dying because they didn't know better. Same mistakes repeated. Watching someone young go through what he went through.

| Moment | Quote |
|---|---|
| Good decision | *"That's how it's done."* |
| Bad decision | *"We've been here before. We got through it before."* |
| Crewmate death | *"He didn't deserve the learning curve."* |
| Under fire | *"Controlled. Stay controlled."* |
| Travel / ambient | *"I've driven this kind of road in Tunisia. Same color dirt, believe it or not."* |
| Unprompted | *"I've got a system for staying alive. Mostly it's just paying attention."* |

---

#### THE RELUCTANT ONE
*Didn't want to be here. Drafted, or enlisted under pressure. Not a coward — just honest about what this is. Still does his job. Inspired by Pvt. Reiben's early arc, certain Saving Private Ryan background soldiers.*

**Constitution:** Moderate loss. Recovers in human moments — connection matters more than victory.
**Trauma triggers:** Being told the cause is worth it. Senseless objectives. Feeling like a number.

| Moment | Quote |
|---|---|
| Good decision | *"Fine. Good. Let's just keep moving."* |
| Bad decision | *"This is what I was afraid of."* |
| Crewmate death | *"I didn't even know his middle name."* |
| Under fire | *"I'm doing it. I'm doing it, okay?"* |
| Travel / ambient | *"I had a job. A real one. Not glamorous. I miss it every day."* |
| Unprompted | *"I keep a list of things I'm going to do when I get home. It's long."* |

---

#### THE PROTECTOR
*Crew-focused above everything. Would sacrifice the mission for one man. Quietly furious when leadership doesn't value lives. Inspired by medic characters — Eugene Roe, Doc Roe, the soul of a unit.*

**Constitution:** Stable when he can act. Degrades fast when he's helpless — when someone is dying and he can't reach them.
**Trauma triggers:** Being unable to help. Being ordered away from a wounded crew member. Preventable deaths.

| Moment | Quote |
|---|---|
| Good decision | *"Everyone still good? Sound off."* |
| Bad decision | *"Anyone hurt? Look at me — anyone hurt?"* |
| Crewmate death | *"I was right there. I was right there."* |
| Under fire | *"Stay low — I need everyone to stay low."* |
| Travel / ambient | *"You eating enough? You look pale."* |
| Unprompted | *"I think about the ones I couldn't get to. I think about them a lot."* |

---

#### THE DISPLACED
*Far from a home that doesn't look like the places they're fighting through. First-generation American, recent immigrant, or someone for whom this war has a different personal meaning. Inspired by the diverse composition of actual WW2 units — Nisei soldiers, Mexican American soldiers, soldiers whose families fled the countries now on both sides of this war.*

**Constitution:** Resilient in a way others aren't — has already survived displacement, reinvention. Vulnerable to specific triggers others would shrug off.
**Trauma triggers:** Specific moments of dehumanization. Being asked where he's "really" from. Occasionally, the opposite — being recognized, belonging.

| Moment | Quote |
|---|---|
| Good decision | *"My father would not believe any of this."* |
| Bad decision | *"We keep moving. That's what we do."* |
| Crewmate death | *"He was good to me from the first day. Not everyone was."* |
| Under fire | *"I've survived worse than this. I just didn't have a gun then."* |
| Travel / ambient | *"This town reminds me of nothing. That's almost worse."* |
| Unprompted | *"I enlisted to prove something. I'm not sure I remember what anymore."* |

---



## 3A. TRAUMA STATES

### 3A.1 Overview
Trauma states are named conditions drawn from a shared pool. They are distinct from constitution — constitution is the underlying meter, trauma states are the behavioral consequences of that meter dropping, or of specific triggers firing regardless of constitution level.

- Trauma states **stack** — a crew member can hold multiple states simultaneously
- Some states are **constitution-gated** (more likely when constitution is low)
- Some states are **event-triggered** (can fire at any constitution level when specific things happen)
- States are **cleared** by rest events, medic actions, good luck charm use, or mission success

### 3A.2 Trauma State Pool

| State | Trigger Type | Effect |
|---|---|---|
| **Shellshocked** | Constitution-gated (below 30) | –2 to all dice rolls this event |
| **Frozen** | Constitution-gated (below 20) OR event-triggered | Cannot perform role action; decision defaults to worst outcome |
| **Jumpy** | Event-triggered (ambush, sudden explosion) | Fires an unplanned action next event (e.g., Driver swerves, Gunner fires early) |
| **Thousand-Yard Stare** | Constitution-gated (below 40) | Crew member's quotes go silent; no reaction fires for 1–2 events |
| **Shaking** | Constitution-gated (below 35) | Loader/Gunner actions carry an additional –1 die modifier |
| **Grief-Struck** | Event-triggered (crewmate death) | Immediate –20 constitution; may stack with other states |
| **Rage** | Event-triggered (crewmate death, certain archetype only) | +1 to attack dice, –2 to all judgment/navigation dice |
| **Checked Out** | Constitution-gated (below 25) | Crew member's support actions are unavailable this event |
| **Numb** | Long-duration low constitution (3+ events below 20) | Constitution stops recovering naturally; requires active intervention |
| **Breaking** | Constitution at 10 or below | Role decisions are unreliable — 50% chance of defaulting even if not frozen |

### 3A.3 Archetype-Specific Trigger Notes
- **The Kid** can enter *Frozen* or *Grief-Struck* from a crewmate death regardless of constitution level
- **The Veteran** cannot enter *Frozen* until constitution is at or below 10 — but *Numb* hits them hard and lasts longer
- **The Dark Comedian** enters *Grief-Struck* immediately on crewmate death and the spike is deeper than other archetypes
- **The Pragmatist** suppresses most states until *Breaking* — then multiple states can fire simultaneously
- **The Faithful** is uniquely vulnerable to **moral weight events** (civilian casualties, orders that feel wrong) — these can trigger states regardless of constitution

### 3A.4 Crew Support Action
Once per event, one crew member can spend their turn **supporting** another instead of performing their role action. This:
- Restores 15–25 constitution to the target (dice-rolled)
- Can clear one minor trauma state (Shellshocked, Shaking, Jumpy)
- Cannot be self-directed
- The supporting crew member's role action is forfeit for that event

This is the mechanic inspired by The Grizzled's support tile system — adapted for a solo text game where the player chooses who needs the cup of coffee.

---

## 3B. GOOD LUCK CHARMS

### 3B.1 Overview
Each crew member can hold **one good luck charm** at a time. Charms are not generated at campaign start — they are **found or earned** during play.

Charms are acquired through:
- **Event success rewards** — certain events grant a charm as part of the outcome
- **Between-mission narrative events** — a letter from home, something found in a liberated house, a gift from an NPC
- **Elite encounter completion** — high-risk events may yield a charm

### 3B.2 Charm Effects by Archetype
When a crew member uses their charm, the effect is specific to their archetype.

| Archetype | Charm Flavor | Mechanical Effect |
|---|---|---|
| **The Veteran** | A worn photograph, face no longer clear | Clears all current trauma states; constitution unchanged |
| **The Kid** | A letter from home, read a hundred times | Fully restores constitution to 100; a quote fires about who's waiting |
| **The Dark Comedian** | A filthy joke on a cigarette paper | Clears one trauma state from any crew member; fires a quote |
| **The Pragmatist** | A field manual page, annotated in pencil | Converts one dice failure to a partial success; no narrative |
| **The Faithful** | A rosary, prayer card, or bible page | Prevents one crew member death — survived at 1 HP; usable on any crew member |
| **The Angry One** | A photo of someone who wronged him | Clears *Frozen* and *Checked Out* instantly; triggers *Rage* instead |
| **The Quiet One** | Something he's never explained | Reduces all crew constitution loss by half for one event; no quote fires |
| **The Homesick One** | A letter he hasn't opened yet | Restores 40 constitution; quote fires — something brief about home |
| **The Glory Hound** | A newspaper clipping about himself, or someone he admired | +2 to all dice this event; quote fires about legacy |
| **The Cynical One** | A broken thing he kept for no reason | Clears *Numb*; constitution doesn't restore but cap lifts |
| **The Natural** | Nothing. He just picks something up off the ground | Re-roll any one dice result; no explanation given |
| **The Old Hand** | A piece of kit from someone who didn't make it | Restores 30 constitution to all crew simultaneously; brief quote |
| **The Reluctant One** | A list of things he's going to do when he gets home | Clears all trauma states; constitution unchanged; quote reads the list |
| **The Protector** | A medic's kit tag or dog tag from a crew member | One crew member who would die this event survives at 5 HP; he takes the difference |
| **The Displaced** | Something from before — a place that no longer exists | Clears constitution floor; allows natural recovery to resume even from *Numb* |


### 3B.3 Charm Pool (Sample Items)
Charms are named objects. The name is flavor; the effect is archetype-keyed.

*Letter from home, a lucky coin, a worn photograph, a rabbit's foot, a bible verse on card stock, a child's drawing, a wedding ring on a chain, a cigarette case with initials, a pressed flower, a unit patch from a dead friend, a broken watch that still feels important, a pinup cut from a magazine, a playing card (ace of spades), a rosary with a missing bead, a map with a town circled*

---

### 3.4 Crew Quotes
Quote sets for all fifteen archetypes are defined in Section 3.3. Each archetype covers six moment types: good decision, bad decision, crewmate death, under fire, travel/ambient, and unprompted.

**Quote firing rules:**
- After every player decision: one crew member reacts (weighted toward the role that made the decision)
- On entering a new event: one ambient quote from a random crew member
- On crew injury or death: one crew member reacts — brief, never over-explained
- Occasionally unprompted during travel: foreshadowing or flavor, no decision context
- Two crew members can quote in sequence when the moment warrants it — sparingly

**Cross-crew quoting** — occasionally one crew member addresses another by nickname directly. These fire rarely and carry more weight for the rarity. Examples:

> *Twitchy (The Kid, to Tombstone): "You're not scared of anything, are you?"*
> *Tombstone (The Veteran): "Drive."*

> *Cornhole (The Dark Comedian, to nobody): "Padre, you praying right now?"*
> *Padre (The Faithful): "Always."*

> *Halfpint (The Reluctant One): "I just want to go home."*
> *Duke (The Old Hand): "I know. Keep moving."*


### 3.5 The Tank
The crew's tank is randomly named at campaign start from a mixed name pool.

**Tank Name Pool Tags:** Heroic (40%), Feminine (20%), Crude/Funny (25%), Ominous (15%)

Sample names: *Duchess, Iron Mary, Ol' Bastard, The Confessor, Hellcat, Lady Luck, Gutpunch, Saint's Folly, Widowmaker, Cornelia, Fat Agnes, Absolution, Stinky Pete, The Quiet One*

**Tank Type Selection:** At campaign start the player selects one of three tank types. The choice affects starting health, component resilience, and ammo loadout. All types use the same crew roles and combat system.

| Tank | Starting Hull | Component Bonus | Starting Ammo Note |
|---|---|---|---|
| **M4A3 Sherman** | 75% | None (baseline) | Balanced AP/HE load |
| **Churchill IV** | 90% | +1 component durability | Light on AP (+2 bonus rounds) |
| **T-34/85** | 65% | None | +3 AP rounds, lower HE base |

- **Sherman** — the default, balanced experience
- **Churchill** — slower, harder to kill; better for cautious players
- **T-34/85** — fragile but aggressive; better AP punch, worse survivability

The tank type is stored on `GameState.tankType` and drives ongoing mechanics via [`TANK_TYPE_PROFILES`](src/engine/config.ts):

| Tank | In-play modifier |
|---|---|
| **Sherman** | Baseline (no extra dice mods) |
| **Churchill** | `componentBonus` mitigates ~⅓ of random component hits; Driver −1 on `travel` dice events |
| **T-34/85** | Gunner +1 on `tank_combat` dice events |

---

## 4. RESOURCES

### 4.1 Resource Types
Resources are tracked as numeric values with visible status labels.

| Resource | Unit | Low Threshold | Critical Threshold |
|---|---|---|---|
| **Main Gun Ammo** | Rounds (by type) | 10 total | 4 total |
| **Crew Small Arms Ammo** | Magazines | 6 | 2 |
| **Tank Health** | % (0–100) | 40% | 20% |
| **Crew Health** | HP per crew (0–100) | 30 | 15 |
| **Crew Constitution** | Points per crew (0–100) | 30 | 15 |
| **Medical Kits** | Count | 2 | 0 |
| **Food** | Rations (days) | 2 | 0 |
| **Water** | Canteens | 2 | 0 |

### 4.2 Main Gun Ammo Types
Rounds are tracked individually by type. The **Loader** is prompted during combat to suggest the available load; the **Commander** makes the final call.

| Type | Abbreviation | Primary Use |
|---|---|---|
| Armor-Piercing | AP | Tank and vehicle targets |
| High Explosive | HE | Infantry, structures, soft vehicles |
| White Phosphorus | WP | Smoke screen, area denial |
| High Explosive Anti-Tank | HEAT | Armored targets at closer range |

### 4.3 Attrition (Oregon Trail Model)
If Food or Water reach zero, crew Health degrades per event at a moderate rate. If both are zero, degradation doubles. Health loss from starvation/dehydration is gradual and recoverable — it is not a sudden kill event but a slow death if ignored.

---

## 5. TANK COMPONENTS

The tank has named components that can be damaged and repaired. Some are binary (functional/broken), some have degradation levels.

| Component | Damage Type | Effect When Damaged |
|---|---|---|
| **Engine** | Degraded / Knocked Out | Speed reduced / immobilized |
| **Tracks (L/R)** | Broken | Immobilized until repaired |
| **Main Gun** | Jammed / Destroyed | Cannot fire main gun |
| **Hull MG** | Jammed / Destroyed | Asst. Driver cannot suppress infantry |
| **Radio** | Damaged / Out | No allied coordination events available |
| **Optics** | Cracked / Destroyed | Gunner accuracy penalty on dice |
| **Hatch** | Jammed | Crew cannot safely dismount |
| **Armor (Front/Side/Rear)** | Penetrated | Increases crew damage on next hit |

### 5.1 Repair
Repairs are attempted during **rest events** or **travel legs** with downtime. The Driver and Asst. Driver are the primary repair crew. Repair requires time (uses an event slot) and may require a successful dice roll on harder difficulties.

---

## 6. EVENT SYSTEM

### 6.1 Event Types

Procedural mission fillers are drawn from `GENERIC_POOL` with campaign-level deduplication (§2.9). Anchors and elites in that pool still obey once-per-campaign anchor rules for historical IDs.

| Type | Description |
|---|---|
| **Travel** | Movement leg — terrain, route choices, hazards |
| **Tank Combat** | Engagement with enemy armor |
| **Infantry Combat** | Engagement with enemy foot soldiers |
| **Defensive Stand** | Hold a position against attack |
| **Offensive Assault** | Push into an enemy-held position |
| **Supply** | Resupply opportunity — may involve risk |
| **Human Moment** | Crew/NPC interaction, no combat |
| **Historical Anchor** | Named fixed event with narrative weight |
| **Elite Encounter** | Named high-risk/high-reward engagement |
| **Rest** | Recovery event — health, constitution |
| **Briefing / Debrief** | Mission bookends |
| **NPC Conversation** | Dialogue-centred scene; 3 choices of what crew says; NPC gets `preChoiceNpc` + per-choice `npcReply`; mechanical effects optional |

### 6.2 Event Anatomy
Each event presents:
1. **`atmosphere`** *(optional)* — 1–2 sentence environmental/sensory line. Italicized, renders before the narrative. Sets the physical scene.
2. **Narrative text** — 2-paragraph prose (joined by `\n\n`). First paragraph grounds the situation; second paragraph moves it forward.
3. **A crew quote** — one archetype-flavored reaction. Templated with `{role}` shortcodes.
4. **`preChoiceNpc`** *(optional)* — An NPC speaks before the player chooses. Rendered as a gold-bordered speech block with speaker name in small-caps.
5. **A decision prompt** — **3–4 choices minimum**, each labeled by role (see §2.7 Choice Design Rules). Choice labels may be dialogue-flavored (what the crew member says).
6. **`dialogueLine`** *(optional, per choice)* — What the acting crew member says when choosing. Rendered as an italic accent line before the outcome.
7. **Outcome text** — result of the decision, dice-resolved where `useDice: true`.
8. **`npcReply`** *(optional, per choice)* — NPC responds after the outcome. Rendered as a reply speech block below the outcome text.
9. **A post-decision quote** — crew reacts to the outcome.

**`flavorOnly` choices:** When `flavorOnly: true`, dice are skipped and no effects are applied. The `outcomeText` is displayed immediately. Use for acknowledgement responses and purely narrative beats.

**Stakes fields:** `stakes`, `stakesNote`, and `tierFlavor` (see §2.8). On dice events, append `tierFlavor[tier]` after the base `outcomeText` so a bad roll feels different in prose, not only in extra constitution/hull effects.

**Choice fields:** `choiceRisk` (posture) and `riskTags` / qualitative `choiceHint` render on choice buttons during the choose step. See §2.8 for banned numeric patterns.

**`npc_conversation` kind:** Events entirely structured as NPC dialogue scenes. All 3 choices should be what the crew says in response; NPC gets `preChoiceNpc` + per-choice `npcReply`. Mechanical effects allowed but not required.

### 6.3 Environmental Conditions
At the start of each **day**, one environmental condition is set from a season-appropriate pool. It persists for all events that day. Some conditions are addressable — the crew can act to mitigate them. Others are simply the world bearing down.

**Condition Types:**

| Condition | Season | Type | Effect | Addressable? |
|---|---|---|---|---|
| **Scorching Heat** | Summer | Passive drain | Crew water consumption doubles; constitution degrades +5/event | No — endure it |
| **Dust Storm** | Summer | Visibility | All visibility rolls at –1; engine degradation risk per travel event | Partial — slow down |
| **Heavy Rain** | Autumn | Terrain + Visibility | Movement costs +1 fuel per travel leg; –1 to all visibility-dependent rolls | No |
| **Deep Mud** | Autumn | Terrain | Track damage risk on every travel event; movement slowed | Partial — pick hard ground |
| **Thick Fog** | Autumn/Winter | Visibility | Combat rolls at –2; ambush chance elevated; navigation harder | Partial — halt and wait (costs a turn) |
| **Light Snow** | Winter | Terrain | Minor movement penalty; tank more visible on open ground | No |
| **Blizzard** | Winter | Full impairment | Movement blocked unless Driver succeeds on a hard roll; all rolls –2 | Partial — find cover (costs an event) |
| **Hard Freeze** | Winter | Mechanical | Engine start requires a roll each day; failure costs a turn | Partial — Driver can preheat engine (resource cost) |
| **Ice** | Winter | Terrain | Driver evasion rolls at –2; track damage risk elevated | No |
| **Thaw / Mud Season** | Spring | Terrain | Same as Deep Mud but unpredictable — condition may worsen mid-day | No |
| **Overcast / Low Light** | Any | Visibility | Minor –1 to ranged combat; no major penalty | No |
| **Clear / Good Weather** | Any | Beneficial | No modifier; crew quote may note the irony | — |

**Compounding Conditions:**
When two or more conditions would compound to a dangerous degree, the game surfaces a **Condition Warning** at the start of the day:

> *"Fog. Mud. The kind of morning that gets people killed."*

The warning is informational — it tells the player the dice are stacked. It is not automatic failure. The player can respond by being conservative, burning resources to mitigate, or pressing on and accepting the risk.

Some compound pairs are especially dangerous:
- Fog + Infantry Contact = ambush probability sharply elevated
- Blizzard + Engine Damage = possible mission-ending immobilization
- Heat + No Water = crew health crisis within 1–2 events
- Night + Tiger Encounter = nearly unsurvivable without WP smoke

### 6.4 Decision Structure by Role
When a decision requires a specific role, the prompt is framed for that crew member. In solo play, the player reads the role framing and responds as that crew member.

**Example — Travel event (Driver decision):**
> *The road forks. Left runs through a bombed village — faster but exposed. Right skirts the treeline — longer, possible ambush.*
> *"Goose" (Driver): "That village gives me bad feelings, Sarge."*
>
> **DRIVER'S CALL:**
> A) Push through the village — save fuel, risk exposure
> B) Take the treeline — burn more fuel, possible contact
> C) Hold position and send Asst. Driver to scout on foot

### 6.5 Constitution, Trauma, and Frozen Crew
Constitution is the underlying meter. Trauma states are the named behavioral consequences (see Section 3A). The **Frozen** state is the most severe — it means a crew member's role action simply does not happen.

- When Frozen, the role's decision defaults to a poor or automatic outcome
- The Loader/Medic can spend a **Medical Kit** to attempt to stabilize a Frozen crew member (dice roll, restores 20–30 constitution, clears Frozen state on success)
- Constitution recovers at rest events, after mission success, and through the crew support action
- Some trauma states (Numb, Breaking) block natural recovery — active intervention required

---

## 7. COMBAT SYSTEM

### 7.1 Dice Model
All outcomes are resolved via weighted dice rolls. Base roll: **1d10**, modified by:
- Crew constitution (penalty if low)
- Tank component damage (penalty if relevant component damaged)
- Ammo type match (bonus if correct ammo type for target)
- Terrain/visibility modifiers per event
- Difficulty modifier (see Section 2.2)

**Result Tiers:**
| Roll (modified) | Outcome |
|---|---|
| 9–10 | Clean success — no cost |
| 6–8 | Success with cost — minor damage or resource use |
| 3–5 | Partial failure — significant damage, crew effect |
| 1–2 | Failure — heavy damage, possible injury, morale hit |

### 7.2 Tank vs. Tank Combat
The **Commander** calls the engagement type. The **Gunner** selects approach. The **Loader** is prompted for ammo type confirmation.

**Engagement variables:**
- Range (Close / Medium / Long)
- Enemy tank type (Sherman analog, Panzer IV, Panther, Tiger I, Tiger II)
- Flanking opportunity (yes/no, affects roll modifier)
- Visibility (day/dusk/night/smoke)

Enemy tank type sets a **target difficulty modifier** — a Tiger I at close range is a brutal roll. AP rounds at a Panther's flank is a favorable one.

Outcomes can affect:
- Enemy destroyed, disabled, or withdraws
- Player tank components hit
- Crew injury from penetration or concussion
- Ammo expended (including misfires)

### 7.3 Tank vs. Infantry Combat
The **Asst. Driver** and **Commander** drive these decisions. HE and WP rounds are primary. Hull MG is the crew weapon of choice.

**Infantry combat variables:**
- Enemy count (squad / platoon / company)
- Cover type (open field, village, forest, fortified)
- AT threat present (Panzerfaust, AT gun) — yes/no
- Crew exposed? (hatch open adds constitution risk)

AT threats elevate stakes significantly — an infantry event with Panzerfausts approaches tank combat lethality.

### 7.4 Defensive Stand
The crew holds a position. Events are sequential — waves or probing attacks. **Commander** sets engagement rules each wave. Constitution drains faster in defensive scenarios due to sustained stress.

**Implementation:** On every `defensive_stand` event with dice, the reducer applies an extra `{ op: "mod_all_constitution", delta: -2 }` after tier resolution (stacks with tier 1/2 penalties) and logs *“Holding the line grinds the crew down.”*

### 7.5 Offensive Assault
The crew advances into resistance. **Driver** and **Commander** make the key calls. Higher resource consumption. Higher reward on success (supply drops, intel, morale quotes).

**Implementation:** On `offensive_assault` dice events, tier 1–2 add −1 constitution (push cost); tier 3–4 grant +1 salvage (tier 4 also logs *“The push paid for itself.”*).

---

## 8. TANK DESTRUCTION AND LOSS

### 8.1 Tank Destruction Scenarios

| Cause | Crew Survival | Salvageable Gear |
|---|---|---|
| Mine / Mobility Kill | Likely — can dismount | Most gear if time allows |
| Penetrating Hit / Fire | Variable — constitution check per crew | Minimal — what they carry out |
| Catastrophic Brew-Up | Low — dice per crew member | None |

A **Brew-Up** (catastrophic ammo cook-off) is the worst outcome. Each crew member rolls independently to escape. Some may not.

### 8.2 On Foot
If the tank is lost and crew survive, they enter a **foot section**:
- Events shift to infantry-scale decisions
- Carried gear only (small arms, medkits, rations)
- Objective may become: reach friendly lines, link up with allied armor, find a replacement vehicle
- Foot events have their own table — more human, more desperate

**Foot Event Table (10 beats, fully implemented):**

| Beat | Setting | Key Choice Axis |
|---|---|---|
| `foot_woods` | Dense forest — disoriented, possible ambush | Push through / go wide / find high ground |
| `foot_open_field` | Exposed ground under observation | Sprint across / crawl / wait for cover of dark |
| `foot_lines` | Ambiguous front line — could be friendly, could be enemy | Call out / observe and wait / flank wide |
| `foot_bridge` | Damaged bridge — one at a time, possible sniper | Rush it / cross slow / find a ford |
| `foot_sniper` | Contact — one shot, direction unclear | Go to ground / identify and suppress / scatter |
| `foot_farmhouse` | Shelter opportunity, possibly occupied | Enter directly / observe first / bypass |
| `foot_checkpoint` | Allied or enemy checkpoint ahead | Approach openly / flanking / send one man forward |
| `foot_ditch` | Crew pinned in a ditch by fire | Return fire / break left / break right |
| `foot_dog` | A dog finds the crew — brief morale beat | Interact / ignore / use as a scout |
| `foot_gate` | Locked gate, a walled town beyond | Ram it / climb over / find another way |

All 10 beats have 2–3 choices each with role attribution.

### 8.3 Tank Replacement
A replacement tank can be acquired:
- At an allied supply depot (between-mission event)
- By capturing a lightly damaged enemy vehicle (special event, high difficulty)
- At certain **Human Moment** events with allied units that can spare one

A replacement tank generates a **new random name** and starts with degraded resources (it's not fresh).

---

## 9. CREW INJURY, DEATH, AND REPLACEMENT

### 9.1 Injury
Crew health degrades from combat, failed events, and attrition. At **15 HP or below**, a crew member is wounded — their decisions carry a constitution penalty until treated.

Medical Kits are the primary recovery tool. The **Loader/Medic** spends a kit and rolls dice — outcome determines HP restored.

### 9.1a Named Scars
When a crew member suffers a significant injury (a bad combat outcome, a failed dice roll at low HP, a brew-up escape), a **named scar** may be generated. Scars are permanent — they are not healed by medkits or rest, only managed.

**Scar generation is injury-type realistic:**

| Injury Source | Scar Category | Example Randomly Generated Names |
|---|---|---|
| Shrapnel / blast fragment | Hand / Arm | "Bent Trigger Finger", "Two-Knuckle Gap", "Dead Middle Finger" |
| Concussion / overpressure | Hearing | "Half-Deaf Left Ear", "Ringing That Won't Stop", "Gone in the Left" |
| Flash / burn / optics hit | Vision | "Milky Right Eye", "Blind in the Sun", "One Good Eye Left" |
| Burn / fire escape | Body | "Seamed Neck", "Tight Shoulder", "Graft on the Forearm" |
| Crush / hatch / debris | Leg / Foot | "Drags the Left", "Bad Hip Since Falaise", "Stiff Knee" |

**Scar stacking and death threshold:**
- A crew member can carry **up to two scars**
- A third injury event that would generate a scar instead **risks death** — dice roll determines survival; on failure the crew member dies; on success they survive with a severe combined-effect penalty
- This creates a meaningful track: first scar is a warning, second is a liability, third is a gamble

**Scar effects on role:**

Scars impose role-specific penalties based on which body system is affected. Coverage by another crew member is automatic when anatomically sensible — the game assigns it without requiring a player decision. Coverage quality varies by role compatibility.

| Scar Type | Primary Role Affected | Coverage Options | Coverage Penalty |
|---|---|---|---|
| Hand / Arm | Loader (can't rack the gun cleanly) | Asst. Driver covers loading | –1 die, slower cycle |
| Hearing | Any role receiving verbal orders | Adjacent crew member relays | Minor delay, occasional miscommunication event |
| Vision | Gunner (can't sight targets), Driver (can't read terrain) | Gunner ↔ Commander can swap sighting; Driver has no clean coverage | Gunner: –2 accuracy. Driver: no coverage — forced slower movement |
| Body / Burn | Any role involving hatch or dismount | Crew assists dismount | Cosmetic / minor constitution cost |
| Leg / Foot | On-foot events only | Carried or supported by another crew | Movement penalty in foot section |

**Note on coverage sanity:** The Gunner and Loader share a confined space and can plausibly cover adjacent functions. The Driver's position is physically isolated — vision loss behind the controls has no clean substitute and is the most dangerous scar a Driver can carry.

### 9.2 Death
Crew death is **permanent**. When a crew member dies:
- Their role is **unfilled** until replaced
- Another crew member **doubles the role** — this imposes a **–10 constitution penalty per event** on the doubling crew member
- The doubling crew member's quotes begin to reflect the psychological weight
- A **death quote** fires — one surviving crew member says something. It is brief. It does not explain. It lands hard.

**Commander death:** When the commander is KIA, the highest surviving **rank** (§3.2a) becomes *acting commander* for quotes and NPC address until a replacement arrives or the campaign ends. Mechanical role coverage is unchanged — survivors still double seats.

**Crew death is never trivially narrated.** It is always a moment.

### 9.3 Replacement
Crew can be replaced:
- At **debrief/rest events** between missions — a replacement arrives from the replacement depot
- In the **field**, rarely, if a Human Moment event involves a compatible allied unit
- Replacement crew are **randomly generated** — new name, new nickname, new archetype

Replacement crew start at **80 Constitution** (they're strangers to the unit) and gain familiarity over events (no mechanical stat — only reflected in quotes shifting tone).

---

## 10. BETWEEN-MISSION EVENTS (THE DEBRIEF STOP)

Equivalent to the Oregon Trail fort. After each mission chapter, the crew reaches a rest point — a supply depot, a liberated town, a field camp.

### 10.1 Available Actions (choose a limited number per stop)
- **Resupply** — restock ammo, food, water, medkits (limited availability, possibly rationed)
- **Repair** — address tank component damage
- **Rest** — restore crew constitution (all crew, moderate recovery)
- **Replace Crew** — if a slot is vacant or a crew member is critically wounded
- **Debrief** — narrative event, no mechanical cost, always present
- **Spend Salvage** — spend the shared salvage pool on upgrades (see 10.3)

### 10.2 Consequence Seeding
Not all problems resolve cleanly at mission end. Some events **seed forward** — planting a consequence that surfaces in a future mission. This can be telegraphed or silent.

**Telegraphed seeding** — a crew quote or brief narrative note signals it:
> *"Shitbird watches the SS unit disappear into the treeline. They'll be waiting somewhere down the road."*

**Silent seeding** — no warning. The consequence simply arrives in a future event, lands harder for the surprise.

The mix is roughly 60/40 telegraphed to silent. Silent seeds are reserved for smaller consequences (a supply cache that's been looted, a bridge that's been blown). Telegraphed seeds carry the heavier events (a unit that followed you, a commander who knows your callsign).

**What can be seeded:**
- A specific enemy unit reappearing as a named event
- A supply point that was raided and is now empty
- Allied forces delayed or absent because of an earlier choice
- A character the crew encountered who reappears — changed by what happened
- A component that wasn't fully repaired and fails at the worst moment

### 10.3 Salvage Pool and Upgrades
After each mission, the crew earns **salvage points** based on performance — objectives completed, enemies destroyed, crew kept alive. Points go into a **shared pool**; the Commander (or group in coop) decides how to spend them at the debrief stop.

Points are limited and upgrades are mutually exclusive per stop — you can't do everything.

**Upgrade Catalog (actual costs as shipped):**

| Upgrade | Salvage Cost | Effect |
|---|---|---|
| **Ammo bundle** (AP+HE) | 3 | +2 AP, +2 HE rounds |
| **WP round** | 3 | +1 White Phosphorus round |
| **Armor patch** | 5 | Reduces damage from next penetrating hit |
| **Field rations** | 2 | +2 food |
| **Medkit** | 3 | +1 medical kit |
| **Intel brief** | 4 | Preview next mission's first event type |

**Debrief pick limit:** Green=2 picks per stop, Veteran=3, Fury=3. A free resupply top-up is always available first (capped: +2 AP, +3 HE) before salvage spending.

### 10.4 Social / Narrative Stop Events
Not every stop event is transactional. A pool of narrative moments fires between missions. All are fully implemented as interactive beats with 3 choices and outcomes.

**Implemented social beats** (`social_*` kind `rest`):
- **`social_cards`** — card game on a ration crate; morale and crew bonding
- **`social_letters`** — mail call; write back / fold away / loader reads aloud
- **`social_chaplain`** — chaplain stops by; talk / sit in silence / gunner stays outside
- **`social_rumor`** — rumors circulate; engage / press for intel / driver adds his own

**Additional between-mission beats** (`SOCIAL_BEAT_POOL` only — not in `GENERIC_POOL`):
- **`social_drunk`**, **`social_found_item`**, **`social_new_arrival`**, **`social_dog_returns`**
- **`social_mail_call`**, **`social_deck_cleaning`**, **`social_superstition`**, **`social_grave_markers`** (Wave 12)

These fire on the between-missions screen after the final debrief pick. They may grant constitution, small items, or nothing at all. War isn't only the fighting.

---

## 11. WIN AND LOSS CONDITIONS

### 11.1 Victory
Complete the final mission with at least one crew member alive and the primary objective achieved.

A victory with a full living crew is the best outcome. A victory with dead crew is a hollow win — and the game acknowledges it.

### 11.2 Loss Conditions
- All crew are dead
- The primary objective is failed with no crew alive to continue
- The tank is destroyed AND the crew cannot reach friendly lines within the foot section's event limit

### 11.3 Ending Tone
The ending narrative reflects the state of the surviving crew. A full-crew survival gets something close to hope. A single survivor gets something much darker. The game does not reward suffering with sentimentality.

---

## 12A. PRESENTATION LAYER (SOLO BROWSER UI)

Shipped v0.15+. The play shell in [`src/ui/GameRoot.tsx`](src/ui/GameRoot.tsx) (`PlayShell`) composes dedicated panels; **all campaign mechanics stay in the engine reducer** — UI only reads `GameState` and dispatches actions.

### 12A.1 Play screen layout (vertical priority)

Top-to-bottom order — **scene first in the middle**, reference chrome above and below:

```
┌─────────────────────────────────────────────────────────────┐
│ STICKY TOP ROW (playLayout__top)                            │
│  ┌──────────────────────────────┬─────────────────────────┐ │
│  │ Mission overview (heading)   │ Situation log (heading) │ │
│  │  theater / mission / tags    │  (same height, scroll)  │ │
│  └──────────────────────────────┴─────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ MAIN BEAT (playLayout__main) — narrative, choose, outcome   │
├─────────────────────────────────────────────────────────────┤
│ UNIT ROSTER (TankCrewPanel / unit-roster)                   │
│  Supplies strip (one line: ammo, food, water, salvage, …)   │
│  Unit cards grid: tank slot + five crew (health/nerve bars) │
└─────────────────────────────────────────────────────────────┘
```

- **≥768px:** status bar and situation log are **side by side** (`1fr` + ~34% column).
- **&lt;768px:** stacked; situation log still **does not grow** — internal scroll only.

CSS: [`src/index.css`](src/index.css) classes `playLayout`, `playLayout__top`, `playLayout__main`, `unit-roster`.

### 12A.2 Mission overview + situation log (top row)

Both panels use CSS class `play-top-panel`: **equal height** on viewports ≥768px (`min(11rem, 32vh)`), body scrolls internally.

**Mission overview** — [`CampaignStatusBar.tsx`](src/ui/CampaignStatusBar.tsx) (`mission-overview`), data from [`campaignStatus.ts`](src/ui/campaignStatus.ts):

| Content | Source |
|---|---|
| Heading: “Mission overview” | Static label (matches “Situation log”) |
| Theater, difficulty, phase, day, mission line, objective (2-line clamp) | `buildCampaignStatus(game, sub)` |
| Tags: weather, time-of-day, season, beat | `buildCampaignStatus` |
| Supply warnings, `uiAlert` | `getSupplyAlerts`, `game.uiAlert` |

**Situation log** — [`ActivityFeed.tsx`](src/ui/ActivityFeed.tsx): capped height, scroll inside `.activity-feed__scroll` (§12A.3).

**Hull / tank health** lives only on the **tank unit card** in the bottom roster (§12A.4), alongside crew health/nerve bars.

### 12A.3 Situation log (scroll, capped height)

Module: [`ActivityFeed.tsx`](src/ui/ActivityFeed.tsx).

- **Data:** last **~14** deduped lines from `game.narrativeLog` plus up to **4** recent `fieldJournal` entries with `kind: "discovery"`, categorized by [`feedCategories.ts`](src/ui/feedCategories.ts).
- **UX:** panel `max-height: min(10.5rem, 32vh)`; list scrolls inside `.activity-feed__scroll` — **must not expand** the sticky top row or push the main beat off-screen as the log grows.
- **Categories:** `discovery`, `crew`, `tank`, `supply`, `general` (left-border color). Full history remains Field Journal (§13).

### 12A.4 Unit roster and supplies

Module: [`TankCrewPanel.tsx`](src/ui/TankCrewPanel.tsx) (CSS class `unit-roster`).

| Piece | Content | Source |
|---|---|---|
| **Supplies strip** | Centered block: heading + one row (AP, HE, WP, HEAT, mags, medkits, food, water, **salvage**) | `game.resources`, `game.salvagePoints` |
| **Tank unit card** | First card; name; type + passive; **Hull** `StatBar`; damaged components or “Systems nominal” | `game.tank`, components, tank profile |
| **Crew unit cards** | Nickname + full name; rank · role; **Health** and **Nerve** bars via [`StatBar.tsx`](src/ui/StatBar.tsx); Acting badge; covering role; trauma; scars; KIA style when hp ≤ 0 | `game.crew`, `isActingCommander` |

Desktop grid: up to **6** equal columns (1 tank + 5 crew); narrower viewports use auto-fill / 2-column fallback.

### 12A.5 Main beat, choices, outcomes

| Step | UI | Notes |
|---|---|---|
| Narrative / choose / outcome | `GameRoot` `PlayPanel` sections inside `playLayout__main` | Keyboard **1–4** on choose step |
| Choose | [`ChoiceList.tsx`](src/ui/ChoiceList.tsx) | Qualitative `riskTags` / `choiceHint`; posture `choiceRisk`; optional dice odds label — **no** numeric hull/ammo on buttons (§2.8) |
| Outcome | [`OutcomePanel.tsx`](src/ui/OutcomePanel.tsx) | Narrative + **Aftermath** numeric summary from [`outcomeSummary.ts`](src/engine/outcomeSummary.ts) using `pendingOutcome` snapshots (`effectLines`, `resourceSnapshot`, `tankHealthBefore`, `preCrewHp`) |

### 12A.6 Pre-choice vs post-choice numbers

| Phase | Player sees |
|---|---|
| **Choosing** | Soldier label, role, posture (`choiceRisk`), qualitative risk tags |
| **Outcome** | Narrative + Aftermath summary with numbers |

### 12A.7 Onboarding

[`SplashScreen.tsx`](src/ui/SplashScreen.tsx) — optional first-visit briefing (localStorage skip); title menu link to reopen. Documents this layout for new players.

---

## 12. RANDOM NAME POOLS (SEED LISTS)

Name pools reflect the actual diversity of the WW2 American military — African American, Latino, Italian American, Polish American, Irish American, Jewish American, Native American, Japanese American, and other backgrounds. Names are period-accurate and draw from communities that genuinely served.

### 12.1 Crew First Names

*Common American (cross-background):* James, Robert, William, John, Thomas, Charles, George, Henry, Frank, Earl, Harold, Eugene, Raymond, Lloyd, Roy, Alvin, Emmett, Walter, Albert, Leonard, Calvin, Herbert, Clarence, Vernon, Chester

*African American (period-accurate):* Willie, Leroy, Roosevelt, Cornelius, Amos, Isaiah, Elijah, Solomon, Booker, Otis, Rufus, Clarence, Jessie, Horace, Luther, Thaddeus, Virgil, Ezra, Moses, Nathan

*Latino / Hispanic American:* Ernesto, Miguel, Carlos, Luis, Ramon, Antonio, José, Manuel, Rodrigo, Hector, Salvador, Felix, Armando, Ignacio, Benito, Ruben, Domingo, Lorenzo, Celestino, Gilberto

*Italian American:* Enzo, Carmine, Sal, Rocco, Gino, Dante, Mario, Vito, Angelo, Luca, Pasquale, Bruno, Aldo, Silvio, Nunzio

*Polish / Eastern European American:* Stanislaw (Stan), Tadeusz (Teddy), Kazimierz (Kaz), Zbigniew (Ziggy), Henryk, Mieczyslaw (Mitch), Władysław (Walt), Józef (Joe), Bolesław (Bo)

*Irish American:* Patrick, Seamus, Brendan, Kieran, Declan, Fergus, Cormac, Liam, Rory, Dermot, Cathal, Fintan

*Jewish American:* Samuel, Irving, Morris, Ira, Julius, Nathan, Hyman, Bernard, Seymour, Milton, Arnold, Sidney, Leonard, Sheldon, Murray

*Native American:* Joseph, Thomas, John, Raymond, Chester, Calvin — first names were frequently anglicized; last names carry heritage (see below)

*Japanese American (Nisei):* Henry, George, Frank, Harry, Robert, Kenji, Mas, Yuki, Roy, Ken, Tom, Shig, Hiro

### 12.2 Crew Last Names

*Anglo / general American:* Briggs, Harmon, Whitfield, Tanner, Graves, Holloway, Wicker, Haskins, Polk, Drummond, Calhoun, Beaumont, Pryor, Penrose, Renfro, Doyle, Vickers, Holt, Marsh, Pruitt

*African American:* Washington, Freeman, Jefferson, Jackson, Booker, Harmon, Holloway, Calloway, Dupree, Graves, Tanner, Whitfield, Calhoun, Pryor, Coleman, Briggs

*Latino / Hispanic:* Santos, Estrada, Garza, Morales, Reyes, Vega, Delgado, Fuentes, Cisneros, Montoya, Rojas, Ibarra, Vargas, Castellano, Trevino

*Italian American:* Deluca, Esposito, Ricci, Ferrara, Conti, Marino, Russo, Mancini, Caruso, Lombardi, Palumbo, Santoro, Napoli, Gallo, Vitale

*Polish / Eastern European:* Kowalski, Kowalczyk, Szymanski, Bukowski, Wisniewski, Wojciechowski, Kaminski, Nowak, Zielinski, Wozniak

*Irish American:* O'Brien, Callahan, Flanagan, Donovan, Murphy, Shaughnessy, Gallagher, Brennan, Hennessy, Kearney

*Jewish American:* Goldberg, Stein, Levine, Berkowitz, Friedman, Shapiro, Rosenberg, Weiss, Katz, Schwartz, Horowitz, Cohen

*Native American:* Runningwater, Eagleheart, Twobears, Morningstar, Greywolf, Longtree, Sixkiller, Stillwater, Clearwater, Youngblood

*Japanese American:* Nakamura, Tanaka, Yamamoto, Ito, Watanabe, Kimura, Hayashi, Suzuki, Inoue, Kobayashi

### 12.3 Nicknames (Mixed Pool)

*Cool/Heroic:* Ace, Tombstone, Ghost, Ironside, Duke, Reaper, Gunmetal, Crow, Saber, Venom, Hammer, Ranger, Steel, Colt, Blaze

*Affectionate/Crew:* Padre, Sawbones, Goose, Lucky, Halfpint, Kid, Doc, Preacher, Books, Pops, Chief, Slim, Tex, Jersey, Brooklyn, Frisco, Dixie

*Funny/Gross/Raunchy:* Cornhole, Pudding, Twitchy, Shitbird, Hog, Crispy, Ballpeen, Stinky, Lardass, Skidmark, Taint, Noodle, Chafes, Biscuit, Mudbutt, Swampgas, Gravy, Skeeter, Crotchrot, Knucklehead, Pissflap, Stumpy, Gristle, Waffle

### 12.4 Tank Names (Mixed Pool)

*Heroic/Ominous:* Widowmaker, Absolution, Iron Shepherd, Saint's Folly, The Confessor, Hellgate, Wrath of God, Black Penance, The Reckoning, Pale Rider, Iron Requiem, Hellbound, Penitent Son, No Remorse, Last Rites

*Feminine/Affectionate:* Lady Luck, Iron Mary, Cornelia, Fat Agnes, Sweet Darlene, Big Rosie, Old Faithful, Mabel, Josephine, Iron Lena, Mama Bear, Ruthless Ruth, Hard Luck Helen

*Crude/Funny:* Ol' Bastard, Gutpunch, Stinky Pete, The Ugly One, Loud Nancy, Half-Assed, Broke Dick, The Lemon, Perpetual Disappointment, Leaky Bitch, Rusty Trombone, Dumpster Fire, She'll Do, Last Option, Barely

*Historical echo (easter egg candidates):* Fury, Thunderbolt, Cobra King, Eagle, Tiger Bait, Bitch, Michael, Lucy, Besotten Jenny

---


## 13. THE FIELD JOURNAL

### 13.1 Overview
The Field Journal is a persistent cross-campaign record. It tracks discoveries, unlocked moments, famous combinations encountered, and named crew who survived or died. It does not affect gameplay — it is a record of what happened and what was found.

The Journal persists between campaigns. Starting a new campaign doesn't erase it. Over many runs, it fills in.

### 13.2 Journal Sections
- **Crew Roster** — every named crew member who appeared, their **rank**, fate, scars, and archetype
- **Tank Registry** — every tank name generated, campaigns they served in, how they were lost or if they survived
- **Discoveries** — unlocked moments, famous combinations found, legendary encounters triggered
- **Moments** — a one-line record of notable events: first brew-up survived, first crewmate lost, first Tiger killed

**Future:** Rank-related journal entries (acting commander after KIA, senior NCO led full crew home) use the same `discovery` / `moment` pipeline as §15.

---

## 14. CHARM RARITY AND LOOT SYSTEM

### 14.1 Rarity Tiers
Good luck charms are found and earned during play. Each charm has a **rarity tier** that determines how likely it is to appear. Inspired by action RPG loot systems — rarity is a drop chance modifier, not a power gate.

| Tier | Drop Chance (Base) | Color / Feel | Description |
|---|---|---|---|
| **Common** | High | Worn, ordinary | Personal items, scraps, letters — things any soldier might carry |
| **Rare** | Moderate | Unusual, specific | Items with a story — someone else's lucky piece, something found in a strange place |
| **Epic** | Low | Notable, named | Items with a reputation — a medic's kit from a famous unit, a coin from a specific battle |
| **Legendary** | Very low | Singular | One-of-a-kind objects — things the crew will remember and the Journal records (implemented as `legendary` rarity in charm catalog) |

### 14.2 Encounter Type Drop Modifiers
Certain event types increase the chance of finding higher-tier charms:

| Event Type | Modifier |
|---|---|
| Standard travel / human moment | Base rate |
| Combat success (infantry) | +Common chance |
| Combat success (tank) | +Rare chance |
| Elite encounter completion | +Epic chance |
| Historical anchor event | +Epic / Legendary chance |
| Named legendary NPC interaction | +Legendary chance |

### 14.3 Charm Rarity Interaction Events
When a crew member holds a **Rare, Epic, or Legendary** charm, certain event triggers can fire a special **charm moment** — a unique crew quote, a brief scene, or a Field Journal entry. These are cosmetic and memorable, never mechanical.

**Examples:**
- *Rare charm + death event nearby:* The crew member holding it says something about it. Someone notices. It lands.
- *Epic charm + historical anchor:* A brief scene acknowledges the object's connection to the moment.
- *Legendary charm + mission completion:* A Field Journal entry is written. It reads like history.

---

## 15. FAMOUS COMBINATIONS AND EASTER EGGS

### 15.1 Overview
Certain randomly generated combinations — crew names, tank names, role pairings — can match **famous or fictional references**. When they do, a discovery fires: a cosmetic moment, a Field Journal entry, sometimes a unique crew quote. No gameplay impact. Pure discovery.

**Implementation:** `discovery_stub` effects resolve against [`src/content/discoveries.ts`](src/content/discoveries.ts). Campaign start runs `findFamousDiscoveries` (same-last-name, Thunderbolt, Fury, Lucky, Cobra King, etc.). Faithful crew receiving the `rosary` charm can trigger the `faithful_rosary` discovery journal entry.

The rarer the combination required, the more significant the discovery moment.

### 15.2 Combination Types and Rarity

| Combination Type | Rarity | Example |
|---|---|---|
| First + Last name match (historical figure) | Uncommon | A loader named Alvin York |
| Tank name + single role name match | Uncommon | Tank named *Fury*, Commander named Collier |
| Tank name + two crew name match | Rare | *Fury* + Collier + Trini |
| Tank name + full crew name match | Legendary | All five *Fury* crew names on the right tank |
| Personality + charm type match | Rare | The Faithful receiving a rosary with a missing bead |
| Nickname + archetype irony match | Uncommon | The Dark Comedian nicknamed "Padre" |
| Driver + Asst. Driver famous pair | Rare | Named historical tank crew pairing |

### 15.3 The Fury Easter Egg
If the tank is named **Fury** and all five crew members generate names matching the film's characters (Don "Wardaddy" Collier, Boyd "Bible" Swan, Grady "Coon-Ass" Travis, Trini "Gordo" Garcia, Norman Ellison), a **Legendary discovery** fires:

> *The Field Journal records it quietly. No fanfare. Just the names, the tank, and the date.*
> *You've been here before.*

This is the lowest-probability combination in the game. It may never happen in a given player's lifetime of runs. The Journal tracks whether it ever has.

### 15.4 Other Discovery Examples

**Famous historical tank names + role:**
- Tank *Thunderbolt* + Commander with the right surname → brief acknowledgment of Creighton Abrams
- Tank *Cobra King* → first to reach a besieged position in a Bulge anchor event triggers a historical note

**Personality + charm discoveries:**
- *The Faithful* receives a **Legendary** charm (rosary, bible page, prayer card) → a unique quote fires that doesn't appear anywhere else in the game; Field Journal entry titled "He kept it the whole way"
- *The Dark Comedian* receives a charm named "Last Cigarette" → unique quote on every subsequent near-death event

**Crew relationship discoveries:**
- Two crew members with the same last name (randomly generated coincidence) → one event fires where another character notices; "You two related?" No mechanical effect. Just a moment.
- A crew member nicknamed "Lucky" who survives the entire campaign → Field Journal entry on campaign end. Just their name and "Made it."

### 15.5 Discovery Presentation
Discoveries are never announced loudly. They surface as:
- A slightly different crew quote — same voice, different weight
- A Field Journal entry that appears after the session
- Occasionally: a single italicized line in the event text that wouldn't be there otherwise

The game doesn't say "YOU FOUND AN EASTER EGG." It just happens differently than it normally would. Players who notice, notice.

---

Items acknowledged but deferred:
- Illustrated event cards
- Alternate theaters (Pacific, North Africa)
- Full charm codex UI beyond current list + discoveries journal tab
- Expanded famous combination database beyond Wave 11 seed list
- Communication limits playtesting and tuning

*Shipped (no longer deferred): Tank type selection (v0.5), Full foot event table (v0.5), Narrative Depth schema + event rewrites + npc_conversation events (v0.6), Narrative Immersion stakes fields (v0.7), Discovery catalog + charm expansion + Wave 9 prose pass (v0.8), Tank-type combat mods + defensive/offensive posture rules (v0.9), Wave 11 solo content II (v0.10–v0.11), Wave 12 encounter scale — campaign dedupe, expanded pools, §2.9 replay targets (v0.12), Wave 13 content scale III — 100+ procedural pool, kind buckets/quotas, foot shuffle, coverage tests (v0.13), Wave 14 rank mechanics v2 — command succession, acting HUD, journal discoveries, rank-friction NPCs (v0.14), Wave 15 campaign UI polish — status bar, tank/crew panel, situation log, qualitative risk telegraph, outcome aftermath summary (v0.15), Wave 16 replay depth II — Tier-2 filler pool, encounter follow-up phases (§2.11) (v0.16), Wave 17 calendar immersion — fictional weekday/date in mission overview, season-env matrix enforcement (§2.10) (v0.17), Wave 18 solo content III — anchors/social/briefings/Tier-1 expansion to long-term §2.9 targets (v0.18)*

---

## 16. COOPERATIVE PLAY (2–5 PLAYERS)

Cooperative play activates when two or more players are present. Each player owns one crew role. All solo mechanics remain intact — coop layers additional systems on top.

### 16.1 Role Ownership
Each player selects or is assigned a crew role at campaign start. In a 2–3 player game, some players own multiple roles. The player owning the most roles is the **de facto Commander** for shared decisions if no Commander role is assigned.

Salvage pool spending is a **group decision** — the Commander player has final say in the event of disagreement. This is intentional. The responsibility of command is real.

### 16.2 Asymmetric Role Powers
In coop, each role gains a **once-per-mission active ability** that does not exist in solo play. These reward role identity and create meaningful differentiation.

| Role | Coop Ability | Effect |
|---|---|---|
| **Commander** | *Press the Attack* | Re-roll one combat dice result this mission; must accept the second roll |
| **Gunner** | *Called Shot* | Declare a specific tank component as target; on success, that component is destroyed rather than random damage |
| **Driver** | *Terrain Read* | Before a travel event resolves, preview one element of the outcome (terrain type, hazard present) |
| **Asst. Driver** | *Suppressing Fire* | During one infantry event, automatically prevent an AT threat from firing this turn |
| **Loader / Medic** | *Quick Load* | Once per mission, ignore the ammo-type penalty for a mismatched round; the shot goes anyway |

### 16.3 Hidden Personal Objectives
At the start of each mission, each player draws a **personal objective** — a secret goal that may or may not align with the group's mission objective. These are revealed only at mission end.

Personal objectives add tension, moral weight, and occasional player conflict. They are never game-ending by default, but player choices pursuing them can create pressure.

**Objective examples:**

| Objective | Conflict Potential | Note |
|---|---|---|
| *Keep [specific crew member] alive this mission* | Low — likely aligned | Becomes high if that crew member needs to take a fatal risk |
| *Don't fire on a retreating enemy* | Moderate | Gunner may want the kill; Commander may need it for safety |
| *Reach the objective without using WP rounds* | Low–Moderate | Limits tactical options in infantry combat |
| *Don't spend any salvage this stop* | Moderate | Directly conflicts with group upgrade decisions |
| *Ensure the tank takes no component damage* | High | May require conservative play that costs the mission |
| *Get [crew member] a charm this mission* | Low | Minor tension, mostly a personal investment moment |

**Conflicting objectives** can exist in the same mission — two players with goals that pull in opposite directions. The game permits this. It does not prevent it. The tension is intentional. A game where two players are quietly working at cross-purposes — neither sabotaging, both trying to do what they believe is right — is a more honest war game than one that sanitizes disagreement.

**Resolution:** At mission end, players reveal their objectives. Met objectives grant a small salvage bonus. Unmet objectives cost nothing mechanical — but the Journal records them. Over time, a player who consistently fails their personal objectives accumulates a quiet narrative of what their crew member couldn't do.

### 16.4 Communication Limits (Optional Rule)
Inspired by The Grizzled's no-direct-communication rule. When enabled:
- Players may not directly state the contents of their hand or current resource counts
- They may hint, suggest, or react — but not declare
- This rule is recommended for experienced groups only; it is brutal on first play

---

*End of IRON ROAD Specification v0.18*
