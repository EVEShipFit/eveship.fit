/** A killmail, as `GET /killmails/{killmail_id}/{killmail_hash}` gives it. */
export interface Killmail {
  killmail_id: number;
  killmail_time: string;
  solar_system_id: number;
  moon_id?: number;
  war_id?: number;
  victim: KillmailVictim;
  attackers: KillmailAttacker[];
}

/** The ship that died, with what it had on board. */
export interface KillmailVictim {
  ship_type_id: number;
  damage_taken: number;
  character_id?: number;
  corporation_id?: number;
  alliance_id?: number;
  faction_id?: number;
  items?: KillmailItem[];
  position?: { x: number; y: number; z: number };
}

/** An item of a killmail. */
export interface KillmailItem {
  item_type_id: number;
  flag: number;
  singleton: number;
  quantity_destroyed?: number;
  quantity_dropped?: number;
  items?: KillmailItem[];
}

/** Someone who damaged the victim. */
export interface KillmailAttacker {
  damage_done: number;
  final_blow: boolean;
  security_status: number;
  ship_type_id?: number;
  weapon_type_id?: number;
  character_id?: number;
  corporation_id?: number;
  alliance_id?: number;
  faction_id?: number;
}

/** The price of a type, as `GET /markets/prices` gives it. */
export interface MarketPrice {
  type_id: number;
  average_price?: number;
  adjusted_price?: number;
}

/** A character's skills, as `GET /characters/{character_id}/skills` gives it. */
export interface CharacterSkills {
  skills: CharacterSkill[];
  total_sp: number;
  unallocated_sp?: number;
}

/** A skill a character trained; an Alpha clone can only use up to `active_skill_level`. */
export interface CharacterSkill {
  skill_id: number;
  active_skill_level: number;
  trained_skill_level: number;
  skillpoints_in_skill: number;
}

/** A skill in a character's queue, as `GET /characters/{character_id}/skillqueue` gives it. */
export interface SkillQueueEntry {
  skill_id: number;
  finished_level: number;
  queue_position: number;
  start_date?: string;
  finish_date?: string;
  level_start_sp?: number;
  level_end_sp?: number;
  training_start_sp?: number;
}

/** A fitting a character saved in game, as `GET /characters/{character_id}/fittings` gives it. */
export interface CharacterFitting {
  fitting_id: number;
  name: string;
  description: string;
  ship_type_id: number;
  items: FittingItem[];
}

/** An item of a fitting; `flag` is where it sits, like `HiSlot0` or `DroneBay`. */
export interface FittingItem {
  type_id: number;
  flag: string;
  quantity: number;
}
