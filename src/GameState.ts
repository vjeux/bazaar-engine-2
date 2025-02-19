import { GameState, BoardCard, BoardSkill, Player } from "./Engine.ts";

// Import JSON types generated by quicktype
import { Enchantments, V2Card, V2Cards } from "./types/cardTypes";
import { Tier } from "./types/shared";
import { EncounterDays, Group } from "./types/encounterTypes";

/* Bugs
 
// Day 1 - Viper
// Toxic Fang's poison is 10% of 5 = 0.5. In combat it does 1 damage but outside it shows 0.
// Not sure how to fix this.
// https://www.youtube.com/watch?v=nPYXguaNr8I

// Day 4 - Flame Juggler
// The skill Burst of Flame seems to trigger when the oppononent reaches 1/3 of life rather than 1/2.

// Freeze skills aren't working properly
getBoardMonster("Volkas Enforcer"),
 */

function _createBoardCardFromCard(
  card: V2Card,
  tier: Tier,
  enchantment: keyof Enchantments | null = null
): BoardCard {
  let attributes: Partial<BoardCard> = {
    Abilities: card.Abilities,
    Auras: card.Auras,
    Localization: {
      Tooltips: card.Localization.Tooltips,
      Title: {
        Text: card.Localization.Title.Text
      }
    }
  };

  // If the provided tier is not available, default to the first tier available.
  if (!card.Tiers || !(tier in card.Tiers)) {
    console.error(
      `Tier ${tier} not found for card ${card.Localization.Title.Text}`
    );
    // Get tier key
    const tierKeys = Object.keys(card.Tiers || {});
    if (tierKeys.length === 0) {
      throw new Error(`Card ${card.Localization.Title.Text} has no tiers`);
    }
    tier = tierKeys[0] as Tier;
  }

  // Iterate over the tiers in order and merge their attributes until the desired tier is reached.
  for (const [tn, tierValues] of Object.entries(card.Tiers || {})) {
    attributes = {
      ...attributes,
      ...(tierValues?.Attributes ?? {}),
      AbilityIds: tierValues?.AbilityIds || attributes.AbilityIds,
      AuraIds: tierValues?.AuraIds || attributes.AuraIds,
      TooltipIds: tierValues?.TooltipIds || attributes.TooltipIds
    };

    if (tn === tier) {
      break;
    }
  }

  if (enchantment) {
    if (!card.Enchantments) {
      throw new Error(
        `No enchantments available for card ${card.Localization.Title.Text}`
      );
    }
    const enchant = card.Enchantments[enchantment];
    if (!enchant) {
      throw new Error(
        `Enchantment ${enchantment} not found for card ${card.Localization.Title.Text}`
      );
    }
    attributes = { ...attributes, ...enchant.Attributes };
    if (enchant.HasAbilities) {
      attributes.Abilities = {
        ...attributes.Abilities,
        ...enchant.Abilities
      };
      attributes.AbilityIds = [
        ...attributes.AbilityIds,
        ...Object.keys(enchant.Abilities)
      ];
    }
    if (enchant.HasAuras) {
      attributes.Auras = { ...attributes.Auras, ...enchant.Auras };
      attributes.AuraIds = [
        ...attributes.AuraIds,
        ...Object.keys(enchant.Auras)
      ];
    }
    attributes.Tags = [...(attributes.Tags ?? []), ...enchant.Tags];
    attributes.HiddenTags = [
      ...(attributes.HiddenTags ?? []),
      ...enchant.HiddenTags
    ];
    attributes.Localization.Tooltips = [
      ...attributes.Localization.Tooltips,
      ...enchant.Localization.Tooltips
    ];
    attributes.TooltipIds = [
      ...attributes.TooltipIds,
      ...enchant.Localization.Tooltips.map((tooltip) =>
        attributes.Localization.Tooltips.indexOf(tooltip)
      )
    ];
    attributes.Localization.Title.Text = `${enchantment} ${attributes.Localization.Title.Text}`;
  }

  const result = {
    card: card,
    tick: 0,
    Slow: 0,
    Freeze: 0,
    Haste: 0,
    CritChance: 0,
    DamageCrit: 0,
    tier: tier,
    Enchantment: enchantment,
    isDisabled: false,
    ...attributes
  };

  return result;
}

function getBoardCard(
  Cards: V2Cards,
  name: string,
  tier: Tier,
  enchantment: keyof Enchantments | null = null
): BoardCard {
  const CardsValues = Object.values(Cards);
  const card = CardsValues.find((c) => c.Localization?.Title?.Text === name);
  if (!card) {
    throw new Error(`Card ${name} not found`);
  }
  return _createBoardCardFromCard(card, tier, enchantment);
}

export function getDefaultTierBoardCard(Cards: V2Cards, name: string) {
  const CardsValues = Object.values(Cards);
  const card = CardsValues.find((c) => c.Localization?.Title?.Text === name);
  if (!card) {
    throw new Error(`Card ${name} not found`);
  }
  const tierKeys = Object.keys(card.Tiers || {});
  if (tierKeys.length === 0) {
    throw new Error(`Card ${card.Localization.Title.Text} has no tiers`);
  }
  const tier = tierKeys[0] as Tier;
  return getBoardCard(Cards, name, tier);
}

