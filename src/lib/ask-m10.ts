import type { Service, InventoryItem } from "@/lib/types";

const STOPWORDS = new Set([
  "a", "an", "the", "i", "im", "my", "me", "is", "it", "its", "and", "or", "for",
  "with", "have", "has", "had", "want", "need", "get", "got", "to", "of", "in",
  "on", "at", "this", "that", "rwf", "frw", "please", "can", "you", "do", "does",
  "what", "whats", "price", "prices", "cost", "costs", "how", "much", "will",
  "would", "about", "there", "under", "below", "around", "budget", "phone",
  "device", "looking",
]);

const SYNONYMS: Record<string, string[]> = {
  // screen
  cracked: ["screen"],
  crack: ["screen"],
  shattered: ["screen"],
  shatter: ["screen"],
  broken: ["screen"],
  smashed: ["screen"],
  smash: ["screen"],
  dropped: ["screen", "damage"],
  fell: ["screen", "damage"],
  fall: ["screen", "damage"],
  spiderweb: ["screen"],
  lines: ["screen"],
  spots: ["screen"],
  flickering: ["screen"],
  flicker: ["screen"],
  dim: ["screen"],
  blank: ["screen"],
  unresponsive: ["screen"],
  touch: ["screen"],
  ghost: ["screen"],
  glass: ["screen"],

  // battery / charging
  charging: ["charging", "battery", "port"],
  charge: ["charging", "battery", "port"],
  charger: ["charging", "battery", "port"],
  cable: ["charging", "port"],
  cord: ["charging", "port"],
  plug: ["charging", "port"],
  dies: ["battery"],
  dying: ["battery"],
  dead: ["battery", "power"],
  drains: ["battery"],
  draining: ["battery"],
  drain: ["battery"],
  swollen: ["battery"],
  swelling: ["battery"],
  bulging: ["battery"],
  weak: ["battery"],
  percentage: ["battery"],
  overheating: ["battery"],
  heating: ["battery"],
  hot: ["battery"],
  loose: ["charging", "port"],

  // camera
  blurry: ["camera"],
  foggy: ["camera"],
  focus: ["camera"],
  smudge: ["camera"],

  // software / performance
  slow: ["virus", "software"],
  lag: ["virus", "software"],
  lagging: ["virus", "software"],
  hangs: ["virus", "software"],
  hanging: ["virus", "software"],
  freezing: ["virus", "software"],
  freeze: ["virus", "software"],
  frozen: ["virus", "software"],
  virus: ["virus", "software"],
  malware: ["virus", "software"],
  stuck: ["virus", "software"],
  bootloop: ["virus", "software"],
  restarting: ["virus", "software"],
  rebooting: ["virus", "software"],
  crashing: ["virus", "software"],
  crash: ["virus", "software"],
  hacked: ["virus", "software"],
  popup: ["virus", "software"],
  popups: ["virus", "software"],

  // water damage
  wet: ["water", "damage"],
  water: ["water", "damage"],
  liquid: ["water", "damage"],
  toilet: ["water", "damage"],
  rain: ["water", "damage"],
  soaked: ["water", "damage"],
  drowned: ["water", "damage"],
  spilled: ["water", "damage"],
  spill: ["water", "damage"],

  // power / motherboard
  bricked: ["motherboard", "power"],
  shortcircuit: ["motherboard", "power"],
  burnt: ["motherboard", "power"],
  fried: ["motherboard", "power"],

  // audio
  speaker: ["speaker", "audio"],
  mute: ["speaker", "audio"],
  muted: ["speaker", "audio"],
  quiet: ["speaker", "audio"],
  mic: ["microphone", "audio"],
  microphone: ["microphone", "audio"],
  sound: ["speaker", "audio"],
  crackling: ["speaker", "audio"],
  static: ["speaker", "audio"],

  // connectivity
  wifi: ["wifi", "network"],
  bluetooth: ["bluetooth", "network"],
  signal: ["network"],
  network: ["network"],
  sim: ["network"],

  // data
  recover: ["data", "recovery"],
  recovery: ["data", "recovery"],
  deleted: ["data", "recovery"],
  lost: ["data", "recovery"],
  backup: ["data", "recovery"],
  files: ["data", "recovery"],
  contacts: ["data", "recovery"],
};

function tokenize(query: string): string[] {
  const words = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 0 && !STOPWORDS.has(w));

  const expanded = new Set<string>();
  for (const word of words) {
    expanded.add(word);
    for (const extra of SYNONYMS[word] ?? []) {
      expanded.add(extra);
    }
  }
  return Array.from(expanded);
}

function parseBudgetRwf(query: string): number | null {
  const k = query.match(/(\d+(?:[.,]\d+)?)\s*k\b/i);
  if (k) return Math.round(parseFloat(k[1].replace(",", ".")) * 1000);

  const plain = query.match(/(\d{2,3}(?:[,.]?\d{3})+|\d{4,})/);
  if (plain) return Number(plain[1].replace(/[,.]/g, ""));

  return null;
}

export type ServiceMatch = { service: Service; score: number };
export type InventoryMatch = { item: InventoryItem; score: number };

export type AskM10Result = {
  budgetRwf: number | null;
  services: ServiceMatch[];
  inventory: InventoryMatch[];
};

function haystackWords(haystack: string): Set<string> {
  return new Set(
    haystack.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 0)
  );
}

function scoreHaystack(tokens: string[], haystack: string): number {
  const words = haystackWords(haystack);
  let score = 0;
  for (const token of tokens) {
    if (words.has(token)) score += 1;
  }
  return score;
}

export function matchQuery(
  query: string,
  services: Service[],
  inventory: InventoryItem[]
): AskM10Result {
  const tokens = tokenize(query);
  const budgetRwf = parseBudgetRwf(query);

  const serviceMatches = services
    .map((service) => ({
      service,
      score: scoreHaystack(tokens, `${service.name} ${service.category} ${service.description ?? ""}`.toLowerCase()),
    }))
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  let inventoryMatches: InventoryMatch[];
  if (budgetRwf !== null) {
    const withinBudget = inventory.filter((item) => item.price_rwf <= budgetRwf * 1.15);
    const pool = withinBudget.length > 0 ? withinBudget : inventory;
    inventoryMatches = pool
      .map((item) => ({
        item,
        score: scoreHaystack(tokens, `${item.brand} ${item.model} ${item.device_type}`.toLowerCase()),
      }))
      .sort((a, b) => (withinBudget.length > 0 ? b.item.price_rwf - a.item.price_rwf : a.item.price_rwf - b.item.price_rwf))
      .slice(0, 3);
  } else {
    inventoryMatches = inventory
      .map((item) => ({
        item,
        score: scoreHaystack(tokens, `${item.brand} ${item.model} ${item.device_type}`.toLowerCase()),
      }))
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  return { budgetRwf, services: serviceMatches, inventory: inventoryMatches };
}
