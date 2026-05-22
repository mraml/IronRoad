import type { Effect, EventChoice, RuntimeEvent, StakesLevel, TierFlavorMap } from "../engine/types";

const COMBAT_TIER_FLAVOR: TierFlavorMap = {
  1: "The dice go cold. Metal finds you anyway — a hit you feel in your teeth.",
  2: "Messy work. You survive it, but the tank and the crew remember.",
  3: "Good enough. Nobody cheers. Everybody breathes.",
  4: "Rare clean execution. For a moment the war feels survivable.",
};

const CRITICAL_TIER_FLAVOR: TierFlavorMap = {
  1: "Near disaster. Someone should be dead. Someone might still be.",
  2: "You hold the line by inches. The cost shows up later.",
  3: "The moment breaks your way. Don't mistake luck for safety.",
  4: "History notices. The crew will talk about this one.",
};

function defaultStakes(
  kind: RuntimeEvent["kind"],
  useDice: boolean | undefined,
  catalogId: string,
): StakesLevel {
  if (catalogId.startsWith("foot_")) return "critical";
  if (kind === "historical_anchor" || kind === "elite_encounter") return "critical";
  if (
    useDice &&
    (kind === "tank_combat" ||
      kind === "infantry_combat" ||
      kind === "defensive_stand" ||
      kind === "offensive_assault")
  ) {
    return "elevated";
  }
  if (kind === "travel" && useDice) return "elevated";
  return "routine";
}

function defaultStakesNote(kind: RuntimeEvent["kind"], id: string): string | undefined {
  if (kind === "historical_anchor") {
    return "This beat writes into the campaign. Hull, nerve, and salvage all swing here — worth a table talk before anyone commits.";
  }
  if (kind === "elite_encounter") {
    return "Named engagement. A bad roll or the wrong ammo call can gut the hull or the crew.";
  }
  if (kind === "tank_combat") {
    return "Main-gun fight. Every round spent is gone; every hit on the hull stacks.";
  }
  if (kind === "infantry_combat" || kind === "defensive_stand") {
    return "Fausts and rifles don't respect armor. Suppress, break contact, or spend HE — disagree now, pay later.";
  }
  if (kind === "offensive_assault") {
    return "Push costs fuel, nerve, and bodies. Hold the column together or lose the objective.";
  }
  if (id.startsWith("foot_")) {
    return "On foot, one wrong move pins you or ends you. No hull to hide behind.";
  }
  if (id.startsWith("social_") || id === "tank_replace_fork") {
    return "The crew will remember what you decide here — morale and trust, not just salvage.";
  }
  return undefined;
}

function defaultAtmosphere(kind: RuntimeEvent["kind"], id: string): string | undefined {
  if (kind === "tank_combat") {
    return "Smoke hangs in the viewport glass. The intercom crackles with voices trying not to shake.";
  }
  if (kind === "infantry_combat" || kind === "defensive_stand") {
    return "Dirt and brass smell the same after a while. The treeline doesn't move — until it does.";
  }
  if (kind === "travel") {
    return "The road is what the war leaves behind when it passes through.";
  }
  if (kind === "supply") {
    return "Everything scarce has a price. Someone always pays it.";
  }
  if (kind === "rest") {
    return "Quiet is never empty out here — just waiting in a different shape.";
  }
  if (kind === "human_moment") {
    return "For a second the war forgets to shout.";
  }
  if (id.startsWith("foot_")) {
    return "No armor. No radio comfort. Just boots, breath, and whatever's ahead.";
  }
  return undefined;
}

function choiceRiskFromBonus(bonus: number | undefined): EventChoice["choiceRisk"] {
  if (bonus == null) return "tactical";
  if (bonus >= 2) return "cautious";
  if (bonus >= 1) return "tactical";
  if (bonus <= -1) return "aggressive";
  return "tactical";
}

function hintFromEffects(effects: Effect[]): string | undefined {
  const parts: string[] = [];
  for (const e of effects) {
    switch (e.op) {
      case "spend_ammo":
        parts.push(`Costs ${e.amount} ${e.ammo}`);
        break;
      case "mod_tank_health":
        if (e.delta < 0) parts.push(`Hull ${e.delta}%`);
        break;
      case "mod_hp":
        if (e.delta < 0) parts.push(`Crew HP ${e.delta}`);
        break;
      case "mod_constitution":
        if (e.delta < -5) parts.push(`Nerve ${e.delta}`);
        break;
      case "mod_all_constitution":
        if (e.delta < 0) parts.push(`All nerve ${e.delta}`);
        break;
      case "mod_resource":
        if (e.delta < 0) parts.push(`${e.key} ${e.delta}`);
        break;
      case "spend_salvage":
        parts.push(`Salvage −${e.amount}`);
        break;
      default:
        break;
    }
  }
  return parts.length > 0 ? parts.join(" · ") : undefined;
}

