"use client";

import Image from "next/image";
import characterData from "@/data/character.json";
import statusBuffs from "@/data/statusBuff.json";
import raceData from "@/data/race.json";
import { Character } from "@/interface/character";
import { useTeam } from "@/context/TeamContext";
import React from "react";
import { StatusBuff } from "@/interface/status";
import Notification from "@/components/Notification";
import CardModal from "@/components/CardModal";

export default function TeamsPage() {
  const characters = characterData as Character[];
  const {
    teamA,
    teamB,
    removeFromTeam,
    currentHp,
    currentAp,
    performAttack,
    applyDamage,
    addNotification,
    resetHp,
    adjustHpManual,
    turnNumber,
    endTurn,
    resetTurn,
    notifications,
    characterStatBoost,
    applyStatBoost,
    activeStatusBuffs,
    addStatusBuff,
    removeStatusBuff,
    reduceAp,
    _applyDamageInternal,
  } = useTeam();
  const [attackerId, setAttackerId] = React.useState<number | null>(null);
  const [defenderId, setDefenderId] = React.useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = React.useState<number | null>(null);
  const [isAttacking, setIsAttacking] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState<{
    characterId: number;
    characterName: string;
    team: "A" | "B";
  } | null>(null);
  const [cardModal, setCardModal] = React.useState<{
    cardImage: string;
    characterName: string;
  } | null>(null);
  const [actionPanelVisible, setActionPanelVisible] = React.useState(false);
  const [hpAdjustModal, setHpAdjustModal] = React.useState<{
    characterId: number;
    characterName: string;
    currentHp: number;
  } | null>(null);
  const [hpAdjustValue, setHpAdjustValue] = React.useState(0);
  const [meleeBonus, setMeleeBonus] = React.useState(false);
  const [gangUp, setGangUp] = React.useState(false)
  const [lightCover, setLightCover] = React.useState(false);
  const [counterAttack, setCounterAttack] = React.useState(false);
  const [selectedSkill, setSelectedSkill] = React.useState<number | null>(null);
  const [statBoostModal, setStatBoostModal] = React.useState<{
    characterId: number;
    characterName: string;
    race: string;
  } | null>(null);
  const [statusModal, setStatusModal] = React.useState<{
    characterId: number;
    characterName: string;
  } | null>(null);
  const [changeBattleAction, setChangeBattleAction] = React.useState(true);
  const [attackCounts, setAttackCounts] = React.useState<Record<number, number>>({});

  const incrementAttackCount = (characterId: number) => {
    setAttackCounts((prev) => ({ ...(prev ?? {}), [characterId]: (prev?.[characterId] ?? 0) + 1 }));
  };

  const getAttackBonus = (characterId?: number | null) => {
    if (characterId == null) return 0;
    const n = attackCounts[characterId] ?? 0;
    // each button press increases hit by +2: n presses => +2 * n
    return 2 * n;
  };

  // reset attack counts when turn changes
  React.useEffect(() => {
    setAttackCounts({});
  }, [turnNumber]);

  const getCharacterById = (id: number) =>
    characters.find((char) => char.id === id);

  const getTeamColorClass = (characterId?: number | null) => {
    if (characterId == null) return "text-gray-400";
    if (teamA.includes(characterId)) return "text-blue-500";
    if (teamB.includes(characterId)) return "text-green-500";
    return "text-gray-400";
  };

  const getRaceBonus = (characterId: number, statType: string): number => {
    const character = getCharacterById(characterId);
    if (!character) return 0;

    if (character.race === "Goliath") {
      if (statType === "hp") return 3;
      if (statType === "def") return 1;
    }

    if (character.race === "Elf") {
      if (statType === "move") return 1;
    }

    if (character.race === "Dwarf") {
      if (statType === "def") return 1;
      if (statType === "move") return 1;
    }

    return 0;
  };

  const getStatBoostByType = (
    characterId: number,
    statType: string,
  ): number => {
    const boost = characterStatBoost[characterId];
    const character = getCharacterById(characterId);
    if (!character) return 0;

    let humanBoost = 0;
    if (boost === "move" && statType === "move") humanBoost = 1;
    if (boost === "hp" && statType === "hp") humanBoost = 2;
    if (boost === "def" && statType === "def") humanBoost = -1;
    if (boost === "hiton" && statType === "hiton") humanBoost = -1;

    const raceBonus = getRaceBonus(characterId, statType);
    return humanBoost + raceBonus;
  };

  const getDisplayStat = (characterId: number, statType: string): number => {
    const character = getCharacterById(characterId);
    if (!character) return 0;

    let baseStat = 0;
    if (statType === "hiton") {
      baseStat = character.status.attack.hitOn ?? 0;
    } else if (statType === "move" || statType === "def" || statType === "hp") {
      baseStat = character.status[statType] as number;
    }

    const boost = getStatBoostByType(characterId, statType);
    return baseStat + boost;
  };

  const renderTeam = (
    teamIds: number[],
    teamName: string,
    teamColor: string,
  ) => {
    return (
      <div className="mb-8">
        <h2 className={`text-3xl font-bold mb-4 ${teamColor}`}>
          ทีม {teamName}
        </h2>
        {teamIds.length === 0 ? (
          <div className="text-gray-400 italic text-center py-8">
            ยังไม่มีตัวละครในทีมนี้
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamIds.map((id) => {
              const char = getCharacterById(id);
              if (!char) return null;

              const isAttacker = attackerId === char.id;
              const isDefender = defenderId === char.id;
              const isDead = (currentHp?.[char.id] ?? char.status.hp) === 0;
              const isOutOfAp = (currentAp?.[char.id] ?? 0) === 0;

              const highlightClass = isAttacker
                ? "ring-4 ring-yellow-400 bg-yellow-900/20"
                : isDefender
                  ? "ring-4 ring-blue-400 bg-blue-900/20"
                  : "";

              const cardColor = isDead
                ? "border-red-500 bg-red-900/20"
                : isOutOfAp
                  ? "border-gray-500 bg-gray-600/20"
                  : teamName === "A"
                    ? "border-blue-500 bg-blue-900/20"
                    : "border-green-500 bg-green-900/20";

              return (
                <div
                  key={char.id}
                  className={`border-2 p-4 rounded-lg shadow-lg ${cardColor} ${highlightClass}`}
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-600">
                    <Image
                      alt={char.name}
                      src={char.avatar}
                      width={60}
                      height={60}
                      className={`rounded-lg ${isDead ? "grayscale" : ""}`}
                    />
                    <div>
                      <h3 className="text-xl text-amber-400">
                        <span
                          className={isDead ? "line-through text-red-500" : ""}
                        >
                          {char.name}
                        </span>
                      </h3>
                      <p className="text-sm text-gray-300">{char.role}</p>
                      <div className="mt-2 flex gap-2">
                        {isAttacker && (
                          <span className="text-xs bg-yellow-300 text-black px-2 py-0.5 rounded">
                            ผู้โจมตี
                          </span>
                        )}
                        {isDefender && (
                          <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                            ผู้ป้องกัน
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <p className="text-gray-400">Race</p>
                      <p className="font-semibold">
                        <span
                          title={
                            raceData.find((r) => r.name === char.race)
                              ?.description
                          }
                        >
                          {char.race} •
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Class</p>
                      <p className="font-semibold">{char.class}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">HP</p>
                      <p className="font-semibold text-red-400">
                        {currentHp?.[char.id] ?? char.status.hp}
                        {characterStatBoost[char.id] === "hp" && (
                          <span className="text-purple-400 ml-1">(+2)</span>
                        )}
                        {char.race === "Goliath" && (
                          <span className="text-orange-400 ml-1">(+3)</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">AP</p>
                      <p className="font-semibold text-yellow-300">
                        {currentAp?.[char.id] ?? char.status.ap}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">DEF</p>
                      <p className="font-semibold">
                        {getDisplayStat(char.id, "def")} +
                        {characterStatBoost[char.id] === "def" && (
                          <span className="text-purple-400 ml-1">(-1)</span>
                        )}
                        {char.race === "Goliath" && (
                          <span className="text-orange-400 ml-1">(+1)</span>
                        )}
                        {char.race === "Dwarf" && (
                          <span className="text-orange-400 ml-1">(-1)</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Move</p>
                      <p className="font-semibold">
                        {getDisplayStat(char.id, "move")}
                        {characterStatBoost[char.id] === "move" && (
                          <span className="text-purple-400 ml-1">(+1)</span>
                        )}
                        {char.race === "Elf" && (
                          <span className="text-orange-400 ml-1">(+1)</span>
                        )}
                        {char.race === "Dwarf" && (
                          <span className="text-orange-400 ml-1">(-1)</span>
                        )}
                      </p>
                    </div>
                    {/* <div>
                      <p className="text-gray-400">Base AP</p>
                      <p className="font-semibold">{char.status.ap}</p>
                    </div> */}
                  </div>

                  {/* Attack */}
                  <div className="bg-gray-700/50 p-2 rounded text-sm mb-3">
                    <p className="text-xs font-bold text-gray-400 mb-1">
                      Basic Attack
                    </p>
                    <div className="space-y-1">
                      <p>
                        <span>🎯 {getDisplayStat(char.id, "hiton")} +</span>
                        {characterStatBoost[char.id] === "hiton" && (
                          <span className="text-purple-400 ml-1">(-1)</span>
                        )}
                      </p>
                      <p>📏 Range: {char.status.attack.range}"</p>
                      <p className="text-orange-400">
                        💥 DMG: {char.status.attack.damage}
                      </p>
                    </div>
                  </div>

                  {/* Active Statuses */}
                  {((activeStatusBuffs?.[char.id] ?? []) as number[]).length >
                    0 && (
                      <div className="mt-3 mb-3">
                        <p className="text-xs text-gray-400 mb-1">Status</p>
                        <div className="flex gap-2 flex-wrap">
                          {(activeStatusBuffs[char.id] ?? []).map((bid) => {
                            const b = (statusBuffs as StatusBuff[]).find(
                              (s) => s.id === bid,
                            );
                            return (
                              <span
                                key={bid}
                                title={b?.description}
                                className="bg-gray-700 text-sm px-2 py-1 rounded flex items-center gap-2"
                              >
                                <span>{b?.thaiName ?? `#${bid}`}</span>
                                <button
                                  onClick={() => removeStatusBuff(char.id, bid)}
                                  className="text-xs text-red-400 hover:text-red-200"
                                  aria-label="remove-status"
                                >
                                  ✕
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  {/* Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() =>
                        char.skills.length > 0 &&
                        setCardModal({
                          cardImage: char.skills[0].card,
                          characterName: char.name,
                        })
                      }
                      disabled={char.skills.length === 0}
                      className="flex-1 hover:bg-gray-500 border border-gray-500 text-white px-4 py-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      view card
                    </button>

                    {/* Menu button */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === char.id ? null : char.id)
                        }
                        className="w-12 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white px-3 py-2 rounded transition"
                        aria-haspopup="true"
                        aria-expanded={openMenuId === char.id}
                      >
                        ⋯
                        {char.race === "Human" &&
                          !characterStatBoost[char.id] && (
                            <span className="absolute w-3 h-3 rounded-full bg-red-600 -top-1 -right-1" />
                          )}
                      </button>

                      {openMenuId === char.id && (
                        <div className="absolute right-0 mt-2 w-44 bg-gray-800 border border-gray-600 rounded shadow-lg z-50">
                          {char.race === "Human" &&
                            !characterStatBoost[char.id] && (
                              <button
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setStatBoostModal({
                                    characterId: char.id,
                                    characterName: char.name,
                                    race: char.race,
                                  });
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-700 text-purple-400 font-semibold"
                              >
                                ⭐ เพิ่ม Stat
                              </button>
                            )}

                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              setStatusModal({
                                characterId: char.id,
                                characterName: char.name,
                              });
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-700"
                          >
                            ➕ เติมสถานะ
                          </button>
                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              setHpAdjustModal({
                                characterId: char.id,
                                characterName: char.name,
                                currentHp:
                                  currentHp?.[char.id] ?? char.status.hp,
                              });
                              setHpAdjustValue(0);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-700"
                          >
                            ⚙️ ปรับ HP
                          </button>
                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              setDeleteConfirm({
                                characterId: char.id,
                                characterName: char.name,
                                team: teamName as "A" | "B",
                              });
                            }}
                            className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-700"
                          >
                            ลบ
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-center mt-2 gap-2">
                    <button
                      onClick={() => {
                        if (attackerId === char.id) {
                          setAttackerId(null);
                          addNotification(
                            `❎ ยกเลิก ${char.name} เป็นผู้โจมตี`,
                            "info",
                          );
                        } else {
                          setAttackerId(char.id);
                          addNotification(
                            `⚔️ เลือก ${char.name} เป็นผู้โจมตี`,
                            "info",
                          );
                        }
                        setActionPanelVisible(true);
                      }}
                      className="border border-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-black px-4 py-2 rounded font-semibold"
                      disabled={
                        (currentHp?.[char.id] ?? char.status.hp) === 0 ||
                        (currentAp?.[char.id] ?? 0) === 0
                      }
                    >
                      ⚔️
                    </button>

                    <button
                      onClick={() => {
                        if (defenderId === char.id) {
                          setDefenderId(null);
                          addNotification(
                            `❎ ยกเลิก ${char.name} เป็นผู้ป้องกัน`,
                            "info",
                          );
                        } else {
                          setDefenderId(char.id);
                          addNotification(
                            `🛡️ เลือก ${char.name} เป็นผู้ป้องกัน`,
                            "info",
                          );
                        }
                        setActionPanelVisible(true);
                      }}
                      className="border border-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded font-semibold"
                      disabled={(currentHp?.[char.id] ?? char.status.hp) === 0}
                    >
                      🛡️
                    </button>

                    <button
                      onClick={() => {
                        const apLeft = currentAp?.[char.id] ?? 0;
                        if (apLeft === 0) {
                          addNotification(
                            `${char.name} ไม่มี AP เหลืออยู่แล้ว`,
                            "info",
                          );
                          return;
                        }
                        // reduce to zero this turn
                        reduceAp(char.id, apLeft);
                        addNotification(
                          `⏭️ ${char.name} ข้ามเทิร์นนี้ - AP ถูกเซ็ตเป็น 0`,
                          "info",
                        );
                        // if this character was selected as attacker/defender, clear selection
                        if (attackerId === char.id) setAttackerId(null);
                        if (defenderId === char.id) setDefenderId(null);
                        setActionPanelVisible(false);
                      }}
                      className="border border-gray-500 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded font-semibold"
                      disabled={
                        (currentHp?.[char.id] ?? char.status.hp) === 0 ||
                        (currentAp?.[char.id] ?? 0) === 0
                      }
                    >
                      Skip
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto  bg-gray-950/75 px-10 py-5 rounded-lg border border-amber-500 shadow-lg">
        <h1 className="text-4xl font-bold text-amber-400 mb-8 text-center">
          Let's Battle!
        </h1>

        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-300">
            Turn:{" "}
            <span className="font-bold text-black bg-amber-400 rounded-full px-2 py-1">
              {turnNumber}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => endTurn()}
              className="bg-amber-500 hover:bg-amber-600 text-black px-3 py-1 rounded font-semibold"
            >
              End Turn
            </button>
            <button
              onClick={() => resetTurn()}
              className="bg-red-500 hover:bg-red-600 text-black px-3 py-1 rounded font-semibold"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>{renderTeam(teamA, "A", "text-blue-400")}</div>
          <div>{renderTeam(teamB, "B", "text-green-400")}</div>
        </div>

        {/* Summary */}
        <div className="mt-8 bg-gray-800 border border-amber-500 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-amber-400 mb-4">สรุป</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-900/30 border border-blue-500 rounded p-4">
              <p className="text-blue-400 font-semibold">ทีม A</p>
              <p className="text-3xl font-bold text-white">{teamA.length}</p>
              <p className="text-sm text-gray-400">ตัวละคร</p>
            </div>
            <div className="bg-green-900/30 border border-green-500 rounded p-4">
              <p className="text-green-400 font-semibold">ทีม B</p>
              <p className="text-3xl font-bold text-white">{teamB.length}</p>
              <p className="text-sm text-gray-400">ตัวละคร</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card Modal */}
      {/* {cardModal && (
        <CardModal cardModal={cardModal} setCardModal={setCardModal} />
      )} */}

      {/* Action Panel (bottom-left) */}
      {actionPanelVisible && (
        <div
          className={`${changeBattleAction ? "left-4" : "right-4"} fixed bottom-4 z-50`}
        >
          <div className="bg-gray-800 border border-amber-500 rounded-lg p-4 w-auto max-h-[80vh] overflow-auto shadow-xl">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-gray-300">Battle Action</div>
              <div className="flex gap-2 text-sm">
                <button
                  onClick={() => setChangeBattleAction(!changeBattleAction)}
                  className="text-white bg-gray-700 hover:bg-gray-600 rounded px-2 py-1"
                >
                  {changeBattleAction ? "»" : "«"}
                </button>
                <button
                  onClick={() => {
                    setActionPanelVisible(false);
                    setAttackerId(null);
                    setDefenderId(null);
                    setMeleeBonus(false);
                    setGangUp(false);
                    setLightCover(false);
                    setCounterAttack(false);
                    setSelectedSkill(null);
                  }}
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
                    <span
                      className={`${getTeamColorClass(attackerId)} text-xl`}
                    >
                      {getDisplayStat(attackerId, "hiton") +
                        (meleeBonus ? 4 : 0) +
                        getAttackBonus(attackerId) - (gangUp ? 2 : 0)}
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
                    <span
                      className={`${getTeamColorClass(defenderId)} text-xl`}
                    >
                      {getDisplayStat(defenderId, "def") - (lightCover ? 2 : 0)}
                      +
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {attackerId &&
                (getCharacterById(attackerId)?.status.attack.range ?? 0) >
                1 && (
                  <button
                    onClick={() => setMeleeBonus(!meleeBonus)}
                    className={`w-full px-2 py-1 rounded transition text-xs ${meleeBonus
                      ? "bg-gray-600 hover:bg-gray-700 text-white"
                      : " border border-gray-600 hover:bg-gray-700 text-white"
                      }`}
                  >
                    {meleeBonus ? "๏ Melee (+4)" : "Melee"}
                  </button>
                )}
              <button
                onClick={() => setGangUp(!gangUp)}
                className={`w-full px-2 py-1 rounded transition text-xs ${gangUp
                  ? "bg-gray-600 hover:bg-gray-700 text-white"
                  : " border border-gray-600 hover:bg-gray-700 text-white"
                  }`}
              >
                {gangUp ? "๏ Gang up (-2)" : "Gangup"}
              </button>
              <button
                onClick={() => setLightCover(!lightCover)}
                className={`w-full px-2 py-1 rounded transition text-xs ${lightCover
                  ? "bg-gray-600 hover:bg-gray-700 text-white"
                  : " border border-gray-600 hover:bg-gray-700 text-white"
                  }`}
              >
                {lightCover ? "๏ Covered" : "Cover"}
              </button>
              {defenderId && (
                <button
                  onClick={() => setCounterAttack(!counterAttack)}
                  className={`w-full px-2 py-1 rounded transition text-xs ${counterAttack
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : " border border-red-500 hover:bg-red-900/30 text-red-300"
                    }`}
                >
                  {counterAttack ? "๏ Counter" : "Counter"}
                </button>
              )}
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
                        setCardModal({
                          cardImage: skill.card,
                          characterName:
                            getCharacterById(attackerId)?.name || "Unknown",
                        });
                      }}
                      className={`px-2 py-1 rounded text-xs font-semibold transition ${selectedSkill === skill.id
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "border border-purple-500 hover:bg-purple-900/30 text-purple-300"
                        } ${(currentAp[attackerId] ?? 0) < skill.ap
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                        }`}
                      disabled={(currentAp[attackerId] ?? 0) < skill.ap}
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
                  alt={getCharacterById(attackerId)?.skills.find(
                    (s) => s.id === selectedSkill,
                  )?.name || "Skill"}
                  src={getCharacterById(attackerId)?.skills.find(
                    (s) => s.id === selectedSkill,
                  )?.card || ""}
                  width={300}
                  height={600}
                  className="rounded-lg shadow-2xl"
                  priority
                />
                <p className="text-xs text-purple-300 mb-2">
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
                        addNotification(
                          "กรุณาเลือกผู้โจมตีและผู้ป้องกัน",
                          "error",
                        );
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
                      const currentCharAp = currentAp[attackerId] ?? 0;
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
                        setGangUp(false);
                        setLightCover(false);
                        setSelectedSkill(null);
                      }, 2000);
                      setCardModal(null);
                    }}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 disabled:opacity-50 text-white px-3 py-2 rounded transition text-sm font-semibold"
                  >
                    ใช้สกิล
                  </button>
                </div>
              </div>
            )}

            {/* Counter Attack Confirmation */}
            {counterAttack && attackerId && defenderId && (
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
                      💥 DMG:{" "}
                      {getCharacterById(defenderId)?.status.attack.damage}
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
                        addNotification(
                          "กรุณาเลือกผู้โจมตีและผู้ป้องกัน",
                          "error",
                        );
                        return;
                      }
                      setIsAttacking(true);
                      const defender = getCharacterById(defenderId);
                      const attacker = getCharacterById(attackerId);
                      const counterDamage = defender?.status.attack.damage ?? 0;
                      const currentCharHp = currentHp[attackerId] ?? 0;
                      const newHp = Math.max(0, currentCharHp - counterDamage);

                      // Counter attack สำเร็จ - ลด HP ของผู้โจมตี
                      _applyDamageInternal(attackerId, counterDamage);

                      // แจ้งเตือนครั้งเดียว
                      addNotification(
                        `⚡ ${defender?.name} โจมตีกลับ ${attacker?.name}! 💥 DMG: ${counterDamage} (HP: ${newHp})`,
                        "success",
                      );

                      setTimeout(() => {
                        setIsAttacking(false);
                        setMeleeBonus(false);
                        setGangUp(false);
                        setLightCover(false);
                        setCounterAttack(false);
                      }, 2000);
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-900 disabled:opacity-50 text-white px-3 py-2 rounded transition text-sm font-semibold"
                  >
                    โจมตีกลับ
                  </button>
                </div>
              </div>
            )}

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
                  setIsAttacking(true);
                  // Normal successful attack (consume AP inside performAttack)
                  // increment attack count for sequence-based penalty/bonus
                  incrementAttackCount(attackerId as number);
                  performAttack(
                    attackerId as number,
                    defenderId as number,
                    true,
                  );
                  setTimeout(() => {
                    setIsAttacking(false);
                    setMeleeBonus(false);
                    setGangUp(false);
                    setLightCover(false);
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
                  const attackerAp = currentAp[attackerId] ?? 0;
                  if (attackerAp < apCost) {
                    addNotification(
                      `${attacker.name} ไม่มี AP พอสำหรับการโจมตี`,
                      "error",
                    );
                    return;
                  }

                  setIsAttacking(true);
                  // consume AP
                  reduceAp(attackerId, apCost);

                  // increment attack count for sequence-based penalty/bonus
                  incrementAttackCount(attackerId as number);

                  const baseDmg = attacker.status.attack?.damage ?? 0;
                  const critDmg = Math.ceil(baseDmg * 1.5);

                  // apply damage without duplicate notification
                  _applyDamageInternal(defenderId, critDmg);

                  const newHp = Math.max(
                    0,
                    (currentHp[defenderId] ?? 0) - critDmg,
                  );
                  addNotification(
                    `💥 ${attacker.name} โจมตีแบบ Critical → ${getCharacterById(defenderId)?.name}! DMG: ${critDmg} (HP: ${newHp})`,
                    "success",
                  );

                  setTimeout(() => {
                    setIsAttacking(false);
                    setMeleeBonus(false);
                    setGangUp(false);
                    setLightCover(false);
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
                  );
                  setTimeout(() => {
                    setIsAttacking(false);
                    setMeleeBonus(false);
                    setGangUp(false);
                    setLightCover(false);
                  }, 3000);
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:opacity-50 text-white px-3 py-2 rounded transition"
              >
                Failed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HP Adjustment Modal */}
      {hpAdjustModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border-2 border-yellow-500 rounded-lg p-6 max-w-sm w-full shadow-xl">
            <div className="flex justify-between mb-4">
              <h2 className="text-2xl font-bold text-yellow-400">
                ปรับ HP
              </h2>
              <button
                className=" text-white bg-gray-600 hover:bg-gray-700 px-2 rounded"
                onClick={() => {
                  setOpenMenuId(null);
                  resetHp(hpAdjustModal.characterId);
                }}
              >
                reset
              </button>
            </div>
            <p className="text-gray-300">
              <span className="font-bold text-amber-400">
                {hpAdjustModal.characterName}
              </span>
              <br />
              เลือดปัจจุบัน:{" "}
              <span className="text-red-400 font-bold">
                {hpAdjustModal.currentHp}
              </span>
            </p>

            <div className="mb-4">
              <label className="text-sm text-gray-300 block mb-2">
                เพิ่ม/ลดเลือด:
              </label>
              <input
                type="number"
                value={hpAdjustValue}
                onChange={(e) =>
                  setHpAdjustValue(parseInt(e.target.value) || 0)
                }
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-center"
              />
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setHpAdjustValue(hpAdjustValue - 5)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded font-semibold"
              >
                -5
              </button>
              <button
                onClick={() => setHpAdjustValue(hpAdjustValue + 5)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded font-semibold"
              >
                +5
              </button>
            </div>

            <p className="text-sm text-gray-400 mb-4 text-center">
              เลือดสุดท้าย:{" "}
              <span className="font-bold text-white">
                {Math.max(0, hpAdjustModal.currentHp + hpAdjustValue)}
              </span>
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setHpAdjustModal(null)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-semibold transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  if (hpAdjustModal) {
                    const newHp = Math.max(
                      0,
                      hpAdjustModal.currentHp + hpAdjustValue,
                    );
                    adjustHpManual(hpAdjustModal.characterId, newHp);
                  }
                  setHpAdjustModal(null);
                  setHpAdjustValue(0);
                }}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-black px-4 py-2 rounded font-semibold transition"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border-2 border-red-500 rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h2 className="text-2xl font-bold text-red-400 mb-4">
              ยืนยันการลบ
            </h2>
            <p className="text-gray-300 mb-6">
              คุณต้องการลบ{" "}
              <span className="font-bold text-amber-400">
                {deleteConfirm.characterName}
              </span>{" "}
              ออกจากทีม <span className="font-bold">{deleteConfirm.team}</span>{" "}
              หรือไม่
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-semibold transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  removeFromTeam(deleteConfirm.characterId, deleteConfirm.team);
                  setDeleteConfirm(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold transition"
              >
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stat Boost Modal */}
      {statBoostModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border-2 border-purple-500 rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h2 className="text-2xl font-bold text-purple-400 mb-4">
              ⭐ เพิ่ม Stat
            </h2>
            <p className="text-gray-300 mb-6">
              เลือก Stat ที่ต้องการเพิ่มให้{" "}
              <span className="font-bold text-amber-400">
                {statBoostModal.characterName}
              </span>
            </p>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => {
                  applyStatBoost(statBoostModal.characterId, "move");
                  setStatBoostModal(null);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded font-semibold transition text-left"
              >
                <div className="font-bold">Move +1</div>
                <div className="text-xs text-gray-300">ความเร็วเพิ่มขึ้น 1</div>
              </button>

              <button
                onClick={() => {
                  applyStatBoost(statBoostModal.characterId, "hp");
                  setStatBoostModal(null);
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded font-semibold transition text-left"
              >
                <div className="font-bold">HP +2</div>
                <div className="text-xs text-gray-300">เลือดเพิ่มขึ้น 2</div>
              </button>

              <button
                onClick={() => {
                  applyStatBoost(statBoostModal.characterId, "def");
                  setStatBoostModal(null);
                }}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded font-semibold transition text-left"
              >
                <div className="font-bold">Def -1</div>
                <div className="text-xs text-gray-300">ทอยป้องกันลดลง 1</div>
              </button>

              <button
                onClick={() => {
                  applyStatBoost(statBoostModal.characterId, "hiton");
                  setStatBoostModal(null);
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded font-semibold transition text-left"
              >
                <div className="font-bold">Hit On -1</div>
                <div className="text-xs text-gray-300">ทอยแม่นยำลดลง 1</div>
              </button>
            </div>

            <button
              onClick={() => setStatBoostModal(null)}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-semibold transition"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* Status Buff Modal */}
      {statusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border-2 border-purple-500 rounded-lg p-6 max-w-xl w-full shadow-xl">
            <h2 className="text-2xl font-bold text-purple-400 mb-4">
              เลือกสถานะให้ {statusModal.characterName}
            </h2>
            <p className="text-gray-300 mb-4">
              เลือก action / buff / debuff จากรายการ
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 max-h-80 overflow-auto">
              {(statusBuffs as any[]).map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    addStatusBuff(statusModal.characterId, s.id);
                    setStatusModal(null);
                  }}
                  className="w-full text-left bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded transition"
                >
                  <div className="flex gap-2">
                    <Image
                      src={s.image}
                      alt={s.thaiName}
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                    <div>
                      <div className="font-bold text-white">
                        <div>
                          {s.thaiName}{" "}
                          <span className="text-xs text-gray-300">
                            ({s.engName})
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {s.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStatusModal(null)}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-semibold transition"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* Notifications */}
      <Notification notifications={notifications} />
    </div>
  );
}
