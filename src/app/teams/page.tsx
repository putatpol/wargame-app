"use client";

import characterData from "@/data/character.json";
import statusBuffs from "@/data/statusBuff.json";
import raceData from "@/data/race.json";
import { Character } from "@/interface/character";
import { useTeam } from "@/context/TeamContext";
import React from "react";
import { StatusBuff } from "@/interface/status";
import Notification from "@/components/Notification";
import CardModal from "@/components/CardModal";
import TeamSection from "@/components/teams/TeamSection";
import BattleActionPanel from "@/components/teams/BattleActionPanel";
import HpAdjustModal from "@/components/teams/HpAdjustModal";
import DeleteConfirmDialog from "@/components/teams/DeleteConfirmDialog";
import StatBoostModal from "@/components/teams/StatBoostModal";
import StatusBuffModal from "@/components/teams/StatusBuffModal";

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
  const [damageBonus, setDamageBonus] = React.useState(false);
  const [gangUp, setGangUp] = React.useState(false);
  const [lightCover, setLightCover] = React.useState(false);
  const [counterAttack, setCounterAttack] = React.useState(false);
  const [attackFree, setAttackFree] = React.useState(false);
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
  const [attackCounts, setAttackCounts] = React.useState<
    Record<number, number>
  >({});
  const [score_A, setScore_A] = React.useState(0);
  const [score_B, setScore_B] = React.useState(0);

  const isAttackDisabledByBuff = (characterId: number): boolean => {
    const buffs = activeStatusBuffs[characterId];
    if (!buffs || buffs.length === 0) {
      return false;
    }

    const disablingBuffEngNames = ["fearful", "frozen", "prone"];

    return buffs.some((buffId) => {
      const buff = statusBuffs.find((b) => b.id === buffId);
      return buff ? disablingBuffEngNames.includes(buff.engName) : false;
    });
  };

  const incrementAttackCount = (characterId: number) => {
    if (attackFree) return;
    setAttackCounts((prev) => ({
      ...(prev ?? {}),
      [characterId]: (prev?.[characterId] ?? 0) + 1,
    }));
  };

  const getAttackBonus = (characterId?: number | null) => {
    if (characterId == null) return 0;
    if (attackFree) return 0;

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

  const handleToggleAttacker = (char: Character) => {
    if (attackerId === char.id) {
      setAttackerId(null);
      addNotification(`❎ ยกเลิก ${char.name} เป็นผู้โจมตี`, "info");
    } else {
      setAttackerId(char.id);
      addNotification(`⚔️ เลือก ${char.name} เป็นผู้โจมตี`, "info");
    }
    setActionPanelVisible(true);
  };

  const handleToggleDefender = (char: Character) => {
    if (defenderId === char.id) {
      setDefenderId(null);
      addNotification(`❎ ยกเลิก ${char.name} เป็นผู้ป้องกัน`, "info");
    } else {
      setDefenderId(char.id);
      addNotification(`🛡️ เลือก ${char.name} เป็นผู้ป้องกัน`, "info");
    }
    setActionPanelVisible(true);
  };

  const handleSkipTurn = (char: Character) => {
    const apLeft = currentAp?.[char.id] ?? 0;
    if (apLeft === 0) {
      addNotification(`${char.name} ไม่มี AP เหลืออยู่แล้ว`, "info");
      return;
    }
    // reduce to zero this turn
    reduceAp(char.id, apLeft);
    addNotification(`⏭️ ${char.name} ข้ามเทิร์นนี้ - AP ถูกเซ็ตเป็น 0`, "info");
    // if this character was selected as attacker/defender, clear selection
    if (attackerId === char.id) setAttackerId(null);
    if (defenderId === char.id) setDefenderId(null);
    setActionPanelVisible(false);
  };

  const handleToggleMenu = (characterId: number) => {
    setOpenMenuId(openMenuId === characterId ? null : characterId);
  };

  const handleViewCard = (char: Character) => {
    if (char.skills.length === 0) return;
    setCardModal({
      cardImage: char.skills[0].card,
      characterName: char.name,
    });
  };

  const handleOpenStatBoost = (char: Character) => {
    setOpenMenuId(null);
    setStatBoostModal({
      characterId: char.id,
      characterName: char.name,
      race: char.race,
    });
  };

  const handleOpenStatusModal = (char: Character) => {
    setOpenMenuId(null);
    setStatusModal({
      characterId: char.id,
      characterName: char.name,
    });
  };

  const handleOpenHpAdjust = (modal: {
    characterId: number;
    characterName: string;
    currentHp: number;
  }) => {
    setOpenMenuId(null);
    setHpAdjustModal(modal);
    setHpAdjustValue(0);
  };

  const handleConfirmDelete = (modal: {
    characterId: number;
    characterName: string;
    team: "A" | "B";
  }) => {
    setOpenMenuId(null);
    setDeleteConfirm(modal);
  };

  const handleCloseActionPanel = () => {
    setActionPanelVisible(false);
    setAttackerId(null);
    setDefenderId(null);
    setMeleeBonus(false);
    setDamageBonus(false);
    setGangUp(false);
    setLightCover(false);
    setCounterAttack(false);
    setAttackFree(false);
    setSelectedSkill(null);
  };

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto  bg-gray-950/75 px-10 py-5 rounded-lg border border-amber-500 shadow-lg">
        <div className="grid grid-cols-1 xl:grid-cols-3 items-center mb-4">
          <div />
          <h1 className="text-4xl font-bold text-amber-400 mb-8 text-center">
            Let's Battle!
          </h1>
          <div className="flex gap-2 items-center justify-between md:justify-end">
            <div className="text-sm text-gray-300">
              Turn:{" "}
              <span className="font-bold text-black bg-amber-400 rounded-full px-3 py-1">
                {turnNumber}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => endTurn()}
                className="bg-amber-500 hover:bg-amber-600 text-black px-3 py-1 rounded"
              >
                End Turn
              </button>
              <button
                onClick={() => {
                  resetTurn();
                  setAttackCounts({});
                }}
                className="bg-red-500 hover:bg-red-600 text-black px-3 py-1 rounded"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <TeamSection
              teamIds={teamA}
              teamName="A"
              teamColor="text-blue-400"
              score={score_A}
              setScore={setScore_A}
              getCharacterById={getCharacterById}
              currentHp={currentHp}
              currentAp={currentAp}
              attackerId={attackerId}
              defenderId={defenderId}
              openMenuId={openMenuId}
              activeStatusBuffs={activeStatusBuffs}
              statusBuffs={statusBuffs as StatusBuff[]}
              raceData={raceData}
              characterStatBoost={characterStatBoost}
              isAttackDisabledByBuff={isAttackDisabledByBuff}
              getDisplayStat={getDisplayStat}
              removeStatusBuff={removeStatusBuff}
              onViewCard={handleViewCard}
              onToggleMenu={handleToggleMenu}
              onOpenStatBoost={handleOpenStatBoost}
              onOpenStatusModal={handleOpenStatusModal}
              onOpenHpAdjust={handleOpenHpAdjust}
              onConfirmDelete={handleConfirmDelete}
              onToggleAttacker={handleToggleAttacker}
              onToggleDefender={handleToggleDefender}
              onSkipTurn={handleSkipTurn}
            />
          </div>
          <div>
            <TeamSection
              teamIds={teamB}
              teamName="B"
              teamColor="text-green-400"
              score={score_B}
              setScore={setScore_B}
              getCharacterById={getCharacterById}
              currentHp={currentHp}
              currentAp={currentAp}
              attackerId={attackerId}
              defenderId={defenderId}
              openMenuId={openMenuId}
              activeStatusBuffs={activeStatusBuffs}
              statusBuffs={statusBuffs as StatusBuff[]}
              raceData={raceData}
              characterStatBoost={characterStatBoost}
              isAttackDisabledByBuff={isAttackDisabledByBuff}
              getDisplayStat={getDisplayStat}
              removeStatusBuff={removeStatusBuff}
              onViewCard={handleViewCard}
              onToggleMenu={handleToggleMenu}
              onOpenStatBoost={handleOpenStatBoost}
              onOpenStatusModal={handleOpenStatusModal}
              onOpenHpAdjust={handleOpenHpAdjust}
              onConfirmDelete={handleConfirmDelete}
              onToggleAttacker={handleToggleAttacker}
              onToggleDefender={handleToggleDefender}
              onSkipTurn={handleSkipTurn}
            />
          </div>
        </div>

        {/* Summary */}
        <div className="mt-8 bg-gray-800 border border-amber-500 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-amber-400 mb-4">สรุป</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-900/30 border border-blue-500 rounded p-4">
              <p className="text-blue-400 font-semibold">Team A</p>
              <p className="text-3xl font-bold text-white">{teamA.length}</p>
              <p className="text-sm text-gray-400">ตัวละคร</p>
            </div>
            <div className="bg-green-900/30 border border-green-500 rounded p-4">
              <p className="text-green-400 font-semibold">Team B</p>
              <p className="text-3xl font-bold text-white">{teamB.length}</p>
              <p className="text-sm text-gray-400">ตัวละคร</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card Modal */}
      {cardModal && (
        <CardModal cardModal={cardModal} setCardModal={setCardModal} />
      )}

      {/* Action Panel (bottom-left) */}
      {actionPanelVisible && (
        <BattleActionPanel
          changeBattleAction={changeBattleAction}
          onToggleSide={() => setChangeBattleAction(!changeBattleAction)}
          onClose={handleCloseActionPanel}
          attackerId={attackerId}
          defenderId={defenderId}
          getCharacterById={getCharacterById}
          getTeamColorClass={getTeamColorClass}
          getDisplayStat={getDisplayStat}
          getAttackBonus={getAttackBonus}
          currentAp={currentAp}
          currentHp={currentHp}
          turnNumber={turnNumber}
          meleeBonus={meleeBonus}
          setMeleeBonus={setMeleeBonus}
          damageBonus={damageBonus}
          setDamageBonus={setDamageBonus}
          gangUp={gangUp}
          setGangUp={setGangUp}
          lightCover={lightCover}
          setLightCover={setLightCover}
          counterAttack={counterAttack}
          setCounterAttack={setCounterAttack}
          attackFree={attackFree}
          setAttackFree={setAttackFree}
          selectedSkill={selectedSkill}
          setSelectedSkill={setSelectedSkill}
          isAttacking={isAttacking}
          setIsAttacking={setIsAttacking}
          addNotification={addNotification}
          reduceAp={reduceAp}
          performAttack={performAttack}
          incrementAttackCount={incrementAttackCount}
          applyDamageInternal={_applyDamageInternal}
          onClearCardModal={() => setCardModal(null)}
        />
      )}

      {/* HP Adjustment Modal */}
      {hpAdjustModal && (
        <HpAdjustModal
          modal={hpAdjustModal}
          hpAdjustValue={hpAdjustValue}
          setHpAdjustValue={setHpAdjustValue}
          onReset={(characterId) => {
            setOpenMenuId(null);
            resetHp(characterId);
          }}
          onClose={() => setHpAdjustModal(null)}
          onConfirm={(characterId, newHp) => {
            adjustHpManual(characterId, newHp);
            setHpAdjustModal(null);
            setHpAdjustValue(0);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <DeleteConfirmDialog
          data={deleteConfirm}
          onCancel={() => setDeleteConfirm(null)}
          onConfirm={(data) => {
            removeFromTeam(data.characterId, data.team);
            setDeleteConfirm(null);
          }}
        />
      )}

      {/* Stat Boost Modal */}
      {statBoostModal && (
        <StatBoostModal
          data={statBoostModal}
          onApply={(characterId, statType) => {
            applyStatBoost(characterId, statType);
            setStatBoostModal(null);
          }}
          onClose={() => setStatBoostModal(null)}
        />
      )}

      {/* Status Buff Modal */}
      {statusModal && (
        <StatusBuffModal
          data={statusModal}
          statusBuffs={statusBuffs as StatusBuff[]}
          onSelectBuff={(characterId, buffId) => {
            addStatusBuff(characterId, buffId);
            setStatusModal(null);
          }}
          onClose={() => setStatusModal(null)}
        />
      )}

      {/* Notifications */}
      <Notification notifications={notifications} />
    </div>
  );
}