function getBoardCardFromId(
  Cards: V2Cards,
  cardId: string,
  tier: Tier,
  enchantment: keyof Enchantments | null = null
): BoardCard {
  const card = Cards[cardId];
  if (!card) {
    throw new Error(`Card from id ${cardId} not found`);
  }
  return _createBoardCardFromCard(card, tier, enchantment);
}

function getBoardSkill(
  Cards: V2Cards,
  name: string,
  tier: Tier,
  modifiers: any = {}
): BoardSkill {
  const CardsValues = Object.values(Cards);
  const card = CardsValues.find(
    (card) => card.Localization.Title.Text === name
  );
  if (!card) {
    throw new Error(`Card for Skill ${name} not found`);
  }
  let attributes: Partial<BoardSkill> = {
    Abilities: card.Abilities,
    Auras: card.Auras,
    Localization: {
      Tooltips: card.Localization.Tooltips,
      Title: {
        Text: card.Localization.Title.Text
      }
    }
  };
  if (!card.Tiers || !card.Tiers[tier]) {
    throw new Error(
      name +
        " doesn't have tier " +
        tier +
        ", the first one is " +
        Object.keys(card.Tiers || {})[0]
    );
  }
  const tierNames = Object.keys(card.Tiers) as Tier[];
  for (let i = 0; i < tierNames.length; ++i) {
    const tierName = tierNames[i];
    const tierValues = card.Tiers[tierName];
    attributes = {
      ...attributes,
      ...tierValues?.Attributes,
      AbilityIds: tierValues?.AbilityIds,
      AuraIds: tierValues?.AuraIds,
      TooltipIds: tierValues?.TooltipIds
    };
    if (tierName === tier) {
      break;
    }
  }
  const result = {
    card,
    ...attributes,
    tier
  };
  return result;
}

function getBoardPlayer(
  stats: Omit<Partial<Player>, "board"> & { HealthMax: number },
  boardCards: BoardCard[],
  boardSkills: BoardSkill[]
): Player {
  return {
    HealthMax: stats.HealthMax,
    Health: stats.HealthMax,
    HealthRegen: stats.HealthRegen ?? 0,
    Shield: 0,
    Burn: 0,
    Poison: 0,
    Gold: 0,
    Income: 0,
    board: [...boardCards, ...boardSkills]
  };
}

function getBoardPlayerFromMonsterCard(Cards: V2Cards, monsterCard: Group) {
  return getBoardPlayer(
    { HealthMax: monsterCard.health },
    monsterCard.items.map((item) =>
      getBoardCardFromId(
        Cards,
        item.card.id,
        item.tierType,
        item.enchantmentType
      )
    ),
    monsterCard.skills.map((item) =>
      getBoardCardFromId(Cards, item.card.id, item.tierType, null)
    )
  );
}

function getBoardMonster(
  Cards: V2Cards,
  Encounters: EncounterDays,
  name: string
) {
  for (let i = 0; i < Encounters.data.length; ++i) {
    const day = Encounters.data[i];
    for (let j = 0; j < day.groups.length; ++j) {
      const group = day.groups[j];
      for (let k = 0; k < group.length; ++k) {
        const monsterCard = group[k];
        if (monsterCard.cardName === name) {
          return getBoardPlayerFromMonsterCard(Cards, monsterCard);
        }
      }
    }
  }
  throw new Error(`Can't find a monster with name ${name}`);
}

function sfc32(a: number, b: number, c: number, d: number) {
  return function () {
    a |= 0;
    b |= 0;
    c |= 0;
    d |= 0;
    let t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

export interface MonsterConfig {
  type: "monster";
  name: string;
}

export interface PlayerCardConfig {
  name: string;
  tier: Tier;
  enchantment?: keyof Enchantments | null;
}

export interface PlayerSkillConfig {
  name: string;
  tier: Tier;
}

export interface PlayerConfig {
  type: "player";
  health?: number;
  healthRegen?: number;
  cards?: PlayerCardConfig[];
  skills?: PlayerSkillConfig[];
}

export function getInitialGameState(
  Cards: V2Cards,
  Encounters: EncounterDays,
  config: (MonsterConfig | PlayerConfig)[]
): GameState {
  return {
    tick: 0,
    isPlaying: true,
    players: config.map((player) => {
      if (player.type === "monster") {
        if (!player.name) throw new Error("Monster name is required");
        return getBoardMonster(Cards, Encounters, player.name);
      } else {
        return getBoardPlayer(
          {
            HealthMax: player.health ?? 3500,
            HealthRegen: player.healthRegen ?? 0
          },
          (player.cards ?? []).map((c) =>
            getBoardCard(Cards, c.name, c.tier, c.enchantment)
          ),
          (player.skills ?? []).map((s) => getBoardSkill(Cards, s.name, s.tier))
        );
      }
    }),
    multicast: [],
    getRand: sfc32(0, 10000, 10000000, 100000000000)
  };
}
