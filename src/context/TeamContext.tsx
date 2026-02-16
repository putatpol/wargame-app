"use client";

import React, { createContext, useContext, useState } from "react";
import characterData from "@/data/character.json";
import statusBuffData from "@/data/statusBuff.json";
import { Character } from "@/interface/character";

export interface Notification {
  id: string;
  message: string;
  type: "success" | "info" | "error";
  timestamp: number;
}

interface TeamContextType {
  teamA: number[]; // ID ของตัวละครในทีม A
  teamB: number[]; // ID ของตัวละครในทีม B
  selectedTeamByCharacter: { [characterId: number]: "A" | "B" | null }; // เก็บว่าตัวละครถูกเลือกไปทีมไหน
  addToTeam: (characterId: number, team: "A" | "B") => void;
  removeFromTeam: (characterId: number, team: "A" | "B") => void;
  isTeamDisabled: (characterId: number, team: "A" | "B") => boolean;
  addRandomCharacters: (count: number, team: "A" | "B") => void;
  resetTeams: () => void;
  notifications: Notification[];
  addNotification: (
    message: string,
    type: "success" | "info" | "error",
  ) => void;
  currentHp: { [characterId: number]: number };
  applyDamage: (characterId: number, damage: number) => void;
  _applyDamageInternal: (characterId: number, damage: number) => void;
  resetHp: (characterId: number) => void;
  adjustHpManual: (characterId: number, newHp: number) => void;
  currentAp: { [characterId: number]: number };
  reduceAp: (characterId: number, amount: number) => void;
  performAttack: (
    attackerId: number,
    defenderId: number,
    success: boolean,
  ) => void;
  endTurn: () => void;
  resetTurn: () => void;
  turnNumber: number;
  characterStatBoost: { [characterId: number]: "move" | "hp" | "def" | "hiton" | null };
  applyStatBoost: (characterId: number, stat: "move" | "hp" | "def" | "hiton") => void;
  activeStatusBuffs: { [characterId: number]: number[] };
  addStatusBuff: (characterId: number, buffId: number) => void;
  removeStatusBuff: (characterId: number, buffId: number) => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const [teamA, setTeamA] = useState<number[]>([]);
  const [teamB, setTeamB] = useState<number[]>([]);
  const [selectedTeamByCharacter, setSelectedTeamByCharacter] = useState<{
    [characterId: number]: "A" | "B" | null;
  }>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Helper: Get race bonus for HP
  const getRaceHpBonus = (character: Character): number => {
    if (character.race === "Goliath") return 3;
    return 0;
  };
  
  // init HP map from character data including race bonuses
  const initialHpMap = (characterData as Character[]).reduce(
    (acc, c) => ({ ...acc, [c.id]: c.status.hp + getRaceHpBonus(c) }),
    {} as { [characterId: number]: number },
  );
  const [currentHp, setCurrentHp] = useState<{ [characterId: number]: number }>(
    () => ({ ...initialHpMap }),
  );
  // init AP map from character data
  const initialApMap = (characterData as Character[]).reduce(
    (acc, c) => ({ ...acc, [c.id]: c.status.ap }),
    {} as { [characterId: number]: number },
  );
  const [currentAp, setCurrentAp] = useState<{ [characterId: number]: number }>(
    () => ({ ...initialApMap }),
  );
  const [turnNumber, setTurnNumber] = useState<number>(1);
  const [characterStatBoost, setCharacterStatBoost] = useState<{
    [characterId: number]: "move" | "hp" | "def" | "hiton" | null;
  }>({});
  const [activeStatusBuffs, setActiveStatusBuffs] = useState<{
    [characterId: number]: number[];
  }>({});

