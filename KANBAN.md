# Iron Road — Build Kanban

> Spec reference: [IRON_ROAD_SPEC.md](IRON_ROAD_SPEC.md)  
> Architecture: [README.md](README.md)

---

## Done

### Platform & loop
- [x] **Web app scaffold** — Vite/React/TS, dark UI, keyboard 1–4 choices [`src/ui/GameRoot.tsx`](src/ui/GameRoot.tsx)
- [x] **Pure engine reducer** — seeded FNV RNG, d10 + tier bands §7.1 [`src/engine/reducer.ts`](src/engine/reducer.ts)
- [x] **Full solo campaign skeleton** — title → difficulty → crew reveal → briefing → days/events → debrief → between missions → end §2
- [x] **Difficulty tables** — Green/Veteran/Fury mission counts, event ranges, anchor counts §2.2–2.3 [`src/engine/config.ts`](src/engine/config.ts)
- [x] **Season phase + day environment picker** — summer/autumn/winter/spring pools §2.4, §6.3 [`src/engine/generator.ts`](src/engine/generator.ts)
- [x] **Local save** — Zustand + `localStorage` [`src/store/gameStore.ts`](src/store/gameStore.ts)
- [x] **Static deploy path** — `npm run build` → `dist/`, Netlify config [`netlify.toml`](netlify.toml)
- [x] **Tests** — dice tiers, generator golden, reducer flow, Zod catalog validation

### Content (thin MVP — now significantly expanded, see Wave 6/7/ND entries below)
- [x] **~20 event templates** — all major event kinds represented §6.1 *(now 60+ events including npc_conversation kind)*
- [x] **7 historical anchors + 1 elite stub + 3 foot beats** §2.6, §8.2 *(now 10 anchors, 5 elites, 10 foot beats — see Wave 7-B + Phase 1)*
- [x] **Name/tank pools** — subset of spec §12 [`src/content/pools.ts`](src/content/pools.ts)

### Systems (stubbed — types/effects exist, mechanical logic incomplete)
- [x] **Crew generation** — 15 archetypes assigned, no quote engine §3.2–3.3
- [x] **Resources tracked** — ammo types, food, water, medkits §4.1
- [x] **Tank components + repair** — all 9 components, debrief repair action §5
- [x] **Trauma/charm/journal/seed effect ops** — in effects pipeline, not yet systemically triggered §3A, §3B
- [x] **Death → survivor covers role** — constitution penalty applied §9.2
- [x] **Foot mode** — 3 canned beats on hull=0%, skips debrief (fixed in Wave 1) §8.2

---

## Done (continued — Waves 1–5)

### Wave 1 — Core mechanics §3A, §4.3, §6.3, §10.2
- [x] **Trauma dice modifiers** — shellshocked −2, shaking −1, frozen forces worst choice, rage +1 §3A.2
- [x] **Constitution-gated trauma triggers** — post-event probabilistic trauma onset by constitution level §3A.1
- [x] **Crew support action** — once per event, +15–25 nerve, can clear minor trauma; forfeits supporter §3A.4
- [x] **Food/water attrition tick** — per-event HP + constitution drain when depleted §4.3
- [x] **Environment passive effects** — heat → water drain, blizzard → constitution, mud → track damage §6.3
- [x] **Seeded follow-up events** — flags inject follow-up events into the next mission §10.2
- [x] **Foot/debrief flow** — explicit no-depot narrative, replacement tank, stripped debrief after foot §8.2

### Wave 2 — Combat & campaign depth §4.2, §5, §7.2, §8.1, §9.1, §11.3
- [x] **Ammo type match bonus** — +2/−2 dice modifier when ideal ammo used/unavailable §4.2, §7.2
- [x] **Enemy difficulty modifiers** — `enemy` metadata on events, combat mod applied to dice §7.2
- [x] **Component cascade mods** — broken engine/tracks/gun affect driver/gunner dice §5
- [x] **`damage_random_component` effect** — hits roll which component takes damage §5
- [x] **Medkit healing** — loader-skill dice, 15–35 HP; wounded threshold constitution penalty §9.1
- [x] **Named scars** — `add_scar` effect; 3rd scar triggers death gamble §9.1a
- [x] **Brew-up survival rolls** — per-crew escape dice when tank hits 0%; burns, injuries §8.1
- [x] **Better debrief actions** — capped resupply, hull patch when nothing to repair, rest clears trauma §10.3
- [x] **Ending tone** — narrative branches on living crew count, solo survivor, hollow victory §11.3

