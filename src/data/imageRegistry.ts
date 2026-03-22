import manifest from '../../docs/images/manifest.json';

const CDN_BASE = 'https://charnel.github.io/starfield-companion/images';

export type ItemType = 'weapon' | 'apparel' | 'consumable' | 'resource' | 'material';

type SkillEntry = { tree: string; file: string; ranks: number[] };
type ItemEntry = { file: string; type: string };

const skills = manifest.skills as Record<string, SkillEntry>;
const items = manifest.items as Record<string, ItemEntry>;

export function getSkillImageUrl(
  skillName: string,
  rank: number = 0,
): string | null {
  const entry = skills[skillName];
  if (!entry || !entry.ranks.includes(rank)) return null;
  return `${CDN_BASE}/skills/${entry.file}_rank${rank}.png`;
}

export function getItemImageUrl(itemName: string): string | null {
  const entry = items[itemName];
  if (!entry) return null;
  return `${CDN_BASE}/items/${entry.file}`;
}

export function getItemType(itemName: string): ItemType | undefined {
  const entry = items[itemName];
  return entry?.type as ItemType | undefined;
}

const skillIconMap: Record<string, any> = {
  "Boxing": require("../../assets/images/skills/physical_boxing_rank0.png"),
  "Fitness": require("../../assets/images/skills/physical_fitness_rank0.png"),
  "Stealth": require("../../assets/images/skills/physical_stealth_rank0.png"),
  "Weight Lifting": require("../../assets/images/skills/physical_weightlifting_rank0.png"),
  "Wellness": require("../../assets/images/skills/physical_wellness_rank0.png"),
  "Pain Tolerance": require("../../assets/images/skills/physical_paintolerance_rank0.png"),
  "Nutrition": require("../../assets/images/skills/physical_nutrition_rank0.png"),
  "Gymnastics": require("../../assets/images/skills/physical_gymnastics_rank0.png"),
  "Environmental Conditioning": require("../../assets/images/skills/physical_environmentalconditioning_rank0.png"),
  "Energy Weapon Dissipation": require("../../assets/images/skills/physical_energyweapondissipation_rank0.png"),
  "Cellular Regeneration": require("../../assets/images/skills/physical_cellularregeneration_rank0.png"),
  "Decontamination": require("../../assets/images/skills/physical_decontamination_rank0.png"),
  "Martial Arts": require("../../assets/images/skills/physical_martialarts_rank0.png"),
  "Concealment": require("../../assets/images/skills/physical_concealment_rank0.png"),
  "Neurostrikes": require("../../assets/images/skills/physical_neurostrikes_rank0.png"),
  "Rejuvenation": require("../../assets/images/skills/physical_rejuvenation_rank0.png"),
  "Ballistics": require("../../assets/images/skills/combat_ballistics_rank0.png"),
  "Dueling": require("../../assets/images/skills/combat_dueling_rank0.png"),
  "Lasers": require("../../assets/images/skills/combat_lasers_rank0.png"),
  "Pistol Certification": require("../../assets/images/skills/combat_pistolcertification_rank0.png"),
  "Shotgun Certification": require("../../assets/images/skills/combat_shotguncertification_rank0.png"),
  "Rifle Certification": require("../../assets/images/skills/combat_riflecertification_rank0.png"),
  "Particle Beams": require("../../assets/images/skills/combat_particlebeams_rank0.png"),
  "Incapacitation": require("../../assets/images/skills/combat_incapacitation_rank0.png"),
  "Heavy Weapons Certification": require("../../assets/images/skills/combat_heavyweaponcertification_rank0.png"),
  "Demolitions": require("../../assets/images/skills/combat_demolitions_rank0.png"),
  "Marksmanship": require("../../assets/images/skills/combat_marksmanship_rank0.png"),
  "Rapid Reloading": require("../../assets/images/skills/combat_rapidreloading_rank0.png"),
  "Sniper Certification": require("../../assets/images/skills/combat_snipercertification_rank0.png"),
  "Targeting": require("../../assets/images/skills/combat_targeting_rank0.png"),
  "Sharpshooting": require("../../assets/images/skills/combat_sharpshooting_rank0.png"),
  "Crippling": require("../../assets/images/skills/combat_crippling_rank0.png"),
  "Armor Penetration": require("../../assets/images/skills/combat_armorpenetration_rank0.png"),
  "Astrodynamics": require("../../assets/images/skills/science_astrodynamics_rank0.png"),
  "Geology": require("../../assets/images/skills/science_geology_rank0.png"),
  "Medicine": require("../../assets/images/skills/science_medicine_rank0.png"),
  "Research Methods": require("../../assets/images/skills/science_researchmethods_rank0.png"),
  "Surveying": require("../../assets/images/skills/science_surveying_rank0.png"),
  "Zoology": require("../../assets/images/skills/science_zoology_rank0.png"),
  "Weapon Engineering": require("../../assets/images/skills/science_weaponengineering_rank0.png"),
  "Spacesuit Design": require("../../assets/images/skills/science_spacesuitdesign_rank0.png"),
  "Scanning": require("../../assets/images/skills/science_scanning_rank0.png"),
  "Botany": require("../../assets/images/skills/science_botany_rank0.png"),
  "Astrophysics": require("../../assets/images/skills/science_astrophysics_rank0.png"),
  "Chemistry": require("../../assets/images/skills/science_chemistry_rank0.png"),
  "Outpost Engineering": require("../../assets/images/skills/science_outpostengineering_rank0.png"),
  "Special Projects": require("../../assets/images/skills/science_specialprojects_rank0.png"),
  "Planetary Habitation": require("../../assets/images/skills/science_planetaryhabitation_rank0.png"),
  "Aneutronic Fusion": require("../../assets/images/skills/science_aneutronicfusion_rank0.png"),
  "Commerce": require("../../assets/images/skills/social_commerce_rank0.png"),
  "Gastronomy": require("../../assets/images/skills/social_gastronomy_rank0.png"),
  "Persuasion": require("../../assets/images/skills/social_persuasion_rank0.png"),
  "Scavenging": require("../../assets/images/skills/social_scavenging_rank0.png"),
  "Theft": require("../../assets/images/skills/social_theft_rank0.png"),
  "Negotiation": require("../../assets/images/skills/social_negotiation_rank0.png"),
  "Isolation": require("../../assets/images/skills/social_isolation_rank0.png"),
  "Intimidation": require("../../assets/images/skills/social_intimidation_rank0.png"),
  "Diplomacy": require("../../assets/images/skills/social_diplomacy_rank0.png"),
  "Deception": require("../../assets/images/skills/social_bargaining_rank0.png"),
  "Instigation": require("../../assets/images/skills/social_instigation_rank0.png"),
  "Leadership": require("../../assets/images/skills/social_leadership_rank0.png"),
  "Outpost Management": require("../../assets/images/skills/social_outpostmanagement_rank0.png"),
  "Xenosociology": require("../../assets/images/skills/social_xenosociology_rank0.png"),
  "Ship Command": require("../../assets/images/skills/social_shipcommand_rank0.png"),
  "Manipulation": require("../../assets/images/skills/social_manipulation_rank0.png"),
  "Ballistic Weapon Systems": require("../../assets/images/skills/technology_ballisticweaponsystems_rank0.png"),
  "Boost Pack Training": require("../../assets/images/skills/technology_boostpacktraining_rank0.png"),
  "Piloting": require("../../assets/images/skills/technology_piloting_rank0.png"),
  "Security": require("../../assets/images/skills/technology_security_rank0.png"),
  "Targeting Control Systems": require("../../assets/images/skills/technology_targetingcontrolsystems_rank0.png"),
  "Shield Systems": require("../../assets/images/skills/technology_shieldsystems_rank0.png"),
  "Payloads": require("../../assets/images/skills/technology_payloads_rank0.png"),
  "Engine Systems": require("../../assets/images/skills/technology_enginesystems_rank0.png"),
  "Energy Weapon Systems": require("../../assets/images/skills/technology_energyweaponsystems_rank0.png"),
  "Missile Weapon Systems": require("../../assets/images/skills/technology_missileweaponsystems_rank0.png"),
  "Particle Beam Weapon Systems": require("../../assets/images/skills/technology_particlebeamweaponsystems_rank0.png"),
  "Robotics": require("../../assets/images/skills/technology_robotics_rank0.png"),
  "Starship Design": require("../../assets/images/skills/technology_starshipdesign_rank0.png"),
  "Starship Engineering": require("../../assets/images/skills/technology_starshipengineering_rank0.png"),
  "EM Weapon Systems": require("../../assets/images/skills/technology_emweaponsystems_rank0.png"),
  "Boost Assault Training": require("../../assets/images/skills/technology_boostassaulttraining_rank0.png"),
  "Automated Weapon Systems": require("../../assets/images/skills/technology_turretweaponsystems_rank0.png"),
};

export function getSkillIcon(skillName: string): any | null {
  return skillIconMap[skillName] ?? null;
}

export function hasSkillImage(skillName: string): boolean {
  const entry = skills[skillName];
  return !!entry && entry.ranks.length > 0;
}

export function hasItemImage(itemName: string): boolean {
  return itemName in items;
}

const categoryToImageType: Record<string, ItemType> = {
  weapons: 'weapon',
  pistols: 'weapon',
  shotguns: 'weapon',
  apparel: 'apparel',
  consumables: 'consumable',
  resources: 'resource',
  materials: 'material',
};

export function getCategoryImageType(categoryId: string): ItemType | null {
  return categoryToImageType[categoryId] ?? null;
}

export function getImageTypeForItem(
  categoryId: string,
  item: Record<string, unknown>,
): ItemType | null {
  return categoryToImageType[categoryId] ?? null;
}