  const addNotification = (
    message: string,
    type: "success" | "info" | "error" = "info",
  ) => {
    const id = `${Date.now()}-${Math.random()}`;
    const notification: Notification = {
      id,
      message,
      type,
      timestamp: Date.now(),
    };

    setNotifications((prev) => [...prev, notification]);

    // ลบ notification หลังจาก 3 วินาที
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  // Internal: apply damage without notification (use in performAttack to avoid duplicate notifications)
  const _applyDamageInternal = (characterId: number, damage: number) => {
    setCurrentHp((prev) => ({
      ...prev,
      [characterId]: Math.max(0, (prev[characterId] ?? 0) - damage),
    }));
  };

  const applyDamage = (characterId: number, damage: number) => {
    setCurrentHp((prev) => {
      const prevHp = prev[characterId] ?? 0;
      const newHp = Math.max(0, prevHp - damage);
      const updated = { ...prev, [characterId]: newHp };

      const character = (characterData as Character[]).find(
        (c) => c.id === characterId,
      );
      const name = character?.name || `#${characterId}`;

      addNotification(
        `💥 ${name} รับความเสียหาย ${damage} (HP: ${newHp})`,
        "info",
      );

      return updated;
    });
  };

  const reduceAp = (characterId: number, amount: number) => {
    setCurrentAp((prev) => ({
      ...prev,
      [characterId]: Math.max(0, (prev[characterId] ?? 0) - amount),
    }));
  };

  const performAttack = (
    attackerId: number,
    defenderId: number,
    success: boolean,
  ) => {
    const characters = characterData as Character[];
    const attacker = characters.find((c) => c.id === attackerId);
    if (!attacker) {
      addNotification(`ไม่พบผู้โจมตี`, "error");
      return;
    }

    const defender = characters.find((c) => c.id === defenderId);
    const defenderName = defender?.name || `#${defenderId}`;

    const apCost = attacker.status.attack?.ap ?? 1;
    const attackerAp = currentAp[attackerId] ?? 0;
    if (attackerAp < apCost) {
      addNotification(`${attacker.name} ไม่มี AP พอสำหรับการโจมตี`, "error");
      return;
    }

    // consume AP
    reduceAp(attackerId, apCost);

    if (success) {
      const dmg = attacker.status.attack?.damage ?? 0;
      // apply damage without showing notification
      _applyDamageInternal(defenderId, dmg);

      // show single notification with complete information
      const newHp = Math.max(0, (currentHp[defenderId] ?? 0) - dmg);
      addNotification(
        `⚔️ ${attacker.name} โจมตี → ${defenderName} สำเร็จ! 💥 DMG: ${dmg}`,
        "success",
      );
    } else {
      addNotification(`${attacker.name} โจมตี ${defenderName} พลาด`, "info");
    }
  };

  const endTurn = () => {
    setTurnNumber((t) => t + 1);
    // restore AP to initial for all characters
    setCurrentAp({ ...initialApMap });
    addNotification(`🕒 จบเทิร์น คืน AP ให้ตัวละครทั้งหมด`, "info");
  };

  const resetTurn = () => {
    setTurnNumber(1);
    // restore AP and HP to initial for all characters
    setCurrentAp({ ...initialApMap });
    setCurrentHp({ ...initialHpMap });
    addNotification(`🕒 รีเซ็ตเทิร์นแล้ว - เลือด และ AP คืนครบ`, "info");
  };

  const resetHp = (characterId: number) => {
    const init = initialHpMap[characterId];
    if (init === undefined) {
      addNotification(`ไม่พบตัวละคร ID ${characterId} เพื่อรีเซท HP`, "error");
      return;
    }
    
    // Include HP stat boost if applied
    const hpWithBoost = characterStatBoost[characterId] === "hp" ? init + 2 : init;
    
    setCurrentHp((prev) => ({ ...prev, [characterId]: hpWithBoost }));
    const character = (characterData as Character[]).find(
      (c) => c.id === characterId,
    );
    addNotification(
      `🔁 รีเซท HP ของ ${character?.name ?? `#${characterId}`}`,
      "info",
    );
  };

  const adjustHpManual = (characterId: number, newHp: number) => {
    const character = (characterData as Character[]).find(
      (c) => c.id === characterId,
    );
    const characterName = character?.name || `#${characterId}`;
    const clampedHp = Math.max(0, newHp);
    const oldHp = currentHp[characterId] ?? character?.status.hp ?? 0;

    // show notification before state update
    if (oldHp !== clampedHp) {
      addNotification(
        `🔧 ปรับเลือด ${characterName}: ${oldHp} → ${clampedHp}`,
        "info"
      );
    }

    // then update HP
    setCurrentHp((prev) => ({
      ...prev,
      [characterId]: clampedHp,
    }));
  };

  const addToTeam = (characterId: number, team: "A" | "B") => {
    const character = (characterData as Character[]).find(
      (char) => char.id === characterId,
    );
    const characterName = character?.name || `Character #${characterId}`;

    if (team === "A") {
      // ถ้าตัวละครอยู่ในทีม B แล้ว ให้ลบออก
      if (teamB.includes(characterId)) {
        setTeamB((prev) => prev.filter((id) => id !== characterId));
      }
      setTeamA((prev) =>
        prev.includes(characterId) ? prev : [...prev, characterId],
      );
    } else {
      // ถ้าตัวละครอยู่ในทีม A แล้ว ให้ลบออก
      if (teamA.includes(characterId)) {
        setTeamA((prev) => prev.filter((id) => id !== characterId));
      }
      setTeamB((prev) =>
        prev.includes(characterId) ? prev : [...prev, characterId],
      );
    }

    setSelectedTeamByCharacter((prev) => ({
      ...prev,
      [characterId]: team,
    }));

    addNotification(`✅ เพิ่ม ${characterName} ไปทีม ${team}`, "success");
  };

  const removeFromTeam = (characterId: number, team: "A" | "B") => {
    const character = (characterData as Character[]).find(
      (char) => char.id === characterId,
    );
    const characterName = character?.name || `Character #${characterId}`;

    if (team === "A") {
      setTeamA((prev) => prev.filter((id) => id !== characterId));
    } else {
      setTeamB((prev) => prev.filter((id) => id !== characterId));
    }


    setSelectedTeamByCharacter((prev) => ({
      ...prev,
      [characterId]: null,
    }));

    // รีเซท stat boost และ status buffs เมื่อลบตัวละครออกจากทีม
    setCharacterStatBoost((prev) => ({
      ...prev,
      [characterId]: null,
    }));

    setActiveStatusBuffs((prev) => ({
      ...prev,
      [characterId]: [],
    }));

    addNotification(`❌ ลบ ${characterName} ออกจากทีม ${team}`, "info");
  };

  const isTeamDisabled = (characterId: number, team: "A" | "B"): boolean => {
    const characterTeam = selectedTeamByCharacter[characterId];

    // หากตัวละครยังไม่ได้เลือกทีม ปุ่มไม่ disable
    if (characterTeam === null || characterTeam === undefined) {
      return false;
    }

    // หากตัวละครอยู่ในทีม A ให้ disable ปุ่ม B และในทางกลับกัน
    return characterTeam !== team;
  };

  const addRandomCharacters = (count: number, team: "A" | "B") => {
    const characters = characterData as Character[];
    const otherTeam = team === "A" ? teamB : teamA;
    const currentTeam = team === "A" ? teamA : teamB;

    // สุ่มเลือกตัวละครที่ยังไม่ได้เลือก
    const availableCharacters = characters.filter(
      (char) => !currentTeam.includes(char.id) && !otherTeam.includes(char.id),
    );

    if (availableCharacters.length === 0) {
      addNotification("ไม่มีตัวละครพอสำหรับสุ่มแล้ว", "error");
      return;
    }

    const countToAdd = Math.min(count, availableCharacters.length);
    const shuffled = availableCharacters.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, countToAdd).map((char) => char.id);

    selected.forEach((id) => {
      if (team === "A") {
        setTeamA((prev) => [...prev, id]);
      } else {
        setTeamB((prev) => [...prev, id]);
      }

      setSelectedTeamByCharacter((prev) => ({
        ...prev,
        [id]: team,
      }));
    });

    const selectedNames = selected
      .map((id) => characters.find((char) => char.id === id)?.name)
      .filter(Boolean)
      .join(", ");

    addNotification(
      `🎲 เพิ่มแบบสุ่ม ${countToAdd} ตัว ไปทีม ${team}: ${selectedNames}`,
      "success",
    );
  };