### Wave 3 — Content & voice §3.3–3.4, §6, §10.2, §12
- [x] **Archetype quote engine** — `src/content/quotes.ts`; 6 moment types × 15 archetypes §3.3–3.4
- [x] **Expand event catalog** — 17 events (from ~9); 3 new combat types, scar event, social beats §6
- [x] **Between-mission social beats** — cards, letters, chaplain, rumors; fire after final debrief pick §10.2
- [x] **Expand name pools** — ~70 first names, ~40 last names, ~35 nicknames, ~28 tank names §12

### Wave 4 — Field Journal & discoveries §13, §3B, §14, §15
- [x] **Cross-campaign Field Journal** — `src/store/journalStore.ts`; separate `localStorage` key; crew fates, tank registry, moments §13
- [x] **Journal modal** — accessible from header; tabs for moments/crew/tanks; current campaign charms §13
- [x] **Charm use** — per-crew once-per-mission "Use charm"; archetype-keyed effects §3B
- [x] **Charm rarity catalog** — 9 charms across common/rare/elite; `rollCharmDrop` with event-type bias §14
- [x] **Famous combinations** — Fury tank/crew match, Lucky survivor, Cobra King; quiet journal entry §15

### Wave 5 — Polish & ship
- [x] **Mobile layout pass** — 44px+ touch targets, larger fonts on narrow screens, responsive flex
- [x] **Continue vs New run UX** — title screen shows Continue with tank/mission info; confirms overwrite
- [x] **Preserve session on Main menu** — `ABANDON_TO_TITLE` now preserves campaign state, restores exact `meta`
- [x] **CI** — GitHub Actions: type-check + test + build on push/PR (`.github/workflows/ci.yml`)

### Wave 6 — Economy, salvage catalog, scar system, social beats, PWA
- [x] **Salvage upgrade catalog** — ammo bundle, WP round, armor patch, field rations, intel brief (debrief actions) §10.3
- [x] **Charm drops after elite/anchor events** — deterministic seeded `rollCharmDrop` §14
- [x] **Scar dice modifiers** — `rolePenalty` on scar stored, applied in `applyChoice` §9.1a
- [x] **Loader ammo doctrine bonus** — optional `+1` when loader recommends ammo §4.2
- [x] **Interactive social beats** — `social_cards/letters/chaplain/rumor` with narrative + choice + outcome §10.2
- [x] **Tank replacement event** — `tank_replace_fork` with depot/capture/human moment branches §8.3
- [x] **Full foot event table** — 10 foot beats covering woods/fields/lines/bridge/sniper/farm/checkpoint/ditch/dog/gate §8.2
- [x] **PWA scaffold** — `manifest.webmanifest`, `sw.js` (network-first), service worker registration §1003
- [x] **Wave 6 tests** — `reducer.wave6.test.ts` covering trauma mods, doctrine bonus, attrition, seeded follow-ups

### Phase 1 — Choice overhaul
- [x] **All 7 original anchor events** expanded to 2–3 choices (commander/driver/loader angles) *(3 more anchors added in Wave 7-B, each authored with 3 choices)*
- [x] **All 10 foot beats** expanded to 2–3 choices (risk vs cautious branch)
- [x] **12 generic narrative/supply/rest events** expanded to 3 choices each
- [x] **10 generic combat/infantry/defensive events** expanded to 3–4 choices each
- [x] **3 elite encounters** expanded to 3 choices (aggressive/defensive/clever); `elite_night_ambush_stub` enemy metadata added
- [x] **4 social beats** expanded to 3 choices each (third crew voice per beat)