function enrichChoice(ch: EventChoice, _useDice: boolean): EventChoice {
  const out = { ...ch };
  if (!out.choiceRisk && !out.flavorOnly) {
    out.choiceRisk = choiceRiskFromBonus(out.modifierBonus);
  }
  if (!out.choiceHint && out.effects.length > 0 && !out.flavorOnly) {
    out.choiceHint = hintFromEffects(out.effects);
  }
  return out;
}

/** Per-event immersion overrides (Batch A/B rich authoring). */
type ImmersionRich = Partial<Omit<RuntimeEvent, "choices">> & {
  choices?: Partial<EventChoice>[];
};

const IMMERSION_RICH: Record<string, ImmersionRich> = {
  anchor_cobra: {
    atmosphere:
      "The horizon is dust and fire. The column moves like a single animal afraid of its own tail.",
    stakesNote:
      "Cobra is speed or suicide. Commander wants the corridor; Driver wants open road; Loader sees salvage in the wreckage.",
    tierFlavor: CRITICAL_TIER_FLAVOR,
    choices: [
      {
        id: "push",
        dialogueLine: "We stay on the column. If we fall off, we're dead in the ditch alone.",
        choiceRisk: "tactical",
      },
      {
        id: "flank_column",
        dialogueLine: "There's a parallel track. Less crowd. More unknown.",
        choiceRisk: "aggressive",
      },
      {
        id: "scavenge_chaos",
        dialogueLine: "We're burning fuel standing still. Let me pull what we can from the wrecks.",
        choiceRisk: "cautious",
      },
    ],
  },
  anchor_bulge: {
    atmosphere: "Snow erases distance. Every muzzle flash looks closer than it is.",
    stakesNote:
      "The Bulge junction: hold and bleed, or trade ground for lives. Gunner wants HE now; Driver wants ridgeline.",
    tierFlavor: CRITICAL_TIER_FLAVOR,
    useDice: true,
  },
  gen_combat_tiger_lite: {
    atmosphere:
      "A long hull shadow slides across the hedgerow gap. Sloped armor catches the light wrong.",
    stakesNote:
      "Tiger contact. AP and angle — or smoke and run. Gunner and Commander will not agree on which cowardice is worse.",
    tierFlavor: COMBAT_TIER_FLAVOR,
    choices: [
      {
        id: "flank_ap",
        dialogueLine: "Give me the flank. Load AP. I'm not dying in his kill zone.",
        choiceRisk: "aggressive",
      },
      {
        id: "smoke_wp",
        dialogueLine: "WP and break contact. Living tanks fight again.",
        choiceRisk: "cautious",
      },
      {
        id: "driver_flank",
        dialogueLine: "I'll take the angle. You shoot when I say when.",
        choiceRisk: "tactical",
      },
    ],
  },
  gen_infantry_treeline: {
    atmosphere: "Muzzle flashes stitch the treeline. Someone has a tube — maybe Faust, maybe fear.",
    stakesNote:
      "Infantry in the trees with AT threat. HE burns ammo; hull MG saves rounds; Driver's overrun gambles the tracks.",
    tierFlavor: COMBAT_TIER_FLAVOR,
  },
  foot_woods: {
    atmosphere: "The forest closes. Sound goes strange — too close, too far, all at once.",
    stakesNote: "Disoriented on foot. Push, go wide, or climb — each path has its own ambush.",
    stakes: "critical",
  },
  foot_bridge: {
    atmosphere: "The bridge groans. One crossing at a time. The water below doesn't care.",
    stakesNote: "Exposed crossing. Rush, crawl, or find another way — sniper math applies.",
    stakes: "critical",
  },
  elite_tiger_wallendorf: {
    stakesNote:
      "Wallendorf Tiger — village geometry favors him. This is the kind of fight crews tell stories about or don't tell at all.",
    tierFlavor: CRITICAL_TIER_FLAVOR,
  },
  anchor_rhine: {
    atmosphere: "The river is a line someone else drew. Engineers wave flags that mean nothing until they mean everything.",
    stakesNote: "Rhine crossing — engineers, timing, and hull on open ground. Commander and Driver own the call.",
    tierFlavor: CRITICAL_TIER_FLAVOR,
  },
  anchor_huertgen: {
    atmosphere: "The forest eats sound. Trees fall the wrong direction when the shells find them.",
    stakesNote: "Hürtgen — nerve and hull bleed in the green. There is no clean option, only expensive ones.",
    tierFlavor: CRITICAL_TIER_FLAVOR,
    useDice: true,
  },
  anchor_paris_skirt: {
    atmosphere: "Liberation smells like diesel and flowers left too long in the heat.",
    stakesNote: "Paris outskirts — speed vs discipline. The crew wants a story; the war wants discipline.",
  },
  anchor_siegfried: {
    atmosphere: "Concrete and wire. The line was built to make courage feel like a mistake.",
    stakesNote: "Siegfried Line — bunkers don't flinch. AP and nerve spend fast here.",
    tierFlavor: CRITICAL_TIER_FLAVOR,
    useDice: true,
  },
  anchor_push_germany: {
    atmosphere: "Every village looks the same after enough shelling — stone, smoke, and eyes in windows.",
    stakesNote: "Push into Germany — hold formation or chase wounded pride into an ambush.",
  },
  anchor_seine_crossing: {
    atmosphere: "Mud and diesel at the water's edge. The far bank might be friendly. Might not.",
    stakesNote: "Seine crossing — exposure is total. Debate who goes first and who covers.",
    tierFlavor: CRITICAL_TIER_FLAVOR,
    useDice: true,
  },
  anchor_cologne: {
    atmosphere: "Rubble channels the streets. A Panther in rubble is a nightmare with geometry on its side.",
    stakesNote: "Cologne — urban tank duel. One wrong corner costs the hull or the crew.",
    tierFlavor: CRITICAL_TIER_FLAVOR,
    useDice: true,
  },
  anchor_ve_day: {
    atmosphere: "Gunfire in the distance like a argument that won't end. The war is old. The crew is older.",
    stakesNote: "Final days — what you do here is what the Journal remembers. No take-backs.",
  },
  elite_night_ambush_stub: {
    atmosphere: "Darkness has weight. The treeline is a wall you can't read.",
    stakesNote: "Night ambush — visibility is a resource you don't have. HE or hold fire — decide together.",
    tierFlavor: CRITICAL_TIER_FLAVOR,
    useDice: true,
  },
  elite_stug_nest: {
    atmosphere: "A low silhouette in the hedgerow — hard to see, easy to die from.",
    stakesNote: "StuG nest — HEAT or flank. Gunner and Driver need one plan, not two.",
    tierFlavor: CRITICAL_TIER_FLAVOR,
    useDice: true,
  },
  elite_konkurs_column: {
    atmosphere: "King Tiger column. The road wasn't built for this much armor moving with intent.",
    stakesNote: "King Tiger column — AP discipline and nerve. This is salvage or burial.",
    tierFlavor: CRITICAL_TIER_FLAVOR,
    useDice: true,
  },
  elite_remagen: {
    atmosphere: "Bridge steel and river wind. Every second on the approach is a second someone watches.",
    stakesNote: "Remagen approach — SS rear-guard. Spend hull or spend time; rarely both.",
    tierFlavor: CRITICAL_TIER_FLAVOR,
    useDice: true,
  },
  tank_replace_fork: {
    stakesNote: "No hull — how you replace it defines the next mission. Depot, capture, or beg — choose as a crew.",
  },
  social_cards: {
    stakesNote: "Cards on a crate — money, pride, and boredom. Small stakes until someone makes them large.",
  },
  social_letters: {
    stakesNote: "Mail call — what you read aloud lands different than what you keep private.",
  },
  social_chaplain: {
    stakesNote: "The chaplain isn't here to judge. The crew still might.",
  },
  social_rumor: {
    stakesNote: "Rumors move faster than orders. What you repeat becomes true enough to hurt.",
  },
};

