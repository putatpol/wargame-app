// types/character.ts
export interface Attack {
  ap: number;
  hitOn: number | null;
  range: number;
  damage: number;
}

export interface Skill {
  id: number;
  name: string;
  ap: number;
  hitOn: number | null;
  range: string;
  card: string;
  description: string;
  effect: 
    {
      id: number;
      status: string;
      value: number;
      target: string;
    }[] | null;
}

export interface Character {
  id: number;
  name: string;
  role: string;
  race: string;
  class: string;
  avatar: string;
  status: {
    ap: number;
    move: number;
    hp: number;
    def: number;
    attack: Attack;
  };
  skills: Skill[];
}