### Phase 2 — Balance pass
- [x] **`eventsPerDay` wired** — generator now builds per-day counts from `eventsPerDayMin/Max`, preventing 1-event days
- [x] **Salvage rebalance** — ammo bundle 2→3, intel brief 6→4, free resupply top-up reduced (AP +4→+2, HE +5→+3)
- [x] **`debriefPicks` per difficulty** — Green=2, Veteran=3, Fury=3; field added to `DifficultyProfile`

### Phase 3 — KANBAN refresh *(prior pass)*

### Phase 4 — PWA polish
- [x] **SVG icons 192×192 + 512×512** — iron-cross design in amber/dark palette; `public/icon-192.svg`, `public/icon-512.svg`
- [x] **Manifest updated** — `public/manifest.webmanifest` now references both icon sizes with `any maskable` purpose
- [x] **Cache-first service worker** — `public/sw.js` v2: precaches shell on install, cache-first for `/assets/` hashed bundles, network-first for navigation

### Phase 5 — Tank type selector §1003
- [x] **`pick_tank` phase** — inserted between `pick_difficulty` and `crew_reveal` in campaign flow [`src/ui/GameRoot.tsx`](src/ui/GameRoot.tsx)
- [x] **Three tank types** — Sherman M4A3 / Churchill IV / T-34/85 each with distinct `startHealthPct`, `componentBonus`, ammo loadout deltas [`src/engine/config.ts`](src/engine/config.ts)
- [x] **`TankType` field on `GameState`** — `"sherman" | "churchill" | "t34"` tracked for future mechanical use [`src/engine/types.ts`](src/engine/types.ts)

### Phase 6 — Co-op scaffold §16
- [x] **`CoopSeat` type + `seats` on `GameState`** — optional array mapping playerIds to roles [`src/engine/types.ts`](src/engine/types.ts)
- [x] **`ASSIGN_ROLE` action** — updates seat list; sets `localPlayerId` on first assignment [`src/engine/reducer.ts`](src/engine/reducer.ts)
- [x] **Role-ownership guard in `applyChoice`** — no-op when acting role belongs to a different player seat

---

## Done — Wave 7 (Archetype differentiation, new content, dynamic scars, condition warnings)

### Wave 7-A — Archetype mechanical differentiation
- [x] **`archetypeTraumaGuard` helper** — per-archetype trauma gate in `reducer.ts`
- [x] **The Kid** — Frozen threshold lowered to constitution < 25; constitution decay/recovery rate ×1.5
- [x] **The Veteran** — Frozen blocked until constitution ≤ 10; Numb duration extended
- [x] **The Dark Comedian** — Grief-Struck constitution hit doubled
- [x] **The Pragmatist** — Trauma suppressed until constitution ≤ 15, then multi-fire

### Wave 7-B — New event content
- [x] **3 new historical anchors** — `anchor_seine_crossing`, `anchor_cologne`, `anchor_ve_day` (3 choices each)
- [x] **2 new elite encounters** — `elite_remagen`, `elite_tiger_wallendorf` (3–4 choices each)
- [x] **4 new social beats** — `social_drunk`, `social_found_item`, `social_new_arrival`, `social_dog_returns`

### Wave 7-C — Dynamic scar naming
- [x] **`SCAR_NAME_POOLS`** — 5 categories × 6+ names in `pools.ts`
- [x] **`drawScarName` helper** — seeded draw in `effects.ts`
- [x] **`scarCategory` on `add_scar` effect** — optional field; name drawn at runtime when present

### Wave 7-D — Compound condition warnings
- [x] **`conditionWarning` helper** — checks dangerous environment × state pairs in `reducer.ts`
- [x] **Day-intro warning display** — amber italic line when compound risk detected in `GameRoot.tsx`

---

## Done — Narrative Depth (atmosphere, NPC dialogue, event rewrites, npc_conversation events)

