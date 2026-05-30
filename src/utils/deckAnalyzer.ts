import type { Deck } from '../types/ygo';
import { ATTRIBUTE_COLORS } from '../constants/typeColors';

const HANDTRAP_NAMES = new Set([
  'Ash Blossom & Joyous Spring',
  'Effect Veiler',
  'Ghost Ogre & Snow Rabbit',
  'Nibiru, the Primal Being',
  'Maxx "C"',
  'D.D. Crow',
  'Infinite Impermanence',
  'Called by the Grave',
  'Droll & Lock Bird',
  'Ghost Belle & Haunted Mansion',
  'Ghost Mourner & Moonlit Chill',
  'Skull Meister',
  'PSY-Framegear Gamma',
  'Artifact Lancea',
]);

const DRAW_ENGINE = new Set([
  'Pot of Greed', 'Pot of Extravagance', 'Pot of Prosperity', 'Pot of Desires',
  'Upstart Goblin', 'One Day of Peace', 'Card Destruction', 'Allure of Darkness',
]);

/** P(ver ≥1 copia en mano inicial) con distribución hipergeométrica */
function probAtLeastOne(deckSize: number, copies: number, handSize = 5): number {
  if (copies <= 0 || deckSize <= 0 || deckSize < copies) return 0;
  let p0 = 1;
  for (let i = 0; i < handSize; i++) {
    p0 *= Math.max(0, (deckSize - copies - i)) / (deckSize - i);
  }
  return Math.max(0, 1 - p0);
}

export interface DistBar {
  label: string;
  count: number;
  color: string;
}

export interface ConsistencyRow {
  name: string;
  copies: number;
  prob: number;
}

export interface DeckAnalysisResult {
  deckSize: number;
  archetypes: Array<{ name: string; count: number }>;
  speed: string;
  speedLabel: string;
  speedColor: string;
  speedReason: string;
  typeDistribution: DistBar[];
  attributeDistribution: DistBar[];
  raceTop: Array<{ name: string; count: number }>;
  banlist: { banned: number; limited: number; semiLimited: number };
  handtraps: string[];
  drawEngine: string[];
  consistency: ConsistencyRow[];
  warnings: string[];
  strengths: string[];
  score: number;
}

