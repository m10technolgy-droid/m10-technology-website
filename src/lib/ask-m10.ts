import type { Service, InventoryItem } from "@/lib/types";

const STOPWORDS = new Set([
  "a", "an", "the", "i", "im", "my", "me", "is", "it", "its", "and", "or", "for",
  "with", "have", "has", "had", "want", "need", "get", "got", "to", "of", "in",
  "on", "at", "this", "that", "rwf", "frw", "please", "can", "you", "do",
]);

const SYNONYMS: Record<string, string[]> = {
  cracked: ["screen"],
  shattered: ["screen"],
  broken: ["screen"],
  smashed: ["screen"],
  charging: ["charging", "battery", "port"],
  charge: ["charging", "battery", "port"],
  dies: ["battery"],
  dying: ["battery"],
  drains: ["battery"],
  draining: ["battery"],
  slow: ["virus", "software"],
  hangs: ["virus", "software"],
  freezing: ["virus", "software"],
  virus: ["virus", "software"],
  blurry: ["camera"],
  foggy: ["camera"],
  wet: ["water", "damage"],
  water: ["water", "damage"],
  dropped: ["screen", "damage"],
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

function scoreHaystack(tokens: string[], haystack: string): number {
  let score = 0;
  for (const token of tokens) {
    if (haystack.includes(token)) score += 1;
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