### Schema + renderer
- [x] **nd-schema** — `atmosphere`, `preChoiceNpc`, `dialogueLine`, `npcReply`, `flavorOnly` added to `RuntimeEvent`/`EventChoice` types and Zod schema; `npc_conversation` added to `EventKind`
- [x] **nd-reducer** — `flavorOnly` choices skip dice + effects, go straight to outcome step
- [x] **nd-ui** — `atmosphere` renders as italic muted paragraph; `preChoiceNpc` renders as gold-bordered speech block; `dialogueLine` renders before outcome; `npcReply` renders as reply block; CSS classes added to `index.css`

### Briefings rewritten
- [x] **nd-briefings** — `briefing_generic` rewritten with atmosphere + preChoiceNpc; 3 new variants added (`briefing_attack`, `briefing_defense`, `briefing_pursuit`) with CO dialogue; generator randomly picks one per mission

### Event content
- [x] **nd-events-rewrite** — 12 events rewritten (`gen_travel_fork`, `gen_human_letters`, `gen_human_watch`, `gen_rest_coffee`, `gen_rest_smoke`, `gen_supply_risk`, `gen_supply_black_market`, `gen_radio_squeal`, `gen_travel_bridge_down`, `gen_travel_mine`, `gen_officer_roadblock`, `foot_farm`, `foot_checkpoint`, `foot_dog`) with atmosphere, two-paragraph narratives, dialogueLine, preChoiceNpc, npcReply
- [x] **nd-npc-events** — 10 new `npc_conversation` events written and added to `GENERIC_POOL`: `npc_local_woman`, `npc_local_kids`, `npc_officer_orders`, `npc_replacement_depot`, `npc_other_crew`, `npc_medic_check`, `npc_war_correspondent`, `npc_prisoner_moment`, `npc_padre_field`, `npc_old_farmer`
- [x] **nd-social-enrich** — 4 existing social beats (`social_cards`, `social_letters`, `social_chaplain`, `social_rumor`) enriched with atmosphere, preChoiceNpc (chaplain), richer outcome prose, and dialogueLines

---

## Done — Next Steps (engine polish)

- [x] **Performance pass** — `CrewTag` / `Hud` / `CharmButtons` memoized; stable style constants [`src/ui/GameRoot.tsx`](src/ui/GameRoot.tsx)
- [x] **Solo role abilities (subset §16.2)** — Driver Terrain Read, Asst. Driver Suppressing Fire; `USE_ROLE_ABILITY` + UI
- [x] **Quote libraries** — 6 lines × 6 moments × 15 archetypes; contextual `pickOutcomeMoment`
- [x] **Charm drops §14.2** — tier weights by event kind (infantry, tank, elite, legendary NPC)
- [x] **Charm moments §14.3** — `tryCharmMoment`, mission-complete journal beats

---

## Done — Wave 8 (Narrative Immersion)

- [x] **Stakes schema** — `stakes`, `stakesNote`, `tierFlavor`, `choiceRisk`, `choiceHint` in types + Zod [`src/engine/types.ts`](src/engine/types.ts), [`src/engine/schema.ts`](src/engine/schema.ts)
- [x] **Tier flavor in reducer** — `tierFlavor[tier]` appended in `applyChoice` when dice resolve
- [x] **Stakes UI** — banners, risk tags, hints, roll modifiers, hull tag on critical combat [`src/ui/GameRoot.tsx`](src/ui/GameRoot.tsx), [`src/index.css`](src/index.css)
- [x] **Catalog immersion patch** — [`src/content/immersion.ts`](src/content/immersion.ts) applies defaults + rich overrides to all catalog entries at load
- [x] **Batch A/B/C content** — anchors, elites, combat, foot, social, and remaining events get atmosphere, stakes, tier flavor, choice hints
- [x] **Tests** — [`src/content/eventsCatalog.test.ts`](src/content/eventsCatalog.test.ts), [`src/engine/reducer.immersion.test.ts`](src/engine/reducer.immersion.test.ts)

---

## Done — Wave 9 (Solo Content Depth)