export function analyzeDeck(deck: Deck): DeckAnalysisResult {
  const main = deck.main;
  const all = [...deck.main, ...deck.extra, ...deck.side];
  const deckSize = main.reduce((s, dc) => s + dc.count, 0);

  // ── Arquetipos ──────────────────────────────────────────────
  const arcMap = new Map<string, number>();
  for (const { card, count } of main) {
    if (card.archetype) arcMap.set(card.archetype, (arcMap.get(card.archetype) ?? 0) + count);
  }
  const archetypes = [...arcMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }));

  // ── Distribución tipos ───────────────────────────────────────
  const typeCounts: Record<string, number> = {};
  for (const { card, count } of main) {
    const cat = card.type.includes('Spell') ? 'Magia'
              : card.type.includes('Trap') ? 'Trampa' : 'Monstruo';
    typeCounts[cat] = (typeCounts[cat] ?? 0) + count;
  }
  const typeColors: Record<string, string> = {
    Monstruo: '#fb923c', Magia: '#4ade80', Trampa: '#f472b6',
  };
  const typeDistribution: DistBar[] = Object.entries(typeCounts)
    .map(([label, count]) => ({ label, count, color: typeColors[label] ?? '#8060ff' }));

  // ── Distribución atributos ───────────────────────────────────
  const attrMap = new Map<string, number>();
  for (const { card, count } of main) {
    if (card.attribute) attrMap.set(card.attribute, (attrMap.get(card.attribute) ?? 0) + count);
  }
  const attributeDistribution: DistBar[] = [...attrMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({ label, count, color: ATTRIBUTE_COLORS[label] ?? '#8060ff' }));

  // ── Razas top ────────────────────────────────────────────────
  const raceMap = new Map<string, number>();
  for (const { card, count } of main) {
    if (!card.type.includes('Spell') && !card.type.includes('Trap'))
      raceMap.set(card.race, (raceMap.get(card.race) ?? 0) + count);
  }
  const raceTop = [...raceMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // ── Banlist ──────────────────────────────────────────────────
  let banned = 0, limited = 0, semiLimited = 0;
  for (const { card, count } of all) {
    const s = card.banlist_info?.ban_tcg;
    if (s === 'Banned') banned += count;
    else if (s === 'Limited') limited += count;
    else if (s === 'Semi-Limited') semiLimited += count;
  }

  // ── Hand traps + motor de robo ───────────────────────────────
  const handtraps: string[] = [];
  const drawEngine: string[] = [];
  for (const { card } of main) {
    if (HANDTRAP_NAMES.has(card.name)) handtraps.push(card.name);
    if (DRAW_ENGINE.has(card.name)) drawEngine.push(card.name);
  }

  // ── Consistencia probabilística ──────────────────────────────
  const consistency: ConsistencyRow[] = main
    .filter(dc => dc.count >= 2 && deckSize >= 40)
    .sort((a, b) => b.count - a.count || a.card.name.localeCompare(b.card.name))
    .slice(0, 10)
    .map(dc => ({
      name: dc.card.name,
      copies: dc.count,
      prob: Math.round(probAtLeastOne(deckSize, dc.count) * 100),
    }));

  // ── Velocidad / estilo ───────────────────────────────────────
  const monCount = typeCounts['Monstruo'] ?? 0;
  const spCount  = typeCounts['Magia'] ?? 0;
  const trCount  = typeCounts['Trampa'] ?? 0;

  const avgLevel = main
    .filter(dc => dc.card.level != null && !dc.card.type.includes('Spell') && !dc.card.type.includes('Trap'))
    .reduce((sum, dc) => sum + (dc.card.level! * dc.count), 0)
    / Math.max(1, monCount);

  const ssCount = main.filter(dc =>
    dc.card.desc?.toLowerCase().includes('special summon')
  ).length;

  let speed = 'Midrange', speedLabel = 'Midrange', speedColor = '#8060ff', speedReason = '';
  if (ssCount > main.length * 0.55 && avgLevel < 5) {
    speed = 'Combo'; speedLabel = 'Combo'; speedColor = '#f87171';
    speedReason = 'Alta densidad de efectos de Invocación Especial y monstruos de nivel bajo';
  } else if (trCount >= 10) {
    speed = 'Control'; speedLabel = 'Control'; speedColor = '#60a5fa';
    speedReason = `${trCount} trampas — orientado a negar y agotar recursos del rival`;
  } else if (monCount >= 22 && avgLevel <= 3.5) {
    speed = 'Aggro'; speedLabel = 'Aggro'; speedColor = '#fb923c';
    speedReason = 'Muchos monstruos de bajo nivel para presionar el campo desde el turno 1';
  } else if (trCount >= 5 && spCount >= 10) {
    speed = 'Midrange'; speedLabel = 'Control-Midrange'; speedColor = '#a78bfa';
    speedReason = 'Balance entre remoción, magia de soporte y presencia de monstruo';
  } else if (monCount <= 10 && trCount >= 8) {
    speed = 'Stall'; speedLabel = 'Stall'; speedColor = '#94a3b8';
    speedReason = 'Pocos monstruos y alta densidad de trampas — busca resistir y agotar al rival';
  } else {
    speedReason = 'Distribución equilibrada sin una estrategia dominante clara';
  }

  // ── Advertencias ─────────────────────────────────────────────
  const warnings: string[] = [];
  if (deckSize > 0 && deckSize < 40) warnings.push(`Main Deck con solo ${deckSize} cartas — necesita mínimo 40`);
  if (deckSize > 60) warnings.push(`Main Deck con ${deckSize} cartas — considera reducir; más cartas = menos consistencia`);
  if (deckSize >= 43 && deckSize <= 60) warnings.push(`${deckSize} cartas en Main — un mazo de 40-42 es más consistente (cada carta adicional diluye las jugadas clave)`);
  if (banned > 0) warnings.push(`${banned} carta${banned > 1 ? 's' : ''} prohibida${banned > 1 ? 's' : ''} — no es válido para torneos TCG`);
  if (handtraps.length === 0 && deckSize >= 20) warnings.push('Sin hand traps — considera Ash Blossom, Effect Veiler o Infinite Impermanence para protegerte durante el turno del rival');
  if (monCount > 0 && monCount < 8) warnings.push('Muy pocos monstruos — tendrás problemas para establecer presencia de campo');
  if (trCount > 14) warnings.push(`${trCount} trampas son muchas para el meta actual — los combos modernos las ignoran con facilidad`);
  const ext = deck.extra.reduce((s, dc) => s + dc.count, 0);
  if (ext === 0 && deckSize > 0) warnings.push('Sin Extra Deck — los monstruos de Extra (Fusión, Sincronía, XYZ, Link) son la base de la mayoría de estrategias modernas');

  // ── Fortalezas ───────────────────────────────────────────────
  const strengths: string[] = [];
  if (deckSize >= 40 && deckSize <= 42) strengths.push('Tamaño de mazo óptimo: máxima consistencia en la apertura');
  if (handtraps.length >= 3) strengths.push(`${handtraps.length} hand traps distintas — buena defensa contra combos del turno 1`);
  if (banned === 0 && deckSize > 0) strengths.push('Mazo 100% legal en TCG (sin prohibidas ni ilegales)');
  if (archetypes.length > 0 && archetypes[0].count >= 8) strengths.push(`Arquetipo "${archetypes[0].name}" bien representado con ${archetypes[0].count} cartas`);
  if (drawEngine.length >= 2) strengths.push(`Motor de robo sólido: ${drawEngine.slice(0, 3).join(', ')}`);
  if (ext >= 10) strengths.push(`Extra Deck robusto (${ext} cartas) para opciones de salida variadas`);

  // ── Score ─────────────────────────────────────────────────────
  let score = 40;
  if (deckSize >= 40 && deckSize <= 42) score += 15;
  else if (deckSize >= 40) score += 8;
  if (handtraps.length >= 2) score += 12;
  else if (handtraps.length === 1) score += 5;
  if (banned === 0) score += 8;
  if (archetypes.length > 0 && archetypes[0].count >= 8) score += 10;
  if (drawEngine.length >= 1) score += 5;
  if (ext >= 5) score += 5;
  if (warnings.length === 0) score += 5;
  score = Math.min(100, score);

  return {
    deckSize, archetypes, speed, speedLabel, speedColor, speedReason,
    typeDistribution, attributeDistribution, raceTop,
    banlist: { banned, limited, semiLimited },
    handtraps, drawEngine, consistency, warnings, strengths, score,
  };
}
