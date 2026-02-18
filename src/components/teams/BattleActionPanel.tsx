import Image from "next/image";
import React from "react";
import { Character } from "@/interface/character";

type BattleActionPanelProps = {
  changeBattleAction: boolean;
  onToggleSide: () => void;
  onClose: () => void;
  attackerId: number | null;
  defenderId: number | null;
  getCharacterById: (id: number) => Character | undefined;
  getTeamColorClass: (characterId?: number | null) => string;
  getDisplayStat: (characterId: number, statType: string) => number;
  getAttackBonus: (characterId?: number | null) => number;
  currentAp: Record<number, number> | undefined;
  currentHp: Record<number, number> | undefined;
  meleeBonus: boolean;
  setMeleeBonus: (value: boolean) => void;
  damageBonus: boolean;
  setDamageBonus: (value: boolean) => void;
  gangUp: boolean;
  setGangUp: (value: boolean) => void;
  lightCover: boolean;
  setLightCover: (value: boolean) => void;
  counterAttack: boolean;
  setCounterAttack: (value: boolean) => void;
  attackFree: boolean;
  setAttackFree: (value: boolean) => void;
  selectedSkill: number | null;
  setSelectedSkill: (value: number | null) => void;
  isAttacking: boolean;
  setIsAttacking: (value: boolean) => void;
  addNotification: (message: string, type: "info" | "error" | "success") => void;
  reduceAp: (characterId: number, amount: number) => void;
  performAttack: (
    attackerId: number,
    defenderId: number,
    isHit: boolean,
    damageBonus: boolean,
    attackFree: boolean,
  ) => void;
  incrementAttackCount: (characterId: number) => void;
  applyDamageInternal: (characterId: number, damage: number) => void;
  onClearCardModal: () => void;
};