- [x] **Discovery catalog** — [`src/content/discoveries.ts`](src/content/discoveries.ts); `discovery_stub` resolves prose; expanded `findFamousDiscoveries`
- [x] **Prose pass** — atmosphere/stakes/tierFlavor on 15 high-frequency GENERIC_POOL events; legendary NPC beat `legendary_sergeant_york_moment`
- [x] **Charm expansion** — 8 new charms + `legendary` rarity; `rollCharmDrop` legendary_npc tier; journal charms codex tab
- [x] **Quote depth** — expanded priority archetype lines; outcome quotes append to `narrativeLog` from reducer
- [x] **Tests** — [`src/engine/reducer.discovery.test.ts`](src/engine/reducer.discovery.test.ts)

---

## Done — Wave 10 (Solo Mechanical Identity)

- [x] **Tank profiles aligned to spec** — 75/90/65% hull; Churchill +1 component mitigation; T-34 AP-heavy [`src/engine/config.ts`](src/engine/config.ts)
- [x] **componentBonus in effects** — seeded mitigation on `damage_random_component` [`src/engine/effects.ts`](src/engine/effects.ts)
- [x] **Tank-type dice mods** — Churchill slow travel (driver); T-34 gunner tank combat bonus [`src/engine/reducer.ts`](src/engine/reducer.ts)
- [x] **Posture rules** — defensive stand sustained constitution drain; offensive assault tier cost/reward
- [x] **UI** — tank picker hull/passive; in-mission HUD tag [`src/ui/GameRoot.tsx`](src/ui/GameRoot.tsx)
- [x] **Tests** — [`src/engine/reducer.tankType.test.ts`](src/engine/reducer.tankType.test.ts)

---

## Done — Wave 11 (Solo Content II)

- [x] **Crew HUD role labels** — `formatRole` on in-mission `CrewTag` [`src/ui/GameRoot.tsx`](src/ui/GameRoot.tsx)
- [x] **Quote depth** — 8+ lines per archetype × moment; [`src/content/quotes.test.ts`](src/content/quotes.test.ts)
- [x] **Discovery expansion** — catalog entries, `findFamousDiscoveries`, charm pairing, campaign-end Lucky; [`src/content/discoveries.ts`](src/content/discoveries.ts), [`src/engine/reducer.discovery.test.ts`](src/engine/reducer.discovery.test.ts)
- [x] **Foot + social prose** — 8 foot beats + 4 social beats with §6.2 anatomy; [`src/content/eventsCatalog.ts`](src/content/eventsCatalog.ts), [`src/content/immersion.ts`](src/content/immersion.ts)
- [x] **Pool/NPC immersion** — combat choice voice + NPC stakes; catalog tests [`src/content/eventsCatalog.test.ts`](src/content/eventsCatalog.test.ts)
- [x] **Journal discoveries tab** — run + cross-campaign `kind: "discovery"` entries [`src/ui/GameRoot.tsx`](src/ui/GameRoot.tsx)
- [x] **Spec v0.10** — [`IRON_ROAD_SPEC.md`](IRON_ROAD_SPEC.md)

---

## Done — Crew rank (cosmetic v1)

- [x] **`CrewRank` + role pools** — Pvt. through 2nd Lt.; seeded at generation [`src/content/ranks.ts`](src/content/ranks.ts)
- [x] **HUD + reveal + journal roster** — rank on `CrewTag`, crew reveal, support UI, cross-campaign crew tab [`src/ui/GameRoot.tsx`](src/ui/GameRoot.tsx)
- [x] **Save migration** — backfill `rank` on load [`src/engine/reducer.ts`](src/engine/reducer.ts)
- [x] **Tests** — [`src/content/ranks.test.ts`](src/content/ranks.test.ts)
- [x] **Spec v0.11** — §3.2a rank table, succession/journal hooks documented [`IRON_ROAD_SPEC.md`](IRON_ROAD_SPEC.md)

---

## Done — Replay variety assessment (Wave 12 planning)

- Documented gap: **42** `GENERIC_POOL` fillers, **10** anchors, heavy reuse on Veteran/Fury; no campaign dedupe before Wave 12 — see spec **§2.9**

---

