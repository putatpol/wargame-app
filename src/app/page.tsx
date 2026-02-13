"use client";

import Image from "next/image";
import characterData from "../data/character.json";
import React from "react";
import { Character } from "@/interface/character";
import { useTeam } from "@/context/TeamContext";

export default function Home() {
  const characters = characterData as Character[];
  const { selectedTeamByCharacter, addToTeam, removeFromTeam, isTeamDisabled, addRandomCharacters, resetTeams, notifications } =
    useTeam();
  const [randomCount, setRandomCount] = React.useState(5);
  const [cardModal, setCardModal] = React.useState<{
    cardImage: string;
    characterName: string;
  } | null>(null);

  const handleTeamClick = (characterId: number, team: "A" | "B") => {
    const currentTeam = selectedTeamByCharacter[characterId];

    // ถ้าคลิกปุ่มเดิมที่อยู่ ให้ลบออก
    if (currentTeam === team) {
      removeFromTeam(characterId, team);
    } else {
      // ถ้าclickปุ่มใหม่ ให้เพิ่มเข้าทีมใหม่
      addToTeam(characterId, team);
    }
  };

  return (
    <div className="p-4">
      {/* Random Section */}
      <div className="max-w-2xl mx-auto mb-8 bg-gray-800 border border-amber-500 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-amber-400 mb-4">สุ่มตัวละคร</h2>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              จำนวนตัวละครต่อทีม
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={randomCount}
              onChange={(e) => setRandomCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            />
          </div>
        <div className="flex gap-4 items-end flex-wrap mt-4 justify-center">
          <button
            onClick={() => addRandomCharacters(randomCount, "A")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold transition"
          >
            🎲 Random ทีม A
          </button>
          <button
            onClick={() => addRandomCharacters(randomCount, "B")}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold transition"
          >
            🎲 Random ทีม B
          </button>
          <button
            onClick={resetTeams}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold transition"
          >
            🔄 รีเซท
          </button>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-900 text-white">
        {characters.map((char) => (
          <div
            key={char.id}
            className="border border-amber-500 p-4 rounded-lg bg-gray-800 shadow-xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-600 pb-2 mb-3">
              <Image
                alt="avatar"
                src={char.avatar}
                width={50}
                height={50}
                className="rounded-xl"
              />
              <h2 className="text-xl font-bold text-amber-400">{char.name}</h2>
              <span className="text-sm bg-amber-700 px-2 py-1 rounded">
                {char.role}
              </span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 text-sm mb-4">
              <p>
                🧬 Tribe: <b>{char.tribe}</b>
              </p>
              <p>
                ⚔️ Class: <b>{char.class}</b>
              </p>
              <p>
                ❤️ HP: <b className="text-red-400">{char.status.hp}</b>
              </p>
              <p>
                🛡️ DEF: <b>{char.status.def}</b>
              </p>
              <p>
                🏃 Move: <b>{char.status.move}</b>
              </p>
              <p>
                ⚡ AP: <b>{char.status.ap}</b>
              </p>
            </div>

            {/* Attack Section */}
            <div className="bg-gray-700 p-2 rounded mb-3">
              <p className="text-xs font-bold uppercase text-gray-400">
                Basic Attack
              </p>
              <div className="flex justify-between text-sm">
                <span>🎯 Hit: {char.status.attack.hitOn}</span>
                <span>📏 Range: {char.status.attack.range}</span>
                <span className="text-orange-400">
                  💥 DMG: {char.status.attack.damage}
                </span>
              </div>
            </div>

            {/* Skills Section */}
            <div className="mb-3">
              <p className="text-xs font-bold uppercase text-gray-400 mb-1">
                Skills
              </p>
              {char.skills.map((skill, index) => (
                <div
                  key={index}
                  className="text-sm pl-2 border-l-2 border-amber-500 italic"
                >
                  {skill.name} (AP: {skill.ap} | Hit: {skill.hitOn} | Range:{" "}
                  {skill.range})
                </div>
              ))}
            </div>

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
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🎴 Card
              </button>
              <button
                onClick={() => handleTeamClick(char.id, "A")}
                disabled={isTeamDisabled(char.id, "A")}
                className={`flex-1 px-4 py-2 rounded text-white font-semibold ${
                  selectedTeamByCharacter[char.id] === "A"
                    ? "bg-blue-700"
                    : "bg-blue-600 hover:bg-blue-700"
                } ${
                  isTeamDisabled(char.id, "A")
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:cursor-pointer"
                }`}
              >
                + A
              </button>
              <button
                onClick={() => handleTeamClick(char.id, "B")}
                disabled={isTeamDisabled(char.id, "B")}
                className={`flex-1 px-4 py-2 rounded text-white font-semibold ${
                  selectedTeamByCharacter[char.id] === "B"
                    ? "bg-green-700"
                    : "bg-green-600 hover:bg-green-700"
                } ${
                  isTeamDisabled(char.id, "B")
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:cursor-pointer"
                }`}
              >
                + B
              </button>
            </div>
          </div>
        ))}
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

      {/* Notifications */}
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 space-y-2 max-w-md">
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
