import recipes from './json/recipes.json';
import researchLab from './json/research_laboratory.json';
import weaponMods from './json/weapon_mods.json';
import armorMods from './json/armor_mods.json';

export interface CraftingIngredient {
  name: string;
  quantity: number;
}

export interface CraftingRecipe {
  name: string;
  materials: string;
  ingredients: CraftingIngredient[];
  type?: string;
  effect?: string;
  requiredResearch?: string;
  skillTier?: string;
  requiredSkills?: string;
  requiredMaterials?: string;
  craftingUnlocked?: string;
  section: string;
}

export interface CraftingStation {
  id: string;
  label: string;
  icon: string;
  description: string;
  recipes: CraftingRecipe[];
  sections: string[];
}

function parseMaterialString(raw: string): CraftingIngredient[] {
  if (!raw) return [];
  const parts = raw.match(/([A-Za-z][A-Za-z\s\-+.!'']+?)\s*x\s*(\d+)/gi);
  if (!parts) return [];
  return parts.map((p) => {
    const m = p.match(/(.+?)\s*x\s*(\d+)/i);
    return m ? { name: m[1].trim(), quantity: parseInt(m[2], 10) } : { name: p, quantity: 1 };
  });
}

function parseResearchCategory(projectName: string): string {
  const match = projectName.match(/^(.+?)\s+\d+$/);
  return match ? match[1] : projectName;
}

function buildIndustrialWorkbench(): CraftingStation {
  type RawRecipe = { name: string; requires: { name: string; quantity: number }[] };
  const data = recipes as RawRecipe[];
  const items: CraftingRecipe[] = data.map((r) => ({
    name: r.name,
    materials: r.requires.map((req) => `${req.name} x${req.quantity}`).join(', '),
    ingredients: r.requires.map((req) => ({ name: req.name, quantity: req.quantity })),
    section: 'Components',
  }));
  return {
    id: 'industrial',
    label: 'Industrial Workbench',
    icon: 'construct-outline',
    description: 'Manufactured components and materials',
    recipes: items,
    sections: ['Components'],
  };
}

function buildResearchLab(): CraftingStation {
  type RawResearch = {
    'research Project': string;
    'required Materials': string;
    'required Skills': string;
    'crafting Unlocked': string;
    'required Research': string;
  };
  const data = (researchLab as RawResearch[]).filter(
    (r) => r['research Project']?.trim()
  );

  const sectionOrder: string[] = [];
  const sectionSet = new Set<string>();

  const items: CraftingRecipe[] = data.map((r) => {
    const category = parseResearchCategory(r['research Project']);
    if (!sectionSet.has(category)) {
      sectionSet.add(category);
      sectionOrder.push(category);
    }
    return {
      name: r['research Project'],
      materials: r['required Materials'],
      ingredients: parseMaterialString(r['required Materials']),
      requiredSkills: r['required Skills'],
      craftingUnlocked: r['crafting Unlocked'],
      requiredResearch: r['required Research'],
      section: category,
    };
  });

  return {
    id: 'research',
    label: 'Research Laboratory',
    icon: 'flask-outline',
    description: 'Research projects that unlock crafting recipes',
    recipes: items,
    sections: sectionOrder,
  };
}

function resolveSkillTierLabel(mod: { requiredResearch?: string; skillTier?: string }): string {
  if (!mod.requiredResearch) return 'No Research Required';
  if (mod.skillTier && mod.skillTier !== 'None') return mod.skillTier;
  return mod.requiredResearch;
}

function buildWeaponWorkbench(): CraftingStation {
  type RawMod = {
    name: string;
    type: string;
    effect: string;
    materials: string;
    requiredResearch: string;
    skillTier: string;
  };
  const data = weaponMods as RawMod[];

  const sectionOrder: string[] = [];
  const sectionSet = new Set<string>();

  const items: CraftingRecipe[] = data.map((m) => {
    const section = resolveSkillTierLabel(m);
    if (!sectionSet.has(section)) {
      sectionSet.add(section);
      sectionOrder.push(section);
    }
    return {
      name: m.name,
      type: m.type,
      effect: m.effect,
      materials: m.materials,
      ingredients: parseMaterialString(m.materials),
      requiredResearch: m.requiredResearch,
      skillTier: m.skillTier,
      section,
    };
  });

  const tierPriority: Record<string, number> = {
    'No Research Required': 0,
    'None': 1,
    'Rank 1': 2,
    'Rank 2': 3,
    'Rank 3': 4,
    'Rank 4': 5,
  };
  sectionOrder.sort((a, b) => {
    const pa = tierPriority[a] ?? 10;
    const pb = tierPriority[b] ?? 10;
    return pa - pb;
  });

  return {
    id: 'weapon',
    label: 'Weapon Workbench',
    icon: 'hammer-outline',
    description: 'Weapon modifications and upgrades',
    recipes: items,
    sections: sectionOrder,
  };
}

function buildSpacesuitWorkbench(): CraftingStation {
  type RawMod = {
    name: string;
    type: string;
    effect: string;
    materials: string;
    requiredResearch: string;
    skillTier: string;
  };
  const data = armorMods as RawMod[];

  const sectionOrder: string[] = [];
  const sectionSet = new Set<string>();

  const items: CraftingRecipe[] = data.map((m) => {
    const section = resolveSkillTierLabel(m);
    if (!sectionSet.has(section)) {
      sectionSet.add(section);
      sectionOrder.push(section);
    }
    return {
      name: m.name,
      type: m.type,
      effect: m.effect,
      materials: m.materials,
      ingredients: parseMaterialString(m.materials),
      requiredResearch: m.requiredResearch,
      skillTier: m.skillTier,
      section,
    };
  });

  const tierPriority: Record<string, number> = {
    'No Research Required': 0,
    'None': 1,
    'Rank 1': 2,
    'Rank 2': 3,
    'Rank 3': 4,
  };
  sectionOrder.sort((a, b) => {
    const pa = tierPriority[a] ?? 10;
    const pb = tierPriority[b] ?? 10;
    return pa - pb;
  });

  return {
    id: 'spacesuit',
    label: 'Spacesuit Workbench',
    icon: 'shirt-outline',
    description: 'Spacesuit, helmet, and pack modifications',
    recipes: items,
    sections: sectionOrder,
  };
}

const stations: CraftingStation[] = [
  buildIndustrialWorkbench(),
  buildResearchLab(),
  buildWeaponWorkbench(),
  buildSpacesuitWorkbench(),
];

const stationMap = new Map<string, CraftingStation>(
  stations.map((s) => [s.id, s])
);

export function getStation(id: string): CraftingStation | undefined {
  return stationMap.get(id);
}

export { stations };