## Done — Wave 12 (Encounter scale and replay)

- [x] **Spec §2.9 + v0.12** — pool targets, replay metrics, anchor-once-per-campaign [`IRON_ROAD_SPEC.md`](IRON_ROAD_SPEC.md)
- [x] **Campaign dedupe** — filler/anchor decks + `socialBeatQueue` [`src/engine/generator.ts`](src/engine/generator.ts), [`src/engine/reducer.ts`](src/engine/reducer.ts)
- [x] **Generator tests** — unique anchors, filler diversity [`src/engine/generator.test.ts`](src/engine/generator.test.ts)
- [x] **Content tranche A** — +18 `GENERIC_POOL` events (6 travel / 6 human+NPC / 6 combat)
- [x] **Content tranche B** — +2 anchors, +4 social beats, +7 objectives
- [x] **README** — pool sizes + diversity test note [`README.md`](README.md)

---

## Done — Wave 13 (Content scale III)

- [x] **poolKinds.ts** — tagged buckets; `GENERIC_POOL` union; [`src/content/poolKinds.test.ts`](src/content/poolKinds.test.ts)
- [x] **Generator polish** — per-mission travel/human/elite soft quotas; `measureFillerCoverage`; `buildFootBeatIds` seeded foot order [`src/engine/generator.ts`](src/engine/generator.ts), [`src/engine/reducer.ts`](src/engine/reducer.ts)
- [x] **Content** — [`src/content/wave13Events.ts`](src/content/wave13Events.ts): +40 `GENERIC_POOL`, +6 anchors, +4 social, +2 briefings, +8 objectives
- [x] **Immersion** — choiceRisk partials for high-frequency Wave 13 combat ids [`src/content/immersion.ts`](src/content/immersion.ts)
- [x] **Spec v0.13 + tests** — pool ≥100, anchors ≥18, coverage/kind-mix tests [`IRON_ROAD_SPEC.md`](IRON_ROAD_SPEC.md), [`src/engine/generator.test.ts`](src/engine/generator.test.ts)

---

## Done — Wave 14 (Rank mechanics v2)

- [x] **`resolveVoiceLeader`** — `{cmd}` voice, quotes, acting HUD tag [`src/content/ranks.ts`](src/content/ranks.ts), [`src/engine/template.ts`](src/engine/template.ts), [`src/content/quotes.ts`](src/content/quotes.ts)
- [x] **Succession side effects** — `commanderEverKia`, succession log on first KIA [`src/engine/effects.ts`](src/engine/effects.ts)
- [x] **Journal** — `acting_commander_led`, `senior_nco_full_crew` [`src/content/discoveries.ts`](src/content/discoveries.ts)
- [x] **Content** — 3 rank-friction NPC events [`src/content/wave14Events.ts`](src/content/wave14Events.ts)
- [x] **Spec v0.14** — §3.2a succession shipped [`IRON_ROAD_SPEC.md`](IRON_ROAD_SPEC.md)

---

## Done — Wave 15 (Campaign UI polish)

- [x] **Qualitative risk telegraph** — `deriveRiskTags`, immersion enrich, `ChoiceList` chips; no numeric hints/mods on choose buttons [`src/engine/riskTelegraph.ts`](src/engine/riskTelegraph.ts), [`src/ui/ChoiceList.tsx`](src/ui/ChoiceList.tsx)
- [x] **Campaign status bar** — mission/day/weather/time phase, supply alerts, `uiAlert` [`src/ui/campaignStatus.ts`](src/ui/campaignStatus.ts), [`src/ui/CampaignStatusBar.tsx`](src/ui/CampaignStatusBar.tsx)
- [x] **Tank & crew panel** — cards + hull/resources layout [`src/ui/TankCrewPanel.tsx`](src/ui/TankCrewPanel.tsx)
- [x] **Outcome aftermath** — `pendingOutcome` snapshots, `OutcomePanel` numeric summary [`src/engine/outcomeSummary.ts`](src/engine/outcomeSummary.ts), [`src/ui/OutcomePanel.tsx`](src/ui/OutcomePanel.tsx)
- [x] **Situation log** — `ActivityFeed` + feed categories from `narrativeLog` / discoveries [`src/ui/ActivityFeed.tsx`](src/ui/ActivityFeed.tsx)
- [x] **Play layout** — `PlayShell` grid in [`src/ui/GameRoot.tsx`](src/ui/GameRoot.tsx), CSS in [`src/index.css`](src/index.css)
- [x] **Spec v0.15** — §12A presentation, §2.8 risk telegraph [`IRON_ROAD_SPEC.md`](IRON_ROAD_SPEC.md)