  const resetTeams = () => {
    setTeamA([]);
    setTeamB([]);
    setSelectedTeamByCharacter({});
    setCurrentHp({ ...initialHpMap });
    addNotification("🔄 รีเซททั้งหมด", "info");
    setCharacterStatBoost({});
    setActiveStatusBuffs({});
  };

  const applyStatBoost = (characterId: number, stat: "move" | "hp" | "def" | "hiton") => {
    const character = (characterData as Character[]).find(
      (c) => c.id === characterId,
    );
    const characterName = character?.name || `#${characterId}`;

    // ตรวจสอบว่าได้เพิ่ม stat ไปแล้วหรือไม่
    if (characterStatBoost[characterId] !== null && characterStatBoost[characterId] !== undefined) {
      addNotification(
        `${characterName} ได้เพิ่ม stat ไปแล้ว ไม่สามารถเปลี่ยนได้`,
        "error",
      );
      return;
    }

    // เพิ่ม stat boost
    setCharacterStatBoost((prev) => ({
      ...prev,
      [characterId]: stat,
    }));
    
    // หากเพิ่ม HP boost ให้เพิ่ม currentHp ด้วย
    if (stat === "hp") {
      setCurrentHp((prev) => ({
        ...prev,
        [characterId]: (prev[characterId] ?? 0) + 2,
      }));
    }

    const statLabels: { [key: string]: string } = {
      move: "Move +1",
      hp: "HP +2",
      def: "Def -1",
      hiton: "Hit On -1",
    };

    addNotification(
      `⭐ ${characterName} ได้เพิ่ม ${statLabels[stat]}`,
      "success",
    );
  };

