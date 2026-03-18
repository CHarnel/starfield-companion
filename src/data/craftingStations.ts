import recipes from './json/recipes.json';
import researchLab from './json/research_laboratory.json';
import weaponMods from './json/weapon_mods.json';
import armorMods from './json/armor_mods.json';
import cookingRecipes from './json/cooking_recipes.json';
import pharmaRecipes from './json/pharma_recipes.json';
import consumables from './json/Consumables.json';

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

function tierSortKey(mod: { skillTier?: string; requiredResearch?: string }): number {
  if (!mod.requiredResearch) return 0;
  const tierFromName = mod.requiredResearch.match(/(\d+)$/);
  if (tierFromName) return parseInt(tierFromName[1], 10);
  return 5;
}

type RawMod = {
  name: string;
  type: string;
  effect: string;
  materials: string;
  requiredResearch: string;
  skillTier: string;
};

function buildModWorkbench(
  id: string,
  label: string,
  icon: string,
  description: string,
  rawMods: RawMod[],
  typeOrder: string[],
): CraftingStation {
  const sections: string[] = [];
  const allItems: CraftingRecipe[] = [];

  for (const modType of typeOrder) {
    const modsOfType = rawMods
      .filter((m) => m.type === modType)
      .sort((a, b) => tierSortKey(a) - tierSortKey(b));

    if (modsOfType.length === 0) continue;
    sections.push(modType);

    for (const m of modsOfType) {
      allItems.push({
        name: m.name,
        type: m.type,
        effect: m.effect,
        materials: m.materials,
        ingredients: parseMaterialString(m.materials),
        requiredResearch: m.requiredResearch,
        skillTier: m.skillTier,
        section: modType,
      });
    }
  }

  return { id, label, icon, description, recipes: allItems, sections };
}

const WEAPON_TYPE_ORDER = [
  'Barrel', 'Receiver', 'Magazine and Battery', 'Muzzle',
  'Grip and Stock', 'Optic', 'Laser', 'Internal', 'Cover',
];

const SPACESUIT_TYPE_ORDER = ['Helmet Mod', 'Spacesuit Mod', 'Pack Mod'];

function buildWeaponWorkbench(): CraftingStation {
  return buildModWorkbench(
    'weapon',
    'Weapon Workbench',
    'hammer-outline',
    'Weapon modifications and upgrades',
    weaponMods as RawMod[],
    WEAPON_TYPE_ORDER,
  );
}

function buildSpacesuitWorkbench(): CraftingStation {
  return buildModWorkbench(
    'spacesuit',
    'Spacesuit Workbench',
    'shirt-outline',
    'Spacesuit, helmet, and pack modifications',
    armorMods as RawMod[],
    SPACESUIT_TYPE_ORDER,
  );
}

type RawConsumableRecipe = {
  name: string;
  ingredients: { name: string; quantity: number }[];
  requiredResearch: string;
  category: string;
};

const consumableLookup = new Map(
  (consumables as { name: string; effect?: string; description?: string }[]).map(
    (c) => [c.name.toLowerCase(), c]
  )
);

function buildConsumableStation(
  id: string,
  label: string,
  icon: string,
  description: string,
  rawRecipes: RawConsumableRecipe[],
  sectionOrder: string[],
): CraftingStation {
  const sections: string[] = [];
  const allItems: CraftingRecipe[] = [];

  for (const section of sectionOrder) {
    const matching = rawRecipes.filter((r) => r.category === section);
    if (matching.length === 0) continue;
    sections.push(section);

    const sorted = [...matching].sort((a, b) => {
      const aT = a.requiredResearch.match(/(\d+)$/);
      const bT = b.requiredResearch.match(/(\d+)$/);
      const aN = aT ? parseInt(aT[1], 10) : 0;
      const bN = bT ? parseInt(bT[1], 10) : 0;
      if (aN !== bN) return aN - bN;
      return a.name.localeCompare(b.name);
    });

    for (const r of sorted) {
      const info = consumableLookup.get(r.name.toLowerCase());
      allItems.push({
        name: r.name,
        materials: r.ingredients
          .map((i) => `${i.name} x${i.quantity}`)
          .join(', '),
        ingredients: r.ingredients,
        effect: info?.effect || '',
        requiredResearch: r.requiredResearch,
        section,
      });
    }
  }

  return { id, label, icon, description, recipes: allItems, sections };
}

const COOKING_SECTIONS = [
  'Basic',
  'Old Earth Cuisine',
  'Beverage Development',
  'Mixology',
  'Exotic Recipes',
  'Magazine Recipes',
];

const PHARMA_SECTIONS = [
  'Basic',
  'Medical Treatment',
  'Performance Enhancement',
  'Innovative Synthesis',
  'Magazine Recipes',
];

function buildCookingStation(): CraftingStation {
  return buildConsumableStation(
    'cooking',
    'Cooking Station',
    'restaurant-outline',
    'Food and drink recipes',
    cookingRecipes as RawConsumableRecipe[],
    COOKING_SECTIONS,
  );
}

function buildPharmaLab(): CraftingStation {
  return buildConsumableStation(
    'pharma',
    'Pharmaceutical Lab',
    'medkit-outline',
    'Chems, medicines, and aid items',
    pharmaRecipes as RawConsumableRecipe[],
    PHARMA_SECTIONS,
  );
}

const stations: CraftingStation[] = [
  buildIndustrialWorkbench(),
  buildResearchLab(),
  buildWeaponWorkbench(),
  buildSpacesuitWorkbench(),
  buildCookingStation(),
  buildPharmaLab(),
];

const stationMap = new Map<string, CraftingStation>(
  stations.map((s) => [s.id, s])
);

export function getStation(id: string): CraftingStation | undefined {
  return stationMap.get(id);
}

export { stations };
