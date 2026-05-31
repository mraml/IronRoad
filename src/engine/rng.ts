/** Deterministic 32-bit FNV-1a hash. */
export function fnv1a32(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function drawU01(seed: string, counter: number): number {
  const h = fnv1a32(`${seed}|${counter}`);
  return h / 4294967296;
}

export function drawIntInclusive(seed: string, counter: number, lo: number, hi: number): number {
  if (hi < lo) throw new Error("drawIntInclusive: hi < lo");
  const u = drawU01(seed, counter);
  return lo + Math.floor(u * (hi - lo + 1));
}

export function pickManyUnique<T>(
  seed: string,
  startCounter: number,
  items: readonly T[],
  count: number,
): { picked: T[]; nextCounter: number } {
  const copy = [...items];
  const picked: T[] = [];
  let c = startCounter;
  let n = copy.length;
  const want = Math.min(count, n);
  for (let i = 0; i < want; i++) {
    const idx = drawIntInclusive(seed, c, 0, n - 1);
    c += 1;
    picked.push(copy[idx]!);
    copy[idx] = copy[n - 1]!;
    n -= 1;
  }
  return { picked, nextCounter: c };
}

export function shuffle<T>(
  seed: string,
  startCounter: number,
  arr: T[],
): { arr: T[]; nextCounter: number } {
  const out = [...arr];
  let c = startCounter;
  for (let i = out.length - 1; i > 0; i--) {
    const j = drawIntInclusive(seed, c, 0, i);
    c += 1;
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return { arr: out, nextCounter: c };
}
