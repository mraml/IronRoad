import { z } from "zod";

const RoleSchema = z.enum([
  "commander",
  "gunner",
  "driver",
  "asst_driver",
  "loader",
]);

const TraumaSchema = z.enum([
  "shellshocked",
  "frozen",
  "jumpy",
  "thousand_yard_stare",
  "shaking",
  "grief_struck",
  "rage",
  "checked_out",
  "numb",
  "breaking",
]);

const AmmoSchema = z.enum(["AP", "HE", "WP", "HEAT"]);

const TankComponentSchema = z.enum([
  "engine",
  "track_left",
  "track_right",
  "main_gun",
  "hull_mg",
  "radio",
  "optics",
  "hatch",
  "armor_front",
]);

const ComponentStatusSchema = z.enum(["ok", "damaged", "broken"]);

export const EffectSchema: z.ZodType<import("./types").Effect> = z.discriminatedUnion(
  "op",
  [
    z.object({ op: z.literal("mod_hp"), role: RoleSchema, delta: z.number() }),
    z.object({
      op: z.literal("mod_constitution"),
      role: RoleSchema,
      delta: z.number(),
    }),
    z.object({ op: z.literal("mod_all_constitution"), delta: z.number() }),
    z.object({ op: z.literal("add_trauma"), role: RoleSchema, trauma: TraumaSchema }),
    z.object({
      op: z.literal("clear_trauma"),
      role: RoleSchema,
      trauma: TraumaSchema,
    }),
    z.object({ op: z.literal("mod_tank_health"), delta: z.number() }),
    z.object({
      op: z.literal("set_component"),
      component: TankComponentSchema,
      status: ComponentStatusSchema,
    }),
    z.object({
      op: z.literal("spend_ammo"),
      ammo: AmmoSchema,
      amount: z.number(),
    }),
    z.object({
      op: z.literal("mod_resource"),
      key: z.enum(["medkits", "foodDays", "waterCanteens", "smallArmsMags"]),
      delta: z.number(),
    }),
    z.object({ op: z.literal("add_salvage"), amount: z.number() }),
    z.object({ op: z.literal("spend_salvage"), amount: z.number() }),
    z.object({ op: z.literal("seed_flag"), flag: z.string() }),
    z.object({
      op: z.literal("grant_charm"),
      role: RoleSchema,
      charmId: z.string(),
    }),
    z.object({
      op: z.literal("journal"),
      text: z.string(),
      kind: z.enum(["moment", "crew", "tank", "discovery"]).optional(),
    }),
    z.object({ op: z.literal("damage_random_component") }),
    z.object({
      op: z.literal("add_scar"),
      role: RoleSchema,
      text: z.string(),
      rolePenalty: z.number().optional(),
      scarCategory: z.enum(["shrapnel", "hearing", "vision", "burn", "crush"]).optional(),
    }),
    z.object({ op: z.literal("discovery_stub"), id: z.string() }),
  ],
);

const RiskTagSchema = z.object({
  domain: z.enum(["hull", "crew", "supply", "ammo", "salvage", "general"]),
  severity: z.enum(["low", "moderate", "high", "extreme"]),
  label: z.string(),
});

export const EventChoiceSchema = z.object({
  id: z.string(),
  label: z.string(),
  role: RoleSchema.optional(),
  modifierBonus: z.number().optional(),
  outcomeText: z.string(),
  effects: z.array(EffectSchema),
  dialogueLine: z.string().optional(),
  npcReply: z.string().optional(),
  flavorOnly: z.boolean().optional(),
  choiceRisk: z.enum(["aggressive", "tactical", "cautious", "desperate"]).optional(),
  choiceHint: z.string().optional(),
  riskTags: z.array(RiskTagSchema).optional(),
});

const EnemyMetaSchema = z.object({
  idealAmmo: z.enum(["AP", "HE", "WP", "HEAT"]).optional(),
  combatMod: z.number().optional(),
  label: z.string().optional(),
});

export const RuntimeEventSchema = z.object({
  id: z.string(),
  kind: z.enum([
    "travel",
    "tank_combat",
    "infantry_combat",
    "defensive_stand",
    "offensive_assault",
    "supply",
    "human_moment",
    "historical_anchor",
    "elite_encounter",
    "rest",
    "briefing",
    "debrief",
    "npc_conversation",
  ]),
  narrative: z.string(),
  quote: z.string().optional(),
  postQuote: z.string().optional(),
  choices: z.array(EventChoiceSchema).min(1),
  useDice: z.boolean().optional(),
  enemy: EnemyMetaSchema.optional(),
  atmosphere: z.string().optional(),
  preChoiceNpc: z.object({ speaker: z.string(), line: z.string() }).optional(),
  stakes: z.enum(["routine", "elevated", "critical"]).optional(),
  stakesNote: z.string().optional(),
  tierFlavor: z
    .object({
      1: z.string().optional(),
      2: z.string().optional(),
      3: z.string().optional(),
      4: z.string().optional(),
    })
    .optional(),
});

export type RuntimeEventParsed = z.infer<typeof RuntimeEventSchema>;

export function parseRuntimeEvents(
  data: unknown,
): import("./types").RuntimeEvent[] {
  return z.array(RuntimeEventSchema).parse(data) as import("./types").RuntimeEvent[];
}
