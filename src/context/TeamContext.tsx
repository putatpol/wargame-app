"use client";

import React, { createContext, useContext, useState } from "react";
import characterData from "@/data/character.json";
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
  addNotification: (message: string, type: "success" | "info" | "error") => void;
  currentHp: { [characterId: number]: number };
  applyDamage: (characterId: number, damage: number) => void;
  resetHp: (characterId: number) => void;
  currentAp: { [characterId: number]: number };
  performAttack: (attackerId: number, defenderId: number, success: boolean) => void;
  endTurn: () => void;
  turnNumber: number;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const [teamA, setTeamA] = useState<number[]>([]);
  const [teamB, setTeamB] = useState<number[]>([]);
  const [selectedTeamByCharacter, setSelectedTeamByCharacter] = useState<{
    [characterId: number]: "A" | "B" | null;
  }>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  // init HP map from character data
  const initialHpMap = (characterData as Character[]).reduce(
    (acc, c) => ({ ...acc, [c.id]: c.status.hp }),
    {} as { [characterId: number]: number }
  );
  const [currentHp, setCurrentHp] = useState<{ [characterId: number]: number }>(
    () => ({ ...initialHpMap })
  );
  // init AP map from character data
  const initialApMap = (characterData as Character[]).reduce(
    (acc, c) => ({ ...acc, [c.id]: c.status.ap }),
    {} as { [characterId: number]: number }
  );
  const [currentAp, setCurrentAp] = useState<{ [characterId: number]: number }>(
    () => ({ ...initialApMap })
  );
  const [turnNumber, setTurnNumber] = useState<number>(1);

  const addNotification = (
    message: string,
    type: "success" | "info" | "error" = "info"
  ) => {
    const id = `${Date.now()}-${Math.random()}`;
    const notification: Notification = { id, message, type, timestamp: Date.now() };

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
        (c) => c.id === characterId
      );
      const name = character?.name || `#${characterId}`;

      addNotification(
        `💥 ${name} รับความเสียหาย ${damage} (HP: ${newHp})`,
        "info"
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
    success: boolean
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
        "success"
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

  const resetHp = (characterId: number) => {
    const init = initialHpMap[characterId];
    if (init === undefined) {
      addNotification(`ไม่พบตัวละคร ID ${characterId} เพื่อรีเซท HP`, "error");
      return;
    }
    setCurrentHp((prev) => ({ ...prev, [characterId]: init }));
    const character = (characterData as Character[]).find((c) => c.id === characterId);
    addNotification(`🔁 รีเซท HP ของ ${character?.name ?? `#${characterId}`}`, "info");
  };

  const addToTeam = (characterId: number, team: "A" | "B") => {
    const character = (characterData as Character[]).find(
      (char) => char.id === characterId
    );
    const characterName = character?.name || `Character #${characterId}`;

    if (team === "A") {
      // ถ้าตัวละครอยู่ในทีม B แล้ว ให้ลบออก
      if (teamB.includes(characterId)) {
        setTeamB((prev) => prev.filter((id) => id !== characterId));
      }
      setTeamA((prev) =>
        prev.includes(characterId) ? prev : [...prev, characterId]
      );
    } else {
      // ถ้าตัวละครอยู่ในทีม A แล้ว ให้ลบออก
      if (teamA.includes(characterId)) {
        setTeamA((prev) => prev.filter((id) => id !== characterId));
      }
      setTeamB((prev) =>
        prev.includes(characterId) ? prev : [...prev, characterId]
      );
    }

    setSelectedTeamByCharacter((prev) => ({
      ...prev,
      [characterId]: team,
    }));

    addNotification(
      `✅ เพิ่ม ${characterName} ไปทีม ${team}`,
      "success"
    );
  };

  const removeFromTeam = (characterId: number, team: "A" | "B") => {
    const character = (characterData as Character[]).find(
      (char) => char.id === characterId
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

    addNotification(
      `❌ ลบ ${characterName} ออกจากทีม ${team}`,
      "info"
    );
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
      (char) =>
        !currentTeam.includes(char.id) &&
        !otherTeam.includes(char.id)
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
      "success"
    );
  };

  const resetTeams = () => {
    setTeamA([]);
    setTeamB([]);
    setSelectedTeamByCharacter({});
    setCurrentHp({ ...initialHpMap });
    addNotification("🔄 รีเซททั้งหมด", "info");
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
        resetHp,
        currentAp,
        performAttack,
        endTurn,
        turnNumber,
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