export default function BattleActionPanel({
  changeBattleAction,
  onToggleSide,
  onClose,
  attackerId,
  defenderId,
  getCharacterById,
  getTeamColorClass,
  getDisplayStat,
  getAttackBonus,
  currentAp,
  currentHp,
  meleeBonus,
  setMeleeBonus,
  damageBonus,
  setDamageBonus,
  gangUp,
  setGangUp,
  lightCover,
  setLightCover,
  counterAttack,
  setCounterAttack,
  attackFree,
  setAttackFree,
  selectedSkill,
  setSelectedSkill,
  isAttacking,
  setIsAttacking,
  addNotification,
  reduceAp,
  performAttack,
  incrementAttackCount,
  applyDamageInternal,
  onClearCardModal,
}: BattleActionPanelProps) {
  const selectedSkillData =
    attackerId && selectedSkill
      ? getCharacterById(attackerId)?.skills.find(
        (skill) => skill.id === selectedSkill,
      )
      : undefined;

  const attackerHitOn =
    attackerId && selectedSkillData
      ? selectedSkillData.hitOn
      : attackerId
        ? getDisplayStat(attackerId, "hiton")
        : null;

  return (
    <div
      className={`${changeBattleAction ? "left-4" : "right-4"} fixed bottom-4 z-50`}
    >
      <div className="bg-gray-800 border border-amber-500 rounded-lg p-4 w-full md:w-auto max-h-[80vh] overflow-auto shadow-xl">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-gray-300">Battle Action</div>
          <div className="flex gap-2 text-sm">
            <button
              onClick={onToggleSide}
              className="text-white bg-gray-700 hover:bg-gray-600 rounded px-2 py-1"
            >
              {changeBattleAction ? "»" : "«"}
            </button>
            <button
              onClick={onClose}
              className="text-white bg-gray-700 hover:bg-gray-600 rounded px-2 py-1"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="text-sm text-gray-200 mb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {attackerId && (
                <Image
                  src={getCharacterById(attackerId)?.avatar || ""}
                  alt="attacker"
                  width={40}
                  height={40}
                  className="rounded border border-amber-300"
                />
              )}
              <div>
                ผู้โจมตี:{" "}
                <b className="text-amber-300">
                  {attackerId ? getCharacterById(attackerId)?.name : "-"}
                </b>
              </div>
            </div>
            {attackerId && (
              <div className="text-xs text-gray-400">
                Hit:{" "}
                <span className={`${getTeamColorClass(attackerId)} text-xl`}>
                  {(attackerHitOn ?? 0) +
                    (meleeBonus ? 4 : 0) +
                    getAttackBonus(attackerId) -
                    (gangUp ? 2 : 0)}
                  +
                </span>
              </div>
            )}
          </div>
          <div className="mt-2 flex justify-between items-center">
            <div className="flex items-center gap-2">
              {defenderId && (
                <Image
                  src={getCharacterById(defenderId)?.avatar || ""}
                  alt="defender"
                  width={40}
                  height={40}
                  className="rounded border border-amber-300"
                />
              )}
              <div>
                ผู้ป้องกัน:{" "}
                <b className="text-amber-300">
                  {defenderId ? getCharacterById(defenderId)?.name : "-"}
                </b>
              </div>
            </div>
            {defenderId && (
              <div className="text-xs text-gray-400">
                Def:{" "}
                <span className={`${getTeamColorClass(defenderId)} text-xl`}>
                  {getDisplayStat(defenderId, "def") - (lightCover ? 2 : 0)}+
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {attackerId &&
            (getCharacterById(attackerId)?.status.attack.range ?? 0) > 1 && (
              <button
                onClick={() => setMeleeBonus(!meleeBonus)}
                className={`w-full px-2 py-1 rounded transition text-xs ${meleeBonus
                    ? "bg-gray-600 hover:bg-gray-700 text-white"
                    : " border border-gray-600 hover:bg-gray-700 text-white"
                  }`}
              >
                {meleeBonus ? "⚔︎ Melee (+4)" : "Melee"}
              </button>
            )}
          {attackerId &&
            getCharacterById(attackerId)?.role === "Vanguard" && (
              <button
                onClick={() => setDamageBonus(!damageBonus)}
                className={`w-full px-2 py-1 rounded transition text-xs ${damageBonus
                    ? "bg-gray-600 hover:bg-gray-700 text-white"
                    : " border border-gray-600 hover:bg-gray-700 text-white"
                  }`}
              >
                {damageBonus ? "⚡︎ Charge (+1)" : "Charge"}
              </button>
            )}
          <button
            onClick={() => setGangUp(!gangUp)}
            className={`w-full px-2 py-1 rounded transition text-xs ${gangUp
                ? "bg-gray-600 hover:bg-gray-700 text-white"
                : " border border-gray-600 hover:bg-gray-700 text-white"
              }`}
          >
            {gangUp ? "⚔︎ Gang (-2)" : "Gang"}
          </button>
          <button
            onClick={() => setLightCover(!lightCover)}
            className={`w-full px-2 py-1 rounded transition text-xs ${lightCover
                ? "bg-gray-600 hover:bg-gray-700 text-white"
                : " border border-gray-600 hover:bg-gray-700 text-white"
              }`}
          >
            {lightCover ? "⛉ Cover (-2)" : "Cover"}
          </button>
          {defenderId && (
            <button
              onClick={() => setCounterAttack(!counterAttack)}
              className={`w-full px-2 py-1 rounded transition text-xs ${counterAttack
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : " border border-red-500 hover:bg-red-900/30 text-red-300"
                }`}
            >
              {counterAttack ? "🗡 Counter" : "Counter"}
            </button>
          )}
          <button
            onClick={() => setAttackFree(!attackFree)}
            className={`w-full px-2 py-1 rounded transition text-xs ${attackFree
                ? "bg-green-600 hover:bg-green-700 text-white"
                : " border border-green-500 hover:bg-green-900/30 text-green-300"
              }`}
          >
            {attackFree ? "🗡 Free" : "Free"}
          </button>
        </div>

        {/* Skill Selection */}
        {attackerId && (
          <div className="mb-3 p-2 bg-gray-700/50 rounded">
            <p className="text-xs font-bold text-gray-300 mb-2">ใช้สกิล</p>
            <div className="grid grid-cols-2 gap-1">
              {(getCharacterById(attackerId)?.skills ?? []).map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => {
                    setSelectedSkill(
                      selectedSkill === skill.id ? null : skill.id,
                    );
                  }}
                  className={`px-2 py-1 rounded text-xs font-semibold transition ${selectedSkill === skill.id
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : "border border-purple-500 hover:bg-purple-900/30 text-purple-300"
                    } ${(currentAp?.[attackerId] ?? 0) < skill.ap
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                    }`}
                  disabled={(currentAp?.[attackerId] ?? 0) < skill.ap}
                  title={`${skill.name} - AP Cost: ${skill.ap}`}
                >
                  {skill.name}
                  <span className="text-xs text-yellow-300 ml-1">
                    ({skill.ap}AP)
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Skill Usage Buttons */}
        {selectedSkill && attackerId && (
          <div className="mb-3 p-2 bg-purple-900/30 border border-purple-600 rounded">
            <Image
              alt={
                getCharacterById(attackerId)?.skills.find(
                  (s) => s.id === selectedSkill,
                )?.name || "Skill"
              }
              src={
                getCharacterById(attackerId)?.skills.find(
                  (s) => s.id === selectedSkill,
                )?.card || ""
              }
              width={300}
              height={600}
              className="rounded-lg shadow-2xl"
              priority
            />
            <p className="text-xs text-purple-300 my-2">
              {getCharacterById(attackerId)?.skills.find(
                (s) => s.id === selectedSkill,
              )?.name || "Skill"}{" "}
              - ค่าใช้:{" "}
              {
                getCharacterById(attackerId)?.skills.find(
                  (s) => s.id === selectedSkill,
                )?.ap
              }{" "}
              AP
            </p>
            <div className="flex gap-2">
              <button
                disabled={isAttacking}
                onClick={() => {
                  if (!attackerId || !defenderId) {
                    addNotification("กรุณาเลือกผู้โจมตีและผู้ป้องกัน", "error");
                    return;
                  }
                  if (attackerId === defenderId) {
                    addNotification("ไม่สามารถโจมตีตัวเองได้", "error");
                    return;
                  }
                  const skill = getCharacterById(attackerId)?.skills.find(
                    (s) => s.id === selectedSkill,
                  );
                  if (!skill) {
                    addNotification("ไม่พบสกิล", "error");
                    return;
                  }
                  const currentCharAp = currentAp?.[attackerId] ?? 0;
                  if (currentCharAp < skill.ap) {
                    addNotification(
                      `${getCharacterById(attackerId)?.name} ไม่มี AP พอ (ต้อง: ${skill.ap}, มี: ${currentCharAp})`,
                      "error",
                    );
                    return;
                  }
                  setIsAttacking(true);
                  reduceAp(attackerId, skill.ap);
                  const attacker = getCharacterById(attackerId);
                  const defender = getCharacterById(defenderId);
                  addNotification(
                    `✨ ${attacker?.name} ใช้ ${skill.name} โจมตี ${defender?.name}`,
                    "success",
                  );
                  setTimeout(() => {
                    setIsAttacking(false);
                    setMeleeBonus(false);
                    setDamageBonus(false);
                    setGangUp(false);
                    setLightCover(false);
                    setAttackFree(false);
                    setSelectedSkill(null);
                  }, 2000);
                  onClearCardModal();
                }}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 disabled:opacity-50 text-white px-3 py-2 rounded transition text-sm font-semibold"
              >
                ใช้สกิล
              </button>
            </div>
          </div>
        )}

        {/* Counter Attack Confirmation */}
        {counterAttack && attackerId && defenderId ? (
          <div className="mb-3 p-2 bg-red-900/30 border border-red-600 rounded">
            <p className="text-xs text-red-300 mb-2">
              ✓ {getCharacterById(defenderId)?.name} จะโจมตีกลับ (AP ไม่ลด)
            </p>
            <div className="text-xs text-red-200 mb-2 space-y-1">
              <div>
                <span className="font-semibold">โจมตีกลับ:</span>{" "}
                {getCharacterById(defenderId)?.name}
                <br />
                <span className="text-red-300">
                  🎯 Hit On: {getDisplayStat(defenderId, "hiton")}+
                </span>
                <span className="text-orange-300 ml-2">
                  💥 DMG: {getCharacterById(defenderId)?.status.attack.damage}
                </span>
              </div>
              <div>
                <span className="font-semibold">ถูกโจมตี:</span>{" "}
                {getCharacterById(attackerId)?.name}
                <br />
                <span className="text-blue-300">
                  🛡️ DEF: {getDisplayStat(attackerId, "def")}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                disabled={isAttacking}
                onClick={() => {
                  if (!attackerId || !defenderId) {
                    addNotification("กรุณาเลือกผู้โจมตีและผู้ป้องกัน", "error");
                    return;
                  }
                  setIsAttacking(true);
                  const defender = getCharacterById(defenderId);
                  const attacker = getCharacterById(attackerId);
                  const counterDamage = defender?.status.attack.damage ?? 0;
                  const currentCharHp = currentHp?.[attackerId] ?? 0;
                  const newHp = Math.max(0, currentCharHp - counterDamage);

                  // Counter attack สำเร็จ - ลด HP ของผู้โจมตี
                  applyDamageInternal(attackerId, counterDamage);

                  // แจ้งเตือนครั้งเดียว
                  addNotification(
                    `⚡ ${defender?.name} โจมตีกลับ ${attacker?.name}! 💥 DMG: ${counterDamage} (HP: ${newHp})`,
                    "success",
                  );

                  setTimeout(() => {
                    setIsAttacking(false);
                    setMeleeBonus(false);
                    setDamageBonus(false);
                    setGangUp(false);
                    setLightCover(false);
                    setAttackFree(false);
                    setCounterAttack(false);
                  }, 2000);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-900 disabled:opacity-50 text-white px-3 py-1 rounded transition text-sm font-semibold"
              >
                Counter <br /> Attack
              </button>
              <button
                disabled={isAttacking}
                onClick={() => {
                  if (!attackerId || !defenderId) {
                    addNotification("กรุณาเลือกผู้โจมตีและผู้ป้องกัน", "error");
                    return;
                  }
                  setIsAttacking(true);
                  const defender = getCharacterById(defenderId);
                  const attacker = getCharacterById(attackerId);
                  const baseDmg = defender?.status.attack.damage ?? 0;
                  const critDmg = Math.ceil(baseDmg * 1.5);
                  const currentCharHp = currentHp?.[attackerId] ?? 0;
                  const newHp = Math.max(0, currentCharHp - critDmg);

                  applyDamageInternal(attackerId, critDmg);

                  addNotification(
                    `⚡ ${defender?.name} โจมตีกลับ Critical! 💥 DMG: ${critDmg} (HP: ${newHp})`,
                    "success",
                  );

                  setTimeout(() => {
                    setIsAttacking(false);
                    setCounterAttack(false);
                  }, 2000);
                }}
                className="flex-1 text-white bg-amber-700 hover:bg-amber-800 disabled:bg-amber-900 disabled:opacity-50 px-3 py-1 rounded transition text-sm font-semibold"
              >
                Counter <br /> Critical
              </button>
              <button
                disabled={isAttacking}
                onClick={() => {
                  if (!attackerId || !defenderId) {
                    addNotification("กรุณาเลือกผู้โจมตีและผู้ป้องกัน", "error");
                    return;
                  }
                  setIsAttacking(true);
                  const defender = getCharacterById(defenderId);
                  const attacker = getCharacterById(attackerId);

                  addNotification(
                    `⚡ ${defender?.name} โจมตีกลับ ${attacker?.name} พลาด!`,
                    "info",
                  );

                  setTimeout(() => {
                    setIsAttacking(false);
                    setCounterAttack(false);
                  }, 2000);
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:opacity-50 text-white px-3 py-1 rounded transition text-sm font-semibold"
              >
                Counter <br /> Failed
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              disabled={
                isAttacking ||
                (attackerId !== null &&
                  !attackFree &&
                  (currentAp?.[attackerId] ?? 0) <
                  (getCharacterById(attackerId)?.status.attack.ap ?? 1))
              }
              onClick={() => {
                if (!attackerId || !defenderId) {
                  addNotification("กรุณาเลือกผู้โจมตีและผู้ป้องกัน", "error");
                  return;
                }
                if (attackerId === defenderId) {
                  addNotification("ไม่สามารถโจมตีตัวเองได้", "error");
                  return;
                }
                setIsAttacking(true);
                // Normal successful attack (consume AP inside performAttack)
                // increment attack count for sequence-based penalty/bonus
                incrementAttackCount(attackerId as number);
                performAttack(
                  attackerId as number,
                  defenderId as number,
                  true,
                  damageBonus,
                  attackFree,
                );
                setTimeout(() => {
                  setIsAttacking(false);
                  setMeleeBonus(false);
                  setDamageBonus(false);
                  setGangUp(false);
                  setLightCover(false);
                  setAttackFree(false);
                }, 3000);
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-900 disabled:opacity-50 text-white px-3 py-2 rounded transition"
            >
              Attack
            </button>
            <button
              disabled={isAttacking}
              onClick={() => {
                if (!attackerId || !defenderId) {
                  addNotification("กรุณาเลือกผู้โจมตีและผู้ป้องกัน", "error");
                  return;
                }
                if (attackerId === defenderId) {
                  addNotification("ไม่สามารถโจมตีตัวเองได้", "error");
                  return;
                }

                const attacker = getCharacterById(attackerId);
                if (!attacker) return;

                const apCost = attacker.status.attack?.ap ?? 1;
                const attackerAp = currentAp?.[attackerId] ?? 0;
                if (!attackFree && attackerAp < apCost) {
                  addNotification(
                    `${attacker.name} ไม่มี AP พอสำหรับการโจมตี`,
                    "error",
                  );
                  return;
                }

                setIsAttacking(true);
                // consume AP
                reduceAp(attackerId, apCost);
                if (!attackFree) {
                  reduceAp(attackerId, apCost);
                }

                // increment attack count for sequence-based penalty/bonus
                incrementAttackCount(attackerId as number);

                const baseDmg = attacker.status.attack?.damage ?? 0;
                const critDmg =
                  Math.ceil(baseDmg * 1.5) + (damageBonus ? 1 : 0);

                // apply damage without duplicate notification
                applyDamageInternal(defenderId, critDmg);

                const newHp = Math.max(0, (currentHp?.[defenderId] ?? 0) - critDmg);
                addNotification(
                  `💥 ${attacker.name} โจมตีแบบ Critical → ${getCharacterById(defenderId)?.name}! DMG: ${critDmg} (HP: ${newHp})`,
                  "success",
                );

                setTimeout(() => {
                  setIsAttacking(false);
                  setMeleeBonus(false);
                  setDamageBonus(false);
                  setGangUp(false);
                  setLightCover(false);
                  setAttackFree(false);
                }, 3000);
              }}
              className="flex-1 text-white bg-amber-700 hover:bg-amber-800 disabled:bg-amber-900 disabled:opacity-50 px-3 py-2 rounded transition"
            >
              Critical
            </button>
            <button
              disabled={isAttacking}
              onClick={() => {
                if (!attackerId || !defenderId) {
                  addNotification("กรุณาเลือกผู้โจมตีและผู้ป้องกัน", "error");
                  return;
                }
                if (attackerId === defenderId) {
                  addNotification("ไม่สามารถโจมตีตัวเองได้", "error");
                  return;
                }
                setIsAttacking(true);
                // increment attack count for sequence-based penalty/bonus
                incrementAttackCount(attackerId as number);
                performAttack(
                  attackerId as number,
                  defenderId as number,
                  false,
                  damageBonus,
                  attackFree,
                );
                setTimeout(() => {
                  setIsAttacking(false);
                  setMeleeBonus(false);
                  setDamageBonus(false);
                  setGangUp(false);
                  setLightCover(false);
                  setAttackFree(false);
                }, 3000);
              }}
              className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:opacity-50 text-white px-3 py-2 rounded transition"
            >
              Failed
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