---

## Done — Wave 16 (Replay depth II + encounter depth)

- [x] **`GENERIC_POOL_TIER2`** — separate tier-2 buckets in [`src/content/poolKinds.ts`](src/content/poolKinds.ts); disjoint from Tier-1; `isTier2Filler`
- [x] **Content** — [`src/content/wave16Events.ts`](src/content/wave16Events.ts): +46 Tier-2 procedural events (travel/supply/human/npc/combat/elite mix)
- [x] **Two-deck generator** — Tier-1 then Tier-2 in [`src/engine/generator.ts`](src/engine/generator.ts); updated campaign log copy; `measureFillerCoverage` tier breakdown
- [x] **Encounter follow-up phases** — `react` / `followup_choose`, `pendingEncounter`, `SAVE_VERSION` 2 — [`src/engine/encounterFlow.ts`](src/engine/encounterFlow.ts), [`src/engine/reducer.ts`](src/engine/reducer.ts), [`src/ui/GameRoot.tsx`](src/ui/GameRoot.tsx)
- [x] **Depth content patch** — [`src/content/encounterDepth.ts`](src/content/encounterDepth.ts): Tier-2 + 25 Tier-1 retrofit ids with `followUpChoices`
- [x] **Tests** — generator, poolKinds, eventsCatalog depth, [`src/engine/reducer.encounterDepth.test.ts`](src/engine/reducer.encounterDepth.test.ts)
- [x] **Immersion hotspots** — scoped `IMMERSION_RICH` for key Wave 16 combat/travel ids in [`src/content/immersion.ts`](src/content/immersion.ts)
- [x] **Spec v0.16** — §2.9 Tier-2, §2.11 encounter depth, §2.10 calendar deferred [`IRON_ROAD_SPEC.md`](IRON_ROAD_SPEC.md)

---

## Done — Wave 17 (Calendar immersion)

- [x] **`deriveCampaignCalendar`** — weekday, fictional date, time-of-day in [`src/engine/campaignCalendar.ts`](src/engine/campaignCalendar.ts)
- [x] **Mission overview UI** — calendar tags in [`src/ui/CampaignStatusBar.tsx`](src/ui/CampaignStatusBar.tsx); [`buildCampaignStatus`](src/ui/campaignStatus.ts) integration
- [x] **Season ↔ environment** — `ENVIRONMENT_SEASONS` matrix, generator guard, Fury campaign scan tests
- [x] **Spec v0.17** — §2.10 shipped [`IRON_ROAD_SPEC.md`](IRON_ROAD_SPEC.md)

---

## Done — Wave 18 (Solo Content III)

- [x] **Content** — [`src/content/wave18Events.ts`](src/content/wave18Events.ts): +2 anchors, +2 elites, +4 social, +2 briefings, +15 Tier-1 procedural
- [x] **Pool registration** — `WAVE18_POOL_KIND_BUCKETS`, `applyWave18PoolRegistration`; anchors in [`pools.ts`](src/content/pools.ts); social in `SOCIAL_BEAT_POOL`; briefings in generator
- [x] **Immersion** — scoped `IMMERSION_RICH` for Wave 18 anchor/elite/combat ids [`src/content/immersion.ts`](src/content/immersion.ts)
- [x] **Tests** — catalog thresholds: anchors ≥20, social ≥20, Tier-1 ≥115 [`src/content/eventsCatalog.test.ts`](src/content/eventsCatalog.test.ts)
- [x] **Spec v0.18** — §2.9 pool table [`IRON_ROAD_SPEC.md`](IRON_ROAD_SPEC.md)

