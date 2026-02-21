export interface StatusBuff {
  id: number;
  engName: string;
  thaiName: string;
  stat: string;
  description: string;
  image: string;
  effect: 
    {
      stat: "hitOn" | "atk" | "def" | "move" | "ap"| "hp" | "skill" | "resist";
      value: number;
    }[];
  resist: {
    dice: number | null;
    ap: number | null;
    turn: number | null;
  };
}
