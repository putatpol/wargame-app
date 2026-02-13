"use client";

import Image from "next/image";
import characterData from "@/data/character.json";
import { Character } from "@/interface/character";
import { useTeam } from "@/context/TeamContext";
import React from "react";

export default function TeamsPage() {
  const characters = characterData as Character[];
  const {
    teamA,
    teamB,
    removeFromTeam,
    currentHp,
    currentAp,
    performAttack,
    addNotification,
    resetHp,
    turnNumber,
    endTurn,
    notifications,
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

  const getCharacterById = (id: number) =>
    characters.find((char) => char.id === id);

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
              
              const highlightClass = isAttacker
                ? "ring-4 ring-yellow-400 bg-yellow-900/20"
                : isDefender
                  ? "ring-4 ring-blue-400 bg-blue-900/20"
                  : "";
              
              const cardColor = isDead
                ? "border-red-500 bg-red-900/20"
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
                      className="rounded-lg"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-amber-400">
                        {char.name}
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
                      <p className="text-gray-400">Tribe</p>
                      <p className="font-semibold">{char.tribe}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Class</p>
                      <p className="font-semibold">{char.class}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">HP</p>
                      <p className="font-semibold text-red-400">
                        {currentHp?.[char.id] ?? char.status.hp}
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
                      <p className="font-semibold">{char.status.def}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Move</p>
                      <p className="font-semibold">{char.status.move}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">AP</p>
                      <p className="font-semibold">{char.status.ap}</p>
                    </div>
                  </div>

                  {/* Attack */}
                  <div className="bg-gray-700/50 p-2 rounded text-sm mb-3">
                    <p className="text-xs font-bold text-gray-400 mb-1">
                      Basic Attack
                    </p>
                    <div className="space-y-1">
                      <p>🎯 {char.status.attack.hitOn}</p>
                      <p>📏 Range: {char.status.attack.range}</p>
                      <p className="text-orange-400">
                        💥 DMG: {char.status.attack.damage}
                      </p>
                    </div>
                  </div>

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
                      </button>

                      {openMenuId === char.id && (
                        <div className="absolute right-0 mt-2 w-44 bg-gray-800 border border-gray-600 rounded shadow-lg z-50">
                          <button
                            onClick={() => {
                              setOpenMenuId(null);
                              resetHp(char.id);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-700"
                          >
                            รีเซทเลือด
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
                            className="w-full text-left px-4 py-2 hover:bg-gray-700"
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
                      disabled={(currentHp?.[char.id] ?? char.status.hp) === 0}
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
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-amber-400 mb-8 text-center">
          รายการทีม
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
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>{renderTeam(teamA, "A", "text-blue-400")}</div>
          <div>{renderTeam(teamB, "B", "text-green-400")}</div>
        </div>

        {/* Battle Panel */}
        {/* <div className="mt-8 bg-gray-800 border border-amber-500 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-amber-400 mb-4">
            สมรภูมิ (Battle)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="text-sm text-gray-300">ผู้โจมตี</label>
              <select
                value={attackerId ?? ""}
                onChange={(e) =>
                  setAttackerId(
                    e.target.value ? parseInt(e.target.value) : null,
                  )
                }
                className="w-full mt-2 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value="">-- เลือกผู้โจมตี --</option>
                {[...teamA, ...teamB].map((id) => {
                  const c = getCharacterById(id);
                  if (!c) return null;
                  const teamLabel = teamA.includes(id) ? "A" : "B";
                  return (
                    <option key={id} value={id}>
                      {c.name} (ทีม {teamLabel}) — HP:{" "}
                      {currentHp?.[id] ?? c.status.hp}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-300">ผู้ป้องกัน</label>
              <select
                value={defenderId ?? ""}
                onChange={(e) =>
                  setDefenderId(
                    e.target.value ? parseInt(e.target.value) : null,
                  )
                }
                className="w-full mt-2 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value="">-- เลือกผู้ป้องกัน --</option>
                {[...teamA, ...teamB].map((id) => {
                  const c = getCharacterById(id);
                  if (!c) return null;
                  const teamLabel = teamA.includes(id) ? "A" : "B";
                  return (
                    <option key={id} value={id}>
                      {c.name} (ทีม {teamLabel}) — HP:{" "}
                      {currentHp?.[id] ?? c.status.hp}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                disabled={isAttacking}
                onClick={() => {
                  if (!attackerId || !defenderId)
                    return addNotification(
                      "กรุณาเลือกผู้โจมตีและผู้ป้องกัน",
                      "error",
                    );
                  if (attackerId === defenderId)
                    return addNotification("ไม่สามารถโจมตีตัวเองได้", "error");
                  const atk = getCharacterById(attackerId);
                  if (!atk) return;
                  setIsAttacking(true);
                  performAttack(
                    attackerId as number,
                    defenderId as number,
                    true,
                  );
                  setTimeout(() => setIsAttacking(false), 3000);
                  // ปิด dialog หากผู้โจมตีไม่มี AP เหลือ
                  if ((currentAp[attackerId] ?? 0) <= 0) {
                    setActionPanelVisible(false);
                  }
                }}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-900 disabled:opacity-50 text-white px-4 py-2 rounded font-semibold transition"
              >
                โจมตีสำเร็จ
              </button>
              <button
                disabled={isAttacking}
                onClick={() => {
                  if (!attackerId || !defenderId)
                    return addNotification(
                      "กรุณาเลือกผู้โจมตีและผู้ป้องกัน",
                      "error",
                    );
                  if (attackerId === defenderId)
                    return addNotification("ไม่สามารถโจมตีตัวเองได้", "error");
                  setIsAttacking(true);
                  performAttack(
                    attackerId as number,
                    defenderId as number,
                    false,
                  );
                  setTimeout(() => setIsAttacking(false), 3000);
                  // ปิด dialog หากผู้โจมตีไม่มี AP เหลือ
                  if ((currentAp[attackerId] ?? 0) <= 0) {
                    setActionPanelVisible(false);
                  }
                }}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:opacity-50 text-white px-4 py-2 rounded font-semibold transition"
              >
                โจมตีพลาด
              </button>
            </div>
          </div>
        </div> */}

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
      {cardModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
          onClick={() => setCardModal(null)}
        >
          <div
            className="relative max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setCardModal(null)}
              className="absolute -top-3 -right-3 bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center z-10"
            >
              ✕
            </button>
            <Image
              alt={cardModal.characterName}
              src={cardModal.cardImage}
              width={400}
              height={600}
              className="rounded-lg shadow-2xl"
              priority
            />
            <p className="text-center text-white mt-4 font-semibold">
              {cardModal.characterName}
            </p>
          </div>
        </div>
      )}

      {/* Action Panel (bottom-right) */}
      {actionPanelVisible && (
        <div className="fixed left-4 bottom-4 z-50">
          <div className="bg-gray-800 border border-amber-500 rounded-lg p-4 w-80 shadow-xl">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-gray-300">Battle Action</div>
              <button
                onClick={() => {
                  setActionPanelVisible(false);
                  setAttackerId(null);
                  setDefenderId(null);
                }}
                className="text-white bg-gray-700 hover:bg-gray-600 rounded px-2 py-1"
              >
                ✕
              </button>
            </div>
            <div className="text-sm text-gray-200 mb-3">
              <div>
                ผู้โจมตี:{" "}
                <b className="text-amber-300">
                  {attackerId ? getCharacterById(attackerId)?.name : "-"}
                </b>
              </div>
              <div>
                ผู้ป้องกัน:{" "}
                <b className="text-amber-300">
                  {defenderId ? getCharacterById(defenderId)?.name : "-"}
                </b>
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
                  if (attackerId === defenderId) {
                    addNotification("ไม่สามารถโจมตีตัวเองได้", "error");
                    return;
                  }
                  setIsAttacking(true);
                  performAttack(
                    attackerId as number,
                    defenderId as number,
                    true,
                  );
                  setTimeout(() => setIsAttacking(false), 3000);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-900 disabled:opacity-50 text-white px-3 py-2 rounded transition"
              >
                โจมตีสำเร็จ
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
                  performAttack(
                    attackerId as number,
                    defenderId as number,
                    false,
                  );
                  setTimeout(() => setIsAttacking(false), 3000);
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:opacity-50 text-white px-3 py-2 rounded transition"
              >
                โจมตีพลาด
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

      {/* Notifications */}
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 space-y-2 max-w-md z-40">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`p-4 rounded-lg text-white shadow-lg animate-fade-in-up ${
              notif.type === "success"
                ? "bg-green-600"
                : notif.type === "error"
                  ? "bg-red-600"
                  : "bg-blue-600"
            }`}
          >
            {notif.message}
          </div>
        ))}
      </div>
    </div>
  );
}