  const addStatusBuff = (characterId: number, buffId: number) => {
    const characters = characterData as Character[];
    const character = characters.find((c) => c.id === characterId);
    const characterName = character?.name || `#${characterId}`;

    const buff = (statusBuffData as any[]).find((b) => b.id === buffId);
    if (!buff) {
      addNotification(`ไม่พบ status id ${buffId}`, "error");
      return;
    }
    const existing = activeStatusBuffs[characterId] ?? [];
    if (existing.includes(buffId)) {
      addNotification(`${characterName} มีสถานะ ${buff.thaiName} อยู่แล้ว`, "info");
      return;
    }

    setActiveStatusBuffs((prev) => ({
      ...prev,
      [characterId]: [...(prev[characterId] ?? []), buffId],
    }));

    // If the buff is an action, reduce AP by 1
    if (buff.stat === "action") {
      setCurrentAp((prev) => ({
        ...prev,
        [characterId]: Math.max(0, (prev[characterId] ?? 0) - 1),
      }));
    }

    addNotification(`✨ ${characterName} ได้รับ ${buff.thaiName}`, "success");
  };

  const removeStatusBuff = (characterId: number, buffId: number) => {
    const characters = characterData as Character[];
    const character = characters.find((c) => c.id === characterId);
    const characterName = character?.name || `#${characterId}`;
    const buff = (statusBuffData as any[]).find((b) => b.id === buffId);
    const existing = activeStatusBuffs[characterId] ?? [];
    if (!existing.includes(buffId)) {
      // nothing to remove
      return;
    }

    setActiveStatusBuffs((prev) => ({
      ...prev,
      [characterId]: (prev[characterId] ?? []).filter((id) => id !== buffId),
    }));

    addNotification(`🗑️ ลบสถานะ ${buff?.thaiName ?? buffId} จาก ${characterName}`, "info");
  };

  return (
    <TeamContext.Provider
      value={{
        teamA,
        teamB,
        selectedTeamByCharacter,
        addToTeam,
        removeFromTeam,
        isTeamDisabled,
        addRandomCharacters,
        resetTeams,
        notifications,
        addNotification,
        currentHp,
        applyDamage,
        _applyDamageInternal,
        resetHp,
        adjustHpManual,
        currentAp,
        reduceAp,
        performAttack,
        endTurn,
        resetTurn,
        turnNumber,
        characterStatBoost,
        applyStatBoost,
        activeStatusBuffs,
        addStatusBuff,
        removeStatusBuff,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error("useTeam must be used within TeamProvider");
  }
  return context;
}
