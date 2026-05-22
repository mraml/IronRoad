/**
 * Archetype quote engine (spec §3.3–3.4).
 * Each archetype has lines for 6 moment types. The engine fires them contextually.
 */

export type QuoteMoment =
  | "start"       // Mission start / briefing
  | "combat"      // During a fight
  | "down"        // After taking damage / crew loss
  | "win"         // After a good tier outcome
  | "tired"       // Low constitution (< 40)
  | "death";      // Crew death narrative

export type Archetype =
  | "veteran"
  | "kid"
  | "dark_comedian"
  | "pragmatist"
  | "faithful"
  | "angry_one"
  | "quiet_one"
  | "homesick_one"
  | "glory_hound"
  | "cynical_one"
  | "natural"
  | "old_hand"
  | "reluctant_one"
  | "protector"
  | "displaced";

type QuoteTable = Record<QuoteMoment, string[]>;

const QUOTES: Record<Archetype, QuoteTable> = {
  veteran: {
    start: [
      "We do this clean. No heroics.",
      "Same road, different names on the map.",
      "I've seen this before. That's not reassuring.",
    ],
    combat: [
      "Stay calm. Fear spends bullets.",
      "Don't let them know you're scared. They're scared too.",
      "Keep your head low and your eyes open.",
    ],
    down: [
      "We've taken worse.",
      "Walk it off. The road keeps going.",
      "It hurts because it's real. Real means you're still here.",
    ],
    win: [
      "Good. Don't get used to it.",
      "That's how it's done.",
      "Clean work. Keep moving.",
    ],
    tired: [
      "I'm running on procedure. That's fine.",
      "Sleep is for the other side of this.",
      "Tired is normal. Dead is worse.",
    ],
    death: [
      "He knew what this was. He came anyway.",
      "Write it down when you get a minute.",
      "Remember the name. Forget the rest.",
    ],
  },
  kid: {
    start: [
      "I'm ready. I'm ready. I'm ready.",
      "Just tell me what to do and I'll do it.",
      "I looked at the map. I understand it now. I think.",
    ],
    combat: [
      "Is it supposed to be this loud?",
      "Tell me what to do. Just tell me what to do.",
      "I'm doing it. I'm doing the thing.",
    ],
    down: [
      "I didn't think it'd—I didn't—",
      "Is everyone okay? Tell me everyone's okay.",
      "I can keep going. Tell me I can keep going.",
    ],
    win: [
      "We did it. Holy— we did it.",
      "I didn't die. I didn't die!",
      "That was... okay. That was okay.",
    ],
    tired: [
      "I'm fine. I'm just tired.",
      "How do you sleep? I can't sleep.",
      "Does it get easier? Don't answer that.",
    ],
    death: [
      "He was scared the whole time. He never said.",
      "He was going to write to his mother.",
      "He was twenty-two. I thought he was younger.",
    ],
  },
  dark_comedian: {
    start: [
      "Another chance to become a footnote.",
      "I've done worse for worse reasons.",
      "The briefing was optimistic. I love optimism.",
    ],
    combat: [
      "Exciting. In all the wrong ways.",
      "This is fine. Burning is fine. We're fine.",
      "Fun fact: nobody's watching and nobody cares. Move.",
    ],
    down: [
      "Well. That happened.",
      "We're doing great. Comparatively.",
      "The bar was low. We're under it. Still breathing.",
    ],
    win: [
      "Survival is its own comedy.",
      "Huh. Didn't see that coming.",
      "Against all reasonable odds.",
    ],
    tired: [
      "I'm medically tired. It's fine.",
      "Sleep is a myth propagated by the living.",
      "Running on spite and historical irony.",
    ],
    death: [
      "He'd have made a joke about this.",
      "He always said he'd die doing something stupid. He was half right.",
      "He was funnier than me. Don't tell anyone I said that.",
    ],
  },
  pragmatist: {
    start: [
      "Objective, route, resources. We have all three.",
      "Let's not waste time.",
      "The math works out. For now.",
    ],
    combat: [
      "Ammo count, angles, priority. Focus.",
      "Emotion is overhead. Cut it.",
      "The right choice is the one that costs less.",
    ],
    down: [
      "Damage assessment. What do we have left?",
      "Inventory what works. Discard what doesn't.",
      "Losses happen. What's the recovery path?",
    ],
    win: [
      "Expected outcome. Moving on.",
      "Efficient. Good.",
      "That worked. File it.",
    ],
    tired: [
      "Fatigue is a variable. I'm accounting for it.",
      "I'll rest when the numbers allow.",
      "Tired means inefficient. Push through.",
    ],
    death: [
      "The mission continues. That's what he would want.",
      "He was reliable. Reliable people are rare.",
      "Account for the gap. Fill it.",
    ],
  },
  faithful: {
    start: [
      "Whatever comes, we're not alone in it.",
      "I don't know His plan. I show up anyway.",
      "Light enough to see the next step.",
    ],
    combat: [
      "Keep your head down and your heart up.",
      "Fear is honest. Faith is choosing to move anyway.",
      "Somebody's watching. Might as well do it right.",
    ],
    down: [
      "Still here. That means something.",
      "I've prayed in worse positions.",
      "Grace shows up in foxholes. I've seen it.",
    ],
    win: [
      "Thank you. Moving on.",
      "Someone was watching out.",
      "Not luck. I don't believe in luck.",
    ],
    tired: [
      "Tired is honest. I'll rest on the other side of this.",
      "I'm leaning on something you can't see.",
      "Prayer is work. Work is prayer.",
    ],
    death: [
      "He's somewhere better than this. I have to believe that.",
      "We'll see him again. That's not comfort, it's conviction.",
      "He fought with everything he had. That counts.",
    ],
  },
  angry_one: {
    start: [
      "Good. Something to hit.",
      "Tell me the target. I'll handle the rest.",
      "I stopped being angry about this. I started being useful.",
    ],
    combat: [
      "Harder. Push harder.",
      "COME ON.",
      "They want to stop us? Let them try.",
    ],
    down: [
      "You want to see angry? I'll show you angry.",
      "That's it? That's all you've got?",
      "I've been hit worse. By people I liked.",
    ],
    win: [
      "Good. Still standing.",
      "Yeah. That's right.",
      "More where that came from.",
    ],
    tired: [
      "I don't get tired. I get focused.",
      "Anger keeps you warm.",
      "Sleep makes you soft. I'll sleep when this is over.",
    ],
    death: [
      "He died mad at something. He was always mad at something. It kept him going.",
      "He'd want us to keep fighting. So we keep fighting.",
      "The anger outlasts the man. That's not nothing.",
    ],
  },
  quiet_one: {
    start: ["...", "Ready.", "Let's go."],
    combat: ["On it.", "Covering.", "Moving."],
    down: ["Still functional.", "Noted.", "We continue."],
    win: ["Good.", "Next.", "..."],
    tired: ["...", "Still here.", "Continuing."],
    death: [
      "He didn't talk much. When he did, it meant something.",
      "The silences are different without him.",
      "...",
    ],
  },
  homesick_one: {
    start: [
      "A hundred miles from anything I know.",
      "What I wouldn't give for a bad diner and good coffee.",
      "Starting to forget what home smells like.",
    ],
    combat: [
      "Every shot puts me one closer to home. That's the math.",
      "I've got something to live for. That helps.",
      "I'm coming back. I'm coming back.",
    ],
    down: [
      "I keep thinking about the kitchen in the morning.",
      "I promised I'd come back in one piece.",
      "Not here. Not like this.",
    ],
    win: [
      "One more. Just keep adding one more.",
      "Getting closer.",
      "Still in the game.",
    ],
    tired: [
      "I keep dreaming about the wrong things.",
      "Three more months. I can do three months.",
      "Home is a country I'm from.",
    ],
    death: [
      "He talked about home every day. Every single day.",
      "He was going to see his kid graduate.",
      "He never stopped hoping. That's not a weakness.",
    ],
  },
  glory_hound: {
    start: [
      "This is the one. This is where it matters.",
      "I want a clean fight. Something they'll remember.",
      "Tell me the hardest part. I'll take it.",
    ],
    combat: [
      "Front and center. Every time.",
      "Watch this.",
      "I'll get the citation for this one.",
    ],
    down: [
      "That was not supposed to happen.",
      "I've had worse. In front of fewer witnesses.",
      "Not today. Not like this.",
    ],
    win: [
      "That's what I'm talking about.",
      "Record that. Somebody record that.",
      "That's what they'll write about.",
    ],
    tired: [
      "I'm fine. I look worse than I am.",
      "Pain is aesthetically inconvenient.",
      "Medals don't care if you slept.",
    ],
    death: [
      "He wanted to be remembered. I think he will be.",
      "He died doing exactly what he wanted to do. I don't know if that helps.",
      "He went out loud. He'd have wanted it that way.",
    ],
  },
  cynical_one: {
    start: [
      "The briefing was garbage and we all know it.",
      "We're doing this. Fine. Let's just do this.",
      "Another morning, another lie about the objective.",
    ],
    combat: [
      "Expected.",
      "Nobody's surprised. Everyone keep moving.",
      "This is fine. This is how it always goes.",
    ],
    down: [
      "Yep.",
      "What did you expect?",
      "The plan failed. Make a new plan.",
    ],
    win: [
      "Luck. Pure luck.",
      "Great. It'll get harder.",
      "That worked. Doesn't mean anything.",
    ],
    tired: [
      "Tired is the honest reaction.",
      "I've stopped expecting it to get better.",
      "Fine. I'm fine. We're all fine.",
    ],
    death: [
      "He deserved better. They all do.",
      "Add him to the list nobody reads.",
      "The war keeps going. That's the honest truth.",
    ],
  },
  natural: {
    start: [
      "I've got a feeling about this one.",
      "I know where they'll be. I can't explain how I know.",
      "This is what I do. Let's go.",
    ],
    combat: [
      "I've got the angle. Trust me.",
      "I see it. I've always seen it.",
      "Follow my lead. Don't think. Go.",
    ],
    down: [
      "Didn't see that one. Noted.",
      "I'll adapt. I always adapt.",
      "New situation, new solution.",
    ],
    win: [
      "Told you.",
      "Not luck. Instinct.",
      "That's how it should go.",
    ],
    tired: [
      "Tired doesn't slow down instinct.",
      "I run better without thinking.",
      "The less I'm in my head, the better.",
    ],
    death: [
      "He had good instincts. Better than mine, some days.",
      "He read ground the way some people read books.",
      "I'll miss watching how he moved.",
    ],
  },
  old_hand: {
    start: [
      "Done this before. I'll do it again.",
      "Nothing surprises me anymore. That's good and bad.",
      "The map's wrong. It's always wrong.",
    ],
    combat: [
      "Conserve. Everything. Always.",
      "We've been in tighter spots.",
      "Patience. Let them make the mistake.",
    ],
    down: [
      "Walk it off. Done worse with less.",
      "I've been this tired before. Made it through.",
      "Calibrate and continue.",
    ],
    win: [
      "Again. One more time.",
      "That's the way.",
      "Works every time. Sometimes.",
    ],
    tired: [
      "I've been this tired since '42. Still here.",
      "Tired means experienced.",
      "Sleep is for people who haven't done this before.",
    ],
    death: [
      "He made it this far. That's further than most.",
      "He knew the risks. He stayed anyway.",
      "I've lost better men. I've lost worse ones. It never stops costing.",
    ],
  },
  reluctant_one: {
    start: [
      "If I had a choice. I don't. Moving on.",
      "I'm here. I didn't say I liked it.",
      "Let's get this over with.",
    ],
    combat: [
      "I hate this. Keep going. I hate this.",
      "I'm doing it. I'm not enjoying it.",
      "This was not what I signed up for. This is what I'm doing anyway.",
    ],
    down: [
      "Exactly what I expected.",
      "I didn't want this. It happened anyway.",
      "This is fine. Nothing is fine.",
    ],
    win: [
      "There. Done. Happy?",
      "We survived. I'll reserve celebration.",
      "I'll allow it.",
    ],
    tired: [
      "Tired is appropriate given the circumstances.",
      "I'd like to be somewhere else. I'm here.",
      "Protest noted. Action continues.",
    ],
    death: [
      "He didn't want this. He did it anyway. That's more courage than wanting to.",
      "He protested everything and showed up for everything.",
      "He complained about this place every day. He never left early.",
    ],
  },
  protector: {
    start: [
      "Keep an eye on each other today.",
      "Whatever happens, we bring everyone back.",
      "I'm not losing anyone today.",
    ],
    combat: [
      "Stay together. No one breaks off.",
      "If they're going for the crew, they're going through me.",
      "Watch your arcs. Watch each other.",
    ],
    down: [
      "Is everyone okay? Count off.",
      "Regroup. Check the crew.",
      "Someone get eyes on everyone.",
    ],
    win: [
      "Everyone's still here. Good.",
      "Count off. Good. We're good.",
      "That's what matters.",
    ],
    tired: [
      "I can keep watch. Get some sleep.",
      "Tired means I'm still keeping watch.",
      "I'll rest when everyone else is okay.",
    ],
    death: [
      "I should have— I could have—",
      "He was my responsibility. I carry that.",
      "I'll make sure it means something.",
    ],
  },
  displaced: {
    start: [
      "I fight for something that doesn't exist anymore. That's fine.",
      "This isn't my country. These are still my people.",
      "I know what we're fighting for. I've already lost it.",
    ],
    combat: [
      "I know what it looks like when it's gone. Fight harder.",
      "Every round is for the people who can't fight back.",
      "I've seen what they do. I know what I'm doing.",
    ],
    down: [
      "I've already lost more than this.",
      "It can always be worse. I've seen worse.",
      "Still standing. Still fighting.",
    ],
    win: [
      "For everyone who didn't get to see this.",
      "Small victory. Add it to the ledger.",
      "We move forward. We always move forward.",
    ],
    tired: [
      "I carry tired like luggage. I don't put it down.",
      "The exhaustion is old. Doesn't mean I stop.",
      "I rest when the fight is done.",
    ],
    death: [
      "He fought for a place he couldn't go back to. That's the bravest thing.",
      "He carried his home in his chest. It's buried with him now.",
      "His country owes him a debt it can't pay. Remember his name.",
    ],
  },
};

/**
 * Get a quote for an archetype at a specific moment.
 * Uses the RNG counter for deterministic selection.
 */
export function getArchetypeQuote(
  archetypeId: string,
  moment: QuoteMoment,
  seed: string,
  counter: number,
): string | null {
  const table = QUOTES[archetypeId as Archetype];
  if (!table) return null;
  const lines = table[moment];
  if (!lines || lines.length === 0) return null;
  // Simple deterministic pick
  const h = fnv1a(seed + counter);
  return lines[h % lines.length]!;
}

function fnv1a(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