function mergeChoices(
  base: EventChoice[],
  overrides?: Partial<EventChoice>[],
): EventChoice[] {
  if (!overrides?.length) return base.map((c) => c);
  const byId = new Map(overrides.filter((c) => c.id).map((c) => [c.id!, c]));
  return base.map((c) => {
    const o = byId.get(c.id);
    return o ? { ...c, ...o, effects: c.effects } : c;
  });
}

export function applyImmersion(ev: RuntimeEvent, catalogId: string): RuntimeEvent {
  const rich = IMMERSION_RICH[catalogId] ?? IMMERSION_RICH[ev.id];
  const stakes = rich?.stakes ?? ev.stakes ?? defaultStakes(ev.kind, ev.useDice, catalogId);
  const useDice = rich?.useDice ?? ev.useDice;

  let tierFlavor = rich?.tierFlavor ?? ev.tierFlavor;
  if (!tierFlavor && useDice) {
    tierFlavor = stakes === "critical" ? CRITICAL_TIER_FLAVOR : COMBAT_TIER_FLAVOR;
  }

  const patched: RuntimeEvent = {
    ...ev,
    ...rich,
    id: ev.id,
    kind: ev.kind,
    narrative: rich?.narrative ?? ev.narrative,
    choices: mergeChoices(
      ev.choices.map((c) => enrichChoice(c, !!useDice)),
      rich?.choices as Partial<EventChoice>[] | undefined,
    ),
    stakes,
    stakesNote: rich?.stakesNote ?? ev.stakesNote ?? defaultStakesNote(ev.kind, catalogId),
    atmosphere: rich?.atmosphere ?? ev.atmosphere ?? defaultAtmosphere(ev.kind, catalogId),
    tierFlavor,
    useDice,
  };

  return patched;
}

export function patchEventCatalogImmersion(catalog: Record<string, RuntimeEvent>): void {
  for (const id of Object.keys(catalog)) {
    const ev = catalog[id];
    if (ev) catalog[id] = applyImmersion(ev, id);
  }
}