---

## Done — Wave 19 (Solo release maturity)

- [x] **Trauma v2 (§3A)** — Jumpy forced choice, Thousand-yard quote silence, Checked out blocks support, Numb blocks recovery, Breaking 50% unreliable, Rage judgment penalty, Faithful moral-weight triggers [`src/engine/trauma.ts`](src/engine/trauma.ts), [`src/engine/reducer.trauma.test.ts`](src/engine/reducer.trauma.test.ts)
- [x] **Prose lint (§2.10)** — [`src/content/catalogProseLint.test.ts`](src/content/catalogProseLint.test.ts)
- [x] **Solo hidden objectives (§16.3 adapted)** — draw/reveal per mission, salvage bonus, journal [`src/content/personalObjectives.ts`](src/content/personalObjectives.ts), [`src/engine/hiddenObjectives.ts`](src/engine/hiddenObjectives.ts), HUD in [`src/ui/GameRoot.tsx`](src/ui/GameRoot.tsx)
- [x] **Milestone achievements** — catalog + cross-campaign unlocks + Journal tab [`src/content/achievements.ts`](src/content/achievements.ts), [`src/store/journalStore.ts`](src/store/journalStore.ts)
- [x] **Charm codex + discoveries** — discovered/undiscovered codex rows; expanded discovery catalog [`src/content/discoveries.ts`](src/content/discoveries.ts)
- [x] **Content Wave 19** — [`src/content/wave19Events.ts`](src/content/wave19Events.ts): +11 Tier-1, +10 Tier-2, +1 anchor, +1 social, +1 briefing; combined pool ≥180
- [x] **SAVE_VERSION 3** — trauma/objective tracker fields [`src/engine/types.ts`](src/engine/types.ts)
- [x] **Spec v0.19** — [`IRON_ROAD_SPEC.md`](IRON_ROAD_SPEC.md)

---

## Done — Wave 20 (Solo polish)

- [x] **Prose lint extended** — atmosphere length, outcomeText, pool choice count, placeholder guards [`src/content/catalogProseLint.test.ts`](src/content/catalogProseLint.test.ts)
- [x] **Curated Wave 19 encounter depth** — themed `reactionBeat` + follow-ups on 10 hotspot ids [`src/content/wave19Events.ts`](src/content/wave19Events.ts)
- [x] **Event discoveries** — Münster, censor line, halftrack first shot, church bell; Fury legendary full combo [`src/content/discoveries.ts`](src/content/discoveries.ts), [`src/content/charms.ts`](src/content/charms.ts)
- [x] **Achievements expanded** — veteran, no breaking, objectives, discoveries, Münster [`src/content/achievements.ts`](src/content/achievements.ts)
- [x] **Achievement → discovery wire** — `five_objectives_met` journal entry on unlock [`src/store/journalStore.ts`](src/store/journalStore.ts)
- [x] **Tests** — depth flow, achievements, discoveries
- [x] **Spec v0.20** — [`IRON_ROAD_SPEC.md`](IRON_ROAD_SPEC.md)

---

## Next

- Solo release playtest pass on mobile/PWA
- Optional: more discovery/achievement entries as content authors add beats

---

## Backlog — Solo spec, later

- [ ] **Illustrated event cards** (spec deferred §1003)
- [ ] **Alternate theaters** — Pacific, North Africa (spec deferred §1003)

---

## Backlog — Co-op (after solo release)

- [ ] **Role ownership + multi-seat UI** §16.1
- [ ] **Remaining role abilities** §16.2 — Commander, Gunner, Loader (solo subset shipped: Driver, Asst. Driver)
- [ ] **Per-player hidden objectives** §16.3 (solo pool exists; extend for seats)
- [ ] **Optional communication limits** §16.4

---

## Deferred (spec §1003 — track only, not v1)

- Illustrated event cards
- Alternate theaters (Pacific, North Africa)
- Communication limits playtesting
